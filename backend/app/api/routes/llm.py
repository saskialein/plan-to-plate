from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, RootModel
from typing import Dict, Optional
from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.prompts import PromptTemplate, ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory

from app.core.vector_db_services import query_vector_db

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
    ingredients: Optional[list[str]] = None
    recipe_steps: Optional[list[str]] = None

class DailyMealPlan(BaseModel):
    breakfast: Meal
    lunch: Meal
    dinner: Meal

class WeekMealPlan(RootModel):
    root: Dict[str, DailyMealPlan]

class MealPlanResponse(BaseModel):
    response: WeekMealPlan

class MealPlanRequest(BaseModel):
    diets: list[str] = Field(..., example=["Paleo", "Keto"])
    vegetables: list[str] = Field(..., example=["Carrots", "Beetroot", "Pumpkin"])
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
    history: list[ChatMessage]
    
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
        startDay = request.startDay.lower()
        
        # Prepare ordered days
        days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        start_index = days.index(startDay)
        ordered_days = days[start_index:] + days[:start_index]
        ordered_days_str = ', '.join([f'"{day}"' for day in ordered_days])
        
        print(f"Ordered Days: {ordered_days_str}")
        print(f"day1: {ordered_days[0]}")
        
        matching_recipes = query_vector_db(vegetables)  
        
        recipes_data = [
            {"title": recipe['title'], "url": recipe['url']}
            for recipe in matching_recipes
        ]
        
        recipes_str = "\n".join(
            [f"- Title: {recipe['title']}, URL: {recipe['url']}" for recipe in recipes_data]
        )
        
                      
        template = """
        You are the world's most comprehensive recipe book. Create a weekly meal plan (breakfast, lunch, dinner) based on these diets: {diets}. If no diets are specified, assume omnivore.

        STRICT REQUIREMENTS (MUST BE FOLLOWED):
        1. The meal plan MUST start on {startDay}. You MUST use these exact day keys in this exact order: {ordered_days}.
        2. Meals are for {numberOfPeople} people.
        3. These vegetables MUST be used throughout the meal plan: {vegetables}. You may add seasonal New Zealand vegetables.
        4. All meals must be healthy, balanced, whole foods. NO processed foods.
        5. EVERY meal must have 20-30g+ of protein per serving.
        6. ALL breakfasts must be savory EXCEPT Sunday (can be sweet, e.g., porridge, waffles).
        7. Include chicken stock soup EXACTLY 3 times and ONLY on these days and meals:
            - Monday dinner, Wednesday breakfast, Thursday dinner. 
            - Soup MUST include: onions, carrots, celery, celery greens. 
            - Soup MAY include: potato mash, mushrooms, spinach, fennel.
            - Do NOT include chicken stock soup anywhere else in the meal plan.
        8. REUSE meals as follows (MUST be identical in title, ingredients, and recipe steps):
        - Sunday dinner = Monday lunch
        - Tuesday dinner = Wednesday lunch
        - Wednesday dinner = Thursday lunch
        - Monday breakfast = Thursday breakfast
        - Tuesday breakfast = Friday breakfast

        You MAY use these recipes if they match the vegetables and diets: {recipes}

        OUTPUT FORMAT:
        Provide the meal plan ONLY as JSON. Do NOT add any comments. Use this exact structure, with the day keys as specified above:

        {{
            "{day1}": {{
                "breakfast": {{"recipe": "Recipe Name", "url": "https://example.com/recipe" or "ingredients": ["ingredient1", "ingredient2"], "recipe_steps": ["Step 1", "Step 2"]}},
                "lunch": {{"recipe": "Recipe Name", "url": "https://example.com/recipe" or "ingredients": ["ingredient1", "ingredient2"], "recipe_steps": ["Step 1", "Step 2"]}},
                "dinner": {{"recipe": "Recipe Name", "url": "https://example.com/recipe" or "ingredients": ["ingredient1", "ingredient2"], "recipe_steps": ["Step 1", "Step 2"]}}
            }},
            "{day2}": {{
                # Same structure as {day1}
            }},
            # ... other days
        }}

        IMPORTANT: 
        - If using a provided recipe, include the URL.
        - If not using a provided recipe, include ingredients and recipe steps.
        - Ensure ALL requirements are met for EVERY meal.
        - Double-check that reused meals are EXACTLY the same.
        - Make sure to include chicken stock soup ONLY 3 times as specified.
        - Use the EXACT day keys provided in the order given.
        """
        # model = ChatOpenAI(model_name="gpt-3.5-turbo")
        model = ChatGroq(model="llama3-70b-8192")
        parser = JsonOutputParser()
        prompt = PromptTemplate(template=template, input_variables=["diets", "vegetables", "numberOfPeople", "startDay", "ordered_days", "recipes" ,"day1", "day2"])
        chain = prompt | model | parser
        
        response = chain.invoke({
            "diets": diets,  
            "vegetables": ', '.join(vegetables), 
            "numberOfPeople": numberOfPeople, 
            "startDay": startDay, 
            "ordered_days": ordered_days_str,
            "recipes": recipes_str,
            "day1": ordered_days[0],
            "day2": ordered_days[1]
        })
 
        try:
            meal_plan_dict = {day: DailyMealPlan(**meals) for day, meals in response.items()}
            meal_plan = WeekMealPlan(root=meal_plan_dict)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Invalid JSON output: {str(e)}")
    
        for day, meals in meal_plan.root.items():
            for meal_type in ['breakfast', 'lunch', 'dinner']:
                meal = getattr(meals, meal_type)
                # Check if the recipe is from the vector store
                for recipe in recipes_data:
                    if recipe['title'] in meal.recipe:
                        meal.url = recipe['url']
                        meal.ingredients = None
                        meal.recipe_steps = None
                        break

        return {"response": meal_plan.root}
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