from typing import Any
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app.api.deps import CurrentUser, SessionDep
from app.models import RecipeCreate, RecipeUpdate, RecipeOut, RecipesOut, Message
from app import crud
from app.utils import upload_file_to_b2, get_download_authorization, fetch_html_content, parse_open_graph_data

router = APIRouter()

@router.post("/", response_model=RecipeOut)
def create_recipe(
    *,
    session: SessionDep,
    title: str = Form(...),
    url: str = Form(None),
    file: UploadFile = File(None),
    current_user: CurrentUser
) -> Any:
    """
    Create new recipe.
    """
    if not url and not file:
        raise HTTPException(status_code=400, detail="Either 'url' or 'file' must be provided.")
    
    file_url = None
    if file:
        # Upload the file to the bucket
        file_url = upload_file_to_b2(file.file, file.filename)
    
    recipe_in = RecipeCreate(title=title, url=url, file_path=file_url)
    recipe = crud.create_recipe(db=session, recipe_in=recipe_in, user_id=current_user.id)
    # TODO: Add logic to store recipe in vector database
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
        signed_url = f"https://f002.backblazeb2.com/file/plan-to-plate/recipes/{file_request.file_name}?Authorization={auth_token}"
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