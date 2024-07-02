from langchain_community.document_loaders import WebBaseLoader, PyPDFLoader, UnstructuredImageLoader
from transformers import AutoTokenizer
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceBgeEmbeddings
from langchain_postgres.vectorstores import PGVector
from langchain.indexes import SQLRecordManager, index
import os

EMBEDDING_MODEL_NAME = "BAAI/bge-small-en-v1.5"
EMBEDDING_MODEL_KWARGS = {'device': 'cpu'}
EMBEDDING_ENCODE_KWARGS = {'normalize_embeddings': True}

def get_connection_string():
    return PGVector.connection_string_from_db_params(
        database=os.getenv('POSTGRES_DB', 'postgres'),
        driver='psycopg',
        host=os.getenv('POSTGRES_HOST', 'db'),
        port=5432,
        user=os.getenv('POSTGRES_USER', 'postgres'),
        password=os.getenv('POSTGRES_PASSWORD', 'password'),
    )

tokenizer = AutoTokenizer.from_pretrained(EMBEDDING_MODEL_NAME)
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=512,
    chunk_overlap=20,
    length_function=lambda text: len(tokenizer.tokenize(text, truncation=True)),
    is_separator_regex=False,
)

def split_text_from_loader(loader):
    chunks = loader.load_and_split(text_splitter)
    print("Generating " + str(len(chunks)) + " chunks...")
    return chunks

def split_text_from_text(filepath):
    with open(filepath, "r") as f:
        text = f.read()
    chunks = text_splitter.create_documents([text])
    print("Generating " + str(len(chunks)) + " chunks...")
    for chunk in chunks:
        chunk.metadata["source"] = filepath
    return chunks

def get_embedding_function():
    return HuggingFaceBgeEmbeddings(
        model_name=EMBEDDING_MODEL_NAME,
        model_kwargs=EMBEDDING_MODEL_KWARGS,
        encode_kwargs=EMBEDDING_ENCODE_KWARGS,
    )

def store_embeddings(chunks, embedding_function, metadata):
    CONNECTION_STRING = get_connection_string()
    vectorstore = PGVector(
        collection_name="plan_to_plate",
        connection=CONNECTION_STRING,
        embeddings=embedding_function,
    )
    namespace = "pgvector/plan_to_plate"
    record_manager = SQLRecordManager(
        namespace, db_url=CONNECTION_STRING
    )
    record_manager.create_schema()
    for chunk in chunks:
        chunk.metadata.update(metadata)
    result = index(chunks, record_manager, vectorstore, cleanup=None, source_id_key="source")
    print(result)

def process_and_store_in_vector_db(file_path=None, url=None, metadata=None):
    embedding_function = get_embedding_function()
    if file_path:
        if file_path.endswith('.pdf'):
            loader = PyPDFLoader(file_path)
        elif file_path.endswith('.jpg') or file_path.endswith('.jpeg') or file_path.endswith('.png'):
            loader = UnstructuredImageLoader(file_path)
        else:
            loader = WebBaseLoader(file_path)
        chunks = split_text_from_loader(loader)
    elif url:
        loader = WebBaseLoader(url)
        chunks = split_text_from_loader(loader)
    
    store_embeddings(chunks, embedding_function, metadata)
    
def query_vector_db(vegetables):
    embedding_function = get_embedding_function()
    vectorstore = PGVector(
        collection_name="plan_to_plate",
        connection=get_connection_string(),
        embeddings=embedding_function
    )    
    
    # query_embedding = embedding_function.embed_query(" ".join(vegetables))
    # print(f"Query Embedding: {query_embedding}")

    results = vectorstore.similarity_search(" ".join(vegetables), k=10)
    print(f"Results: {results}")

    recipes = []
    for result in results:
        metadata = result.metadata
        print(f"Metadata: {metadata}")
        recipes.append({
            'title': metadata.get('title'),
            'url': metadata.get('source') 
        })
    
    return recipes