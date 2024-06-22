from sqlmodel import Field, Relationship, SQLModel
from typing import List, Optional
from datetime import datetime, timezone

# Shared properties
# TODO replace email str with EmailStr when sqlmodel supports it
class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = None


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str


# TODO replace email str with EmailStr when sqlmodel supports it
class UserCreateOpen(SQLModel):
    email: str
    password: str
    full_name: str | None = None


# Properties to receive via API on update, all are optional
# TODO replace email str with EmailStr when sqlmodel supports it
class UserUpdate(UserBase):
    email: str | None = None  # type: ignore
    password: str | None = None


# TODO replace email str with EmailStr when sqlmodel supports it
class UserUpdateMe(SQLModel):
    full_name: str | None = None
    email: str | None = None


class UpdatePassword(SQLModel):
    current_password: str
    new_password: str


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    hashed_password: str
    items: list["Item"] = Relationship(back_populates="owner")
    recipes: List["Recipe"] = Relationship(back_populates="owner")
    comments: List["Comment"] = Relationship(back_populates="user")



# Properties to return via API, id is always required
class UserOut(UserBase):
    id: int


class UsersOut(SQLModel):
    data: list[UserOut]
    count: int


# Shared properties
class ItemBase(SQLModel):
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


class ItemsOut(SQLModel):
    data: list[ItemOut]
    count: int


# Generic message
class Message(SQLModel):
    message: str


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: int | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str

class RecipeBase(SQLModel):
    title: str
    url: Optional[str] = None
    file_path: Optional[str] = None
    description: Optional[str] = None
    store_in_vector_db: bool = False

class CommentBase(SQLModel):
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


class Recipe(RecipeBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    owner_id: int | None = Field(default=None, foreign_key="user.id", nullable=False)
    owner: User | None = Relationship(back_populates="recipes")
    comments: List[Comment] = Relationship(back_populates="recipe")

class RecipeOut(RecipeBase):
    id: int
    owner_id: int
    comments: List[CommentOut] = []

class RecipesOut(SQLModel):
    data: list[RecipeOut]
    count: int

