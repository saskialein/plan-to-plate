from typing import Any, List
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app.api.deps import CurrentUser, SessionDep
from app.models import Recipe, RecipeCreate, RecipeUpdate, RecipeOut, RecipesOut, User
from app import crud
from app.utils import upload_file_to_b2, generate_signed_url
from bs4 import BeautifulSoup
import requests

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

@router.delete("/{recipe_id}", response_model=RecipeOut)
def delete_recipe(
    *,
    session: SessionDep,
    recipe_id: int,
    current_user: CurrentUser,
) -> Any:
    """
    Delete a recipe.
    """
    recipe = crud.get_recipe(db=session, recipe_id=recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    if recipe.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    crud.delete_recipe(db=session, db_recipe=recipe)
    return {"message": "Recipe deleted successfully"}

# class FileRequest(BaseModel):
#     file_name: str

# @router.post("/generate-signed-url")
# def generate_signed_url_endpoint(file_request: FileRequest, current_user: CurrentUser):
#     print(file_request.file_name)
#     if not current_user:
#         raise HTTPException(status_code=401, detail="Not authenticated")

#     try:
#         signed_url = generate_signed_url(file_request.file_name)
#         return {"signed_url": signed_url}
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=str(e))

async def fetch_html_content(url: str) -> str:
  response = requests.get(url)
  if response.status_code == 200:
    return response.text
  else:
    raise Exception(f"Failed to fetch HTML content from {url}")

        
def parse_open_graph_data(html: str) -> dict:
    soup = BeautifulSoup(html, 'html.parser')
    meta_tags = soup.find_all('meta')

    metadata = {}

    for tag in meta_tags:
        if 'name' in tag.attrs:
            name = tag.attrs['name']
            content = tag.attrs.get('content', '')
            metadata[name] = content
        elif 'property' in tag.attrs:
            property = tag.attrs['property']
            content = tag.attrs.get('content', '')
            metadata[property] = content
    
    return metadata


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