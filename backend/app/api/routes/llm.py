from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, List
from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.prompts import PromptTemplate, ChatPromptTemplate, MessagesPlaceholder
# from langchain_core.output_parsers import StrOutputParser
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory

router = APIRouter()

# In-memory store for session histories
store = {}

def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
    return store[session_id]

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
            ("system", "You are a friendly and helpful chatbot. Engage in a conversation with the user. Be natural, personable, and provide relevant responses based on the user's input."),
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