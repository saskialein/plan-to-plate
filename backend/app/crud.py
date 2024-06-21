from typing import Any, List, Optional

from sqlmodel import Session, select

from app.core.security import get_password_hash, verify_password
from app.models import Item, ItemCreate, User, UserCreate, UserUpdate, RecipeCreate, Recipe, RecipeUpdate, Comment, CommentCreate
from app.utils import delete_file_from_b2

def create_user(*, session: Session, user_create: UserCreate) -> User:
    db_obj = User.model_validate(
        user_create, update={"hashed_password": get_password_hash(user_create.password)}
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_user(*, session: Session, db_user: User, user_in: UserUpdate) -> Any:
    user_data = user_in.model_dump(exclude_unset=True)
    extra_data = {}
    if "password" in user_data:
        password = user_data["password"]
        hashed_password = get_password_hash(password)
        extra_data["hashed_password"] = hashed_password
    db_user.sqlmodel_update(user_data, update=extra_data)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def get_user_by_email(*, session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    session_user = session.exec(statement).first()
    return session_user


def authenticate(*, session: Session, email: str, password: str) -> User | None:
    db_user = get_user_by_email(session=session, email=email)
    if not db_user:
        return None
    if not verify_password(password, db_user.hashed_password):
        return None
    return db_user


def create_item(*, session: Session, item_in: ItemCreate, owner_id: int) -> Item:
    db_item = Item.model_validate(item_in, update={"owner_id": owner_id})
    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    return db_item

def create_recipe(db: Session, recipe_in: RecipeCreate, user_id: int) -> Recipe:
    comments_data = recipe_in.comments
    recipe_data = recipe_in.dict(exclude={"comments"})
    db_recipe = Recipe(**recipe_data, owner_id=user_id)
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)
    
    for comment_data in comments_data:
        db_comment = Comment(**comment_data.dict(), recipe_id=db_recipe.id, user_id=user_id)
        db.add(db_comment)
    db.commit()
    return db_recipe

def get_recipe(db: Session, recipe_id: int) -> Optional[Recipe]:
    return db.query(Recipe).filter(Recipe.id == recipe_id).first()

def get_recipes(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Recipe]:
    return db.query(Recipe).filter(Recipe.owner_id == user_id).offset(skip).limit(limit).all()

def update_recipe(db: Session, db_recipe: Recipe, recipe_in: RecipeUpdate) -> Recipe:
    comments_data = recipe_in.comments
    recipe_data = recipe_in.dict(exclude_unset=True, exclude={"comments"})
    for key, value in recipe_data.items():
        setattr(db_recipe, key, value)
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)
    
    for comment_data in comments_data:
        db_comment = Comment(**comment_data.dict(), recipe_id=db_recipe.id, user_id=db_recipe.owner_id)
        db.add(db_comment)
    db.commit()
    return db_recipe

def delete_recipe(db: Session, db_recipe: Recipe) -> None:
    if db_recipe.file_path:
        delete_file_from_b2(db_recipe.file_path)
    db.delete(db_recipe)
    db.commit()
    