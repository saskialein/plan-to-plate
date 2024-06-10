from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any
from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
# from langchain_core.output_parsers import StrOutputParser
from langchain_core.output_parsers import JsonOutputParser

router = APIRouter()

class MealPlan(BaseModel):
    breakfast: str
    lunch: str
    dinner: str

class MealPlanRequest(BaseModel):
    diets: list[str] = Field(..., example=["Paleo", "Keto"])
    vegetables: list[str] = Field(..., example=["Carrots", "Beetroot", "Pumpkin"])

class MealPlanResponse(BaseModel):
    response: Dict[str, MealPlan] = Field(
        ...,
        example={
            "monday": {
                "breakfast": "Sweet potato hash with eggs",
                "lunch": "Grilled chicken with roasted carrots",
                "dinner": "Butternut squash soup"
            },
            "tuesday": {
                "breakfast": "Lettuce wraps with turkey and avocado",
                "lunch": "Butternut squash and chicken curry",
                "dinner": "Grilled salmon with roasted radicchio"
            },
            "wednesday": {
                "breakfast": "Carrot and apple smoothie",
                "lunch": "Paleo lettuce tacos with ground turkey",
                "dinner": "Grilled steak with roasted butternut squash"
            }
        },
    )


@router.post("/llm-query", response_model=MealPlanResponse, summary="Generate meal plan", description="Generate a meal plan based on selected diets and available vegetables.")
def llm_query(request: MealPlanRequest):
    """
    Generate a meal plan based on the provided diets and vegetables.
    """
    
    try:
        diets_str = ', '.join(request.diets)
        vegetables_str = ', '.join(request.vegetables)
        query_str = f"Diets: {diets_str}. Vegetables: {vegetables_str}."
        
        template = """You are the biggest recipe book in the world. Please help the user with creating a weekly mealplan (breakfast, lunch, dinner) based on their chosen diets.
        It also should include the vegetables they like. 
        Please output the meal plan as JSON with the following format:
        {{
            "monday": {{
                "breakfast": "Oatmeal with fruits",
                "lunch": "Chicken salad",
                "dinner": "Grilled salmon"
            }},
            "tuesday": {{
                "...": "..."
            }}
        }}
        Here is their request: {request}
        
        """
        # model = ChatOpenAI(model_name="gpt-3.5-turbo")
        model = ChatGroq(model="llama3-70b-8192")
        parser = JsonOutputParser()
        prompt = PromptTemplate(template=template, input_variables=["request"])
        chain = prompt | model | parser

        response = chain.invoke({"request": query_str})
        print(response)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))