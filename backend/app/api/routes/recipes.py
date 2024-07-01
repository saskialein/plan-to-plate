from typing import Any, List
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Request
from app.api.deps import CurrentUser, SessionDep
from app.models import RecipeCreate, RecipeUpdate, RecipeOut, RecipesOut, Message, CommentCreate, Comment, CommentOut
from app import crud
from app.utils import upload_file_to_b2, get_download_authorization, fetch_html_content, parse_open_graph_data
from app.core.config import settings
from app.core.vector_db_services import process_and_store_in_vector_db

router = APIRouter()

@router.post("/", response_model=RecipeOut)
async def create_recipe(
    request: Request,
    session: SessionDep,
    current_user: CurrentUser
) -> Any:
    """
    Create new recipe.
    """
    form = await request.form()
    data = dict(form)

    title = data.get('title')
    url = data.get('url')
    description = data.get('description')
    store_in_vector_db = data.get('storeInVectorDb', False)
    comment = data.get('comment')
    
    file_url = None
    file: UploadFile = form.get('file')
    if file:
        # Upload the file to the bucket
        file_url = upload_file_to_b2(file.file, file.filename)
    
    recipe_in = RecipeCreate(
        title=title,
        url=url,
        file_path=file_url,
        description=description,
        store_in_vector_db=store_in_vector_db,
        comment=comment
    )
    
    recipe = crud.create_recipe(db=session, recipe_in=recipe_in, user_id=current_user.id)
    
    if store_in_vector_db:
        source = url if url else file_url
        metadata = {
            'title': title,
            'source': source,  # Use source for both URL and file_path
            'language': 'en',
        }
        process_and_store_in_vector_db(file_path=file_url, url=url, metadata=metadata)
        
    print("Created Recipe:", recipe)
    return recipe

@router.get("/{recipe_id}", response_model=RecipeOut)
def read_recipe(
    *,
    session: SessionDep,
    recipe_id: int,
    current_user: CurrentUser
) -> Any:
    """
    Get a recipe by ID.
    """
    recipe = crud.get_recipe(db=session, recipe_id=recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    if recipe.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return recipe

@router.get("/", response_model=RecipesOut)
def read_recipes(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Retrieve recipes.
    """
    recipes = crud.get_recipes(db=session, user_id=current_user.id, skip=skip, limit=limit)
    return RecipesOut(data=recipes, count=len(recipes))

@router.put("/{recipe_id}", response_model=RecipeOut)
def update_recipe(
    *,
    session: SessionDep,
    recipe_id: int,
    recipe_in: RecipeUpdate,
    current_user: CurrentUser,
) -> Any:
    """
    Update a recipe.
    """
    recipe = crud.get_recipe(db=session, recipe_id=recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    if recipe.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    recipe = crud.update_recipe(db=session, db_recipe=recipe, recipe_in=recipe_in)
    return recipe

@router.delete("/{recipe_id}")
def delete_recipe(
    *,
    session: SessionDep,
    recipe_id: int,
    current_user: CurrentUser,
) -> Message:
    """
    Delete a recipe.
    """
    recipe = crud.get_recipe(db=session, recipe_id=recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    if recipe.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    crud.delete_recipe(db=session, db_recipe=recipe)
    return Message(message="Recipe deleted successfully")

class FileRequest(BaseModel):
    file_name: str

@router.post("/generate-signed-url")
def generate_signed_url_endpoint(file_request: FileRequest, current_user: CurrentUser):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        auth_token = get_download_authorization()
        signed_url = f"https://f002.backblazeb2.com/file/{settings.B2_BUCKET_NAME}/recipes/{file_request.file_name}?Authorization={auth_token}"
        return {"signed_url": signed_url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


class URLRequest(BaseModel):
    url: str
    
@router.post("/fetch-opengraph")
async def fetch_opengraph(data: URLRequest):
    try:
        html_content = await fetch_html_content(data.url)
        og_data = parse_open_graph_data(html_content)
        return og_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{recipe_id}/comments", response_model=CommentOut)
def add_comment(
    *,
    session: SessionDep,
    recipe_id: int,
    content: str = Form(...),
    current_user: CurrentUser
) -> Any:
    """
    Add a comment to a recipe.
    """
    comment_in = CommentCreate(content=content)
    comment = crud.add_comment(db=session, comment_in=comment_in, recipe_id=recipe_id, user_id=current_user.id)
    return comment

@router.delete("/comments/{comment_id}")
def delete_comment(
    *,
    session: SessionDep,
    comment_id: int,
    current_user: CurrentUser,
) -> Message:
    """
    Delete a comment from a recipe.
    """
    comment = session.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    crud.delete_comment(db=session, comment_id=comment_id, user_id=current_user.id)
    return Message(message="Comment deleted successfully")