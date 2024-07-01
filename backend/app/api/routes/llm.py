from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.prompts import PromptTemplate, ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory

from backend.app.core.vector_db_services import query_vector_db

router = APIRouter()

# In-memory store for session histories
store = {}

def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
    return store[session_id]

class Meal(BaseModel):
    recipe: str
    url: Optional[str] = None
    ingredients: Optional[List[str]] = None
    recipe_steps: Optional[List[str]] = None

class MealPlan(BaseModel):
    breakfast: Meal
    lunch: Meal
    dinner: Meal

class MealPlanResponse(BaseModel):
    response: Dict[str, MealPlan] = Field(
        ...,
        example={
            "monday": {
                "breakfast": {
                    "recipe": "Sweet potato hash with eggs",
                    "url": "https://example.com/recipe1"
                },
                "lunch": {
                    "recipe": "Grilled chicken with roasted carrots",
                    "url": "https://example.com/recipe2"
                },
                "dinner": {
                    "recipe": "Butternut squash soup",
                    "ingredients": ["2 cups butternut squash", "1 onion", "2 cups chicken broth"],
                    "recipe_steps": ["1. Prepare ingredients.", "2. Cook the squash.", "3. Blend and serve."]
                }
            },
            "tuesday": {
                "breakfast": {
                    "recipe": "Lettuce wraps with turkey and avocado",
                    "url": "https://example.com/recipe4"
                },
                "lunch": {
                    "recipe": "Butternut squash and chicken curry",
                    "url": "https://example.com/recipe5"
                },
                "dinner": {
                    "recipe": "Grilled salmon with roasted radicchio",
                    "ingredients": ["1 salmon fillet", "1 radicchio", "1 tbsp olive oil"],
                    "recipe_steps": ["1. Prepare ingredients.", "2. Grill the salmon.", "3. Serve with radicchio."]
                }
            }
        },
    )

class MealPlanRequest(BaseModel):
    diets: List[str] = Field(..., example=["Paleo", "Keto"])
    vegetables: List[str] = Field(..., example=["Carrots", "Beetroot", "Pumpkin"])
    numberOfPeople: int = Field(..., example=2)
    startDay: str = Field(..., example="Monday")

class ChatMessage(BaseModel):
    role: str = Field(..., example="user")
    content: str = Field(..., example="What's the best way to prepare carrots?")
    
class ChatRequest(BaseModel):
    query: str = Field(..., example="What's the best way to prepare carrots?")
    session_id: str

class ChatResponse(BaseModel):
    response: str = Field(..., example="The best way to prepare carrots is to roast them with some olive oil, salt, and pepper until they are tender and caramelized.")
    history: List[ChatMessage]
    
@router.post("/chat", response_model=ChatResponse, summary="Chat with AI", description="Get answers to your questions from the AI.")
def chat_with_ai(request: ChatRequest):
    """
    Get answers to your questions from the AI.
    """
    try:
        history = get_session_history(request.session_id)
        
        model = ChatGroq(model="llama3-70b-8192")
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are Carrotina, a friendly and helpful cooking assistant. You can help users with recipes, meal planning, cooking tips, and food-related questions. Always refer to yourself as Carrotina."),
            MessagesPlaceholder(variable_name="history"),
            ("human", "{input}")
        ])
        chain = prompt | model
        runnable_with_history = RunnableWithMessageHistory(
            chain,
            get_session_history,
            input_messages_key="input",
            history_messages_key="history",
        )

        response = runnable_with_history.invoke(
            {"input": HumanMessage(content=request.query), "history": history.messages},
            config={"configurable": {"session_id": request.session_id}}
        )
        
        # Append the new query and response to the chat history
        history.add_user_message(HumanMessage(content=request.query))
        history.add_ai_message(AIMessage(content=response.content))
        
        new_history = [{"role": "user", "content": msg.content} if isinstance(msg, HumanMessage) else {"role": "bot", "content": msg.content} for msg in history.messages]
        
        return {"response": response.content, "history": new_history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/meal-plan", response_model=MealPlanResponse, summary="Generate meal plan", description="Generate a meal plan based on selected diets and available vegetables.")
def generate_meal_plan(request: MealPlanRequest):
    """
    Generate a meal plan based on the provided diets and vegetables.
    """
    
    try:
        diets = ', '.join(request.diets)
        vegetables = request.vegetables
        numberOfPeople = request.numberOfPeople
        startDay = request.startDay
        matching_recipes = query_vector_db(vegetables)  
        
        recipes_data = [
            {"title": recipe['title'], "url": recipe['url']}
            for recipe in matching_recipes
        ]
        
        print(f"Recipes Data: {recipes_data}")

        recipes_str = "\n".join(
            [f"- Title: {recipe['title']}, URL: {recipe['url']}" for recipe in recipes_data]
        )
        
        print(f"Recipes Str: {recipes_str}")
              
        template = """You are the biggest recipe book in the world. Please help the user with creating a weekly mealplan (breakfast, lunch, dinner) based on their chosen diets, which are {diets}.
        If they didnt't specify any diets, you can assume they are omnivores.
        It should include all the vegetables they received in their weekly vegetable box: {vegetables}. It also can include additional vegetables that are in season in New Zealand.
        Please consider all these requirements as well:
        - Meals are for {numberOfPeople} people.
        - Meals should be healthy and balanced, whole & clean foods without any processed foods.
        - Meals should have between 20g to 30g+ of protein per serve
        - All breakfasts should be savoury except Sunday (can be sweet like porridge, waffles, etc.)
        - Monday dinner, Wednesday breakfast and Thursday dinner should be the same soup which is made from chicken stock and mainly these vegetables: onions, carrots, celery, celery greens, and occassionally: potato mash, mushrooms, spinach, fennel.
        - Same meals for: Sunday dinner and Monday lunch | Tuesday dinner and Wednesday lunch | Wednesday dinner and Thursday lunch
        - The meal plan should start on {startDay}.
        
        Additionally, here are some recipes you can use if they match one or more of the vegetables:
        {recipes}
        
        When you use a recipe from the provided list, please include the URL or file path. If the recipe is not from the provided list, please include the ingredients and recipe steps.
        
        Please output the meal plan as JSON with the following format:
        {{
            "monday": {{
                "breakfast": {{"recipe": "Oatmeal with fruits", "url": "https://example.com/recipe1"}},
                "lunch": {{"recipe": "Chicken salad", "url": "https://example.com/recipe2"}},
                "dinner": {{"recipe": "Grilled salmon", "url": "https://example.com/recipe3"}}
            }},
            "tuesday": {{
                "breakfast": {{"recipe": "Avocado toast", "url": "https://example.com/recipe4"}},
                "lunch": {{"recipe": "Quinoa bowl", "url": "https://example.com/recipe5"}},
                "dinner": {{"recipe": "Vegetable stir-fry", "ingredients": ["1 cup broccoli", "1 cup bell peppers", "1 tbsp soy sauce"], "recipe_steps": ["1. Prepare ingredients.", "2. Stir-fry vegetables.", "3. Serve hot."]}}
            }}
            // ... other days
        }}        
        """
         # model = ChatOpenAI(model_name="gpt-3.5-turbo")
        model = ChatGroq(model="llama3-70b-8192")
        parser = JsonOutputParser()
        prompt = PromptTemplate(template=template, input_variables=["diets", "vegetables", "numberOfPeople", "startDay", "recipes"])
        chain = prompt | model | parser
        
        response = chain.invoke({
            "diets": diets,  
            "vegetables": ', '.join(vegetables), 
            "numberOfPeople": numberOfPeople, 
            "startDay": startDay, 
            "recipes": recipes_str
        })
 
        meal_plan = response
        # TODO: Fix the issue with the response JSON (no file paths and same meals for dinner/lunches)
        for day, meals in meal_plan.items():
            for meal_type, meal in meals.items():
                # Check if the recipe is from the vector store
                for recipe in recipes_data:
                    if recipe['title'] in meal['recipe']:
                        meal['url'] = recipe['url']
                        meal.pop('ingredients', None)
                        meal.pop('recipe_steps', None)
                        break

        return {"response": meal_plan}
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
def generate_full_recipe_from_llm(recipe_title):
    template = f"""
    You are the biggest recipe book in the world. Please provide a detailed recipe for the following dish: {recipe_title}.
    Include the ingredients and step-by-step instructions.
    """
    model = ChatGroq(model="llama3-70b-8192")
    response = model(template)
    
    # Parse the response to extract ingredients and steps
    response_data = response.split("Ingredients:")[1].split("Steps:")
    ingredients = response_data[0].strip().split("\n")
    steps = response_data[1].strip().split("\n")

    return {
        "ingredients": ingredients,
        "recipe_steps": steps
    }