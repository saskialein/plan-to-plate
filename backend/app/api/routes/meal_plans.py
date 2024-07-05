from typing import Any
from fastapi import APIRouter, HTTPException
from sqlmodel import func, select
from fastapi.encoders import jsonable_encoder

from app.api.deps import CurrentUser, SessionDep
from app.models import MealPlan, MealPlanCreate, MealPlanOut, MealPlansOut, Message

router = APIRouter()

@router.post("/", response_model=MealPlanOut)
def create_meal_plan(
    *, session: SessionDep, current_user: CurrentUser, meal_plan_in: MealPlanCreate
) -> Any:
    """
    Create new meal plan.
    """
    meal_plan_data = jsonable_encoder(meal_plan_in)

    meal_plan = MealPlan.model_validate(meal_plan_data, update={"owner_id": current_user.id})
    session.add(meal_plan)
    session.commit()
    session.refresh(meal_plan)
    return meal_plan

@router.get("/", response_model=MealPlansOut)
def read_meal_plans(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve meal plans.
    """
    statement = (
        select(MealPlan)
        .where(MealPlan.owner_id == current_user.id)
        .offset(skip)
        .limit(limit)
    )
    meal_plans = session.exec(statement).all()

    count_statement = (
        select(func.count())
        .select_from(MealPlan)
        .where(MealPlan.owner_id == current_user.id)
    )
    count = session.exec(count_statement).one()

    return MealPlansOut(data=meal_plans, count=count)

@router.delete("/{id}")
def delete_meal_plan(session: SessionDep, current_user: CurrentUser, id: int) -> Message:
    """
    Delete a meal plan.
    """
    meal_plan = session.get(MealPlan, id)
    if not meal_plan:
        raise HTTPException(status_code=404, detail="Meal plan not found")
    if meal_plan.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    session.delete(meal_plan)
    session.commit()
    return Message(message="Meal plan deleted successfully")