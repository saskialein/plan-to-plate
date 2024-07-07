from langchain_community.document_loaders import WebBaseLoader, PyPDFLoader, UnstructuredImageLoader
from transformers import AutoTokenizer
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceBgeEmbeddings
from langchain_postgres.vectorstores import PGVector
from langchain.indexes import SQLRecordManager, index
import os
import psycopg2

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
    
def get_psycopg_connection_string():
    return (
        f"dbname='{os.getenv('POSTGRES_DB', 'postgres')}' "
        f"user='{os.getenv('POSTGRES_USER', 'postgres')}' "
        f"host='{os.getenv('POSTGRES_HOST', 'db')}' "
        f"password='{os.getenv('POSTGRES_PASSWORD', 'password')}'"
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

def process_and_store_in_vector_db(file_path=None, url=None, metadata=None, recipe_id=None):
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
    
    if metadata is None:
        metadata = {}
    metadata["recipe_id"] = recipe_id
    
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

    recipes = []
    for result in results:
        metadata = result.metadata
        recipes.append({
            'title': metadata.get('title'),
            'url': metadata.get('source') 
        })
    
    return recipes

def fetch_embedding_ids_by_recipe_id(recipe_id):
    CONNECTION_STRING = get_psycopg_connection_string()
    connection = psycopg2.connect(CONNECTION_STRING)
    cursor = connection.cursor()
    embedding_ids = []

    try:
        # Query to fetch IDs of embeddings with the given recipe_id in metadata
        fetch_query = "SELECT id FROM langchain_pg_embedding WHERE cmetadata->>'recipe_id' = %s"
        cursor.execute(fetch_query, (str(recipe_id),))
        embedding_ids = [row[0] for row in cursor.fetchall()]
    except Exception as e:
        print(f"Failed to fetch embedding IDs for recipe_id: {recipe_id}, error: {str(e)}")
    finally:
        cursor.close()
        connection.close()

    return embedding_ids

def delete_recipe_from_vector_db(recipe_id):
    CONNECTION_STRING = get_connection_string()
    vectorstore = PGVector(
        collection_name="plan_to_plate",
        connection=CONNECTION_STRING,
        embeddings=get_embedding_function(),
    )
    
    try:
        # Fetch embedding IDs to delete
        embedding_ids = fetch_embedding_ids_by_recipe_id(recipe_id)
        if embedding_ids:
            vectorstore.delete(ids=embedding_ids)
            print(f"Successfully deleted vectors for recipe_id: {recipe_id}")
        else:
            print(f"No vectors found for recipe_id: {recipe_id}")
    except Exception as e:
        print(f"Failed to delete vectors for recipe_id: {recipe_id}, error: {str(e)}")