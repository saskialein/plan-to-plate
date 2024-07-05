from fastapi import APIRouter

from app.api.routes import items, login, users, utils, llm, recipes, meal_plans

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(utils.router, prefix="/utils", tags=["utils"])
api_router.include_router(items.router, prefix="/items", tags=["items"])
api_router.include_router(llm.router, prefix="/llm", tags=["llm"])
api_router.include_router(recipes.router, prefix="/recipes", tags=["recipes"])
api_router.include_router(meal_plans.router, prefix="/meal-plans", tags=["meal-plans"])

