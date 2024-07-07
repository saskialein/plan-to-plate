from sqlmodel import Field, Relationship, SQLModel
from typing import List, Optional, Dict
from datetime import datetime, timezone
from humps import camelize
from datetime import date
from pydantic import BaseModel, RootModel
from sqlalchemy import JSON, Column, ARRAY, String

def to_camel(string):
    return camelize(string)


class CamelModel(SQLModel):
    class Config:
        alias_generator = to_camel
        populate_by_name = True

# Shared properties
# TODO replace email str with EmailStr when sqlmodel supports it
class UserBase(CamelModel):
    email: str = Field(unique=True, index=True)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = None


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str


# TODO replace email str with EmailStr when sqlmodel supports it
class UserCreateOpen(CamelModel):
    email: str
    password: str
    full_name: str | None = None


# Properties to receive via API on update, all are optional
# TODO replace email str with EmailStr when sqlmodel supports it
class UserUpdate(UserBase):
    email: str | None = None  # type: ignore
    password: str | None = None


# TODO replace email str with EmailStr when sqlmodel supports it
class UserUpdateMe(CamelModel):
    full_name: str | None = None
    email: str | None = None


class UpdatePassword(CamelModel):
    current_password: str
    new_password: str


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    hashed_password: str
    items: list["Item"] = Relationship(back_populates="owner")
    recipes: List["Recipe"] = Relationship(back_populates="owner")
    comments: List["Comment"] = Relationship(back_populates="user")
    meal_plans: List["MealPlan"] = Relationship(back_populates="owner")

# Properties to return via API, id is always required
class UserOut(UserBase):
    id: int


class UsersOut(CamelModel):
    data: list[UserOut]
    count: int


# Shared properties
class ItemBase(CamelModel):
    title: str
    description: str | None = None


# Properties to receive on item creation
class ItemCreate(ItemBase):
    title: str


# Properties to receive on item update
class ItemUpdate(ItemBase):
    title: str | None = None  # type: ignore


# Database model, database table inferred from class name
class Item(ItemBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str
    owner_id: int | None = Field(default=None, foreign_key="user.id", nullable=False)
    owner: User | None = Relationship(back_populates="items")


# Properties to return via API, id is always required
class ItemOut(ItemBase):
    id: int
    owner_id: int


class ItemsOut(CamelModel):
    data: list[ItemOut]
    count: int


# Generic message
class Message(CamelModel):
    message: str


# JSON payload containing access token
class Token(CamelModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(CamelModel):
    sub: int | None = None


class NewPassword(CamelModel):
    token: str
    new_password: str

class RecipeBase(CamelModel):
    title: str
    url: Optional[str] = None
    file_path: Optional[str] = None
    description: Optional[str] = None
    store_in_vector_db: bool = False
    categories: List[str] = Field(default_factory=list)


class CommentBase(CamelModel):
    content: str

class CommentCreate(CommentBase):
   pass

class Comment(CommentBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    recipe_id: int | None = Field(default=None, foreign_key="recipe.id", nullable=False)
    user_id: int | None = Field(default=None, foreign_key="user.id", nullable=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    recipe: Optional["Recipe"] = Relationship(back_populates="comments")
    user: Optional["User"] = Relationship(back_populates="comments")
    
class CommentOut(CommentBase):
    id: int
    created_at: datetime

class RecipeCreate(RecipeBase):
    comment: Optional[str] = None


class RecipeUpdate(RecipeBase):
    title: str | None = None
    description: Optional[str] = None
    store_in_vector_db: Optional[bool] = None
    categories: List[str] = Field(default_factory=list)



class Recipe(RecipeBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    owner_id: int | None = Field(default=None, foreign_key="user.id", nullable=False)
    owner: User | None = Relationship(back_populates="recipes")
    comments: List[Comment] = Relationship(back_populates="recipe")
    categories: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String))) 

class RecipeOut(RecipeBase):
    id: int
    owner_id: int
    comments: List[CommentOut] = []

class RecipesOut(CamelModel):
    data: list[RecipeOut]
    count: int

class Meal(BaseModel):
    recipe: str
    url: Optional[str] = None
    ingredients: Optional[List[str]] = None
    recipe_steps: Optional[List[str]] = None

class MealPlan(BaseModel):
    breakfast: Meal
    lunch: Meal
    dinner: Meal
    
class WeekMealPlan(RootModel):
    root: Dict[str, MealPlan]

class MealPlanBase(CamelModel):
    plan: WeekMealPlan = Field(sa_column=Column(JSON))
    start_date: date

class MealPlanCreate(MealPlanBase):
    pass

class MealPlanUpdate(MealPlanBase):
    plan: Optional[WeekMealPlan] = Field(sa_column=Column(JSON))
    start_date: Optional[date] = None

class MealPlan(MealPlanBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    owner_id: int | None = Field(default=None, foreign_key="user.id", nullable=False)
    owner: User | None = Relationship(back_populates="meal_plans")
    plan: dict = Field(sa_column=Column(JSON))

class MealPlanOut(MealPlanBase):
    id: int
    owner_id: int

class MealPlansOut(CamelModel):
    data: list[MealPlanOut]
    count: int