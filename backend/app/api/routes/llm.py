from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

router = APIRouter()

class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    response: str

@router.post("/llm-query", response_model=QueryResponse)

def llm_query(request: QueryRequest):
    try:
        template = """You are a friendly chatbot. Please help the user with their request: {request}
        """
        model = ChatOpenAI(model_name="gpt-3.5-turbo", max_tokens=100)
        parser = StrOutputParser()
        prompt = PromptTemplate(template=template, input_variables=["request"])
        chain = prompt | model | parser

        response = chain.invoke({"request": request.query})
        print(response)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))