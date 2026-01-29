import os
from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel
import shutil
import uuid
from ai_service import extract_text_from_pdf, generate_question_from_text, generate_article_from_text, delete_all_data

# --- Configuration ---
UPLOAD_DIR = "data"
BOOKS_METADATA_FILE = os.path.join(UPLOAD_DIR, "books.json")

# --- Models ---
class Book(BaseModel):
    id: str
    filename: str
    title: str

class PasswordRequest(BaseModel):
    password: str

class DeleteSelectionRequest(BaseModel):
    password: str
    book_ids: List[str]

class ArticleRequest(BaseModel):
    book_id: str
    topic: str

class QuestionRequest(BaseModel):
    book_id: str

# --- Lifespan ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)
    yield

app = FastAPI(lifespan=lifespan)

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Endpoints ---

@app.get("/books", response_model=List[Book])
def get_books():
    books = []
    if os.path.exists(BOOKS_METADATA_FILE):
        import json
        with open(BOOKS_METADATA_FILE, "r") as f:
            books = json.load(f)
    return books

@app.post("/upload")
async def upload_book(password: str = Form(...), file: UploadFile = File(...)):
    if password != "3232":
        raise HTTPException(status_code=401, detail="Invalid password")
    
    book_id = str(uuid.uuid4())
    filename = file.filename
    file_location = os.path.join(UPLOAD_DIR, f"{book_id}.pdf")
    
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Extract text immediately for simplicity
    text = extract_text_from_pdf(file_location)
    text_file = os.path.join(UPLOAD_DIR, f"{book_id}.txt")
    with open(text_file, "w", encoding="utf-8") as f:
        f.write(text)

    # Update metadata
    books = []
    if os.path.exists(BOOKS_METADATA_FILE):
        import json
        with open(BOOKS_METADATA_FILE, "r") as f:
            books = json.load(f)
            
    new_book = {"id": book_id, "filename": filename, "title": filename}
    books.append(new_book)
    
    import json
    with open(BOOKS_METADATA_FILE, "w") as f:
        json.dump(books, f)
        
    return new_book

@app.post("/delete-all")
def delete_books(request: PasswordRequest):
    if request.password != "3434":
        raise HTTPException(status_code=401, detail="Invalid password")
    
    delete_all_data(UPLOAD_DIR)
    return {"message": "All books deleted"}

@app.post("/delete-selection")
def delete_selected_books(request: DeleteSelectionRequest):
    if request.password != "3434":
        raise HTTPException(status_code=401, detail="Invalid password")
    
    if not os.path.exists(BOOKS_METADATA_FILE):
        return {"message": "No books to delete"}

    import json
    with open(BOOKS_METADATA_FILE, "r") as f:
        books = json.load(f)

    # Filter out books to delete and remove their files
    new_books = []
    ids_to_delete = set(request.book_ids)
    
    for book in books:
        if book["id"] in ids_to_delete:
            # Delete files
            pdf_path = os.path.join(UPLOAD_DIR, f"{book['id']}.pdf")
            txt_path = os.path.join(UPLOAD_DIR, f"{book['id']}.txt")
            if os.path.exists(pdf_path):
                os.remove(pdf_path)
            if os.path.exists(txt_path):
                os.remove(txt_path)
        else:
            new_books.append(book)
            
    with open(BOOKS_METADATA_FILE, "w") as f:
        json.dump(new_books, f)

    return {"message": "Selected books deleted", "remaining": len(new_books)}

@app.post("/ask")
def ask_question(request: QuestionRequest):
    text_path = os.path.join(UPLOAD_DIR, f"{request.book_id}.txt")
    if not os.path.exists(text_path):
        raise HTTPException(status_code=404, detail="Book content not found")
        
    with open(text_path, "r", encoding="utf-8") as f:
        text = f.read()
        
    # Generate question
    question_data = generate_question_from_text(text)
    return question_data

@app.post("/article")
def create_article(request: ArticleRequest):
    text_path = os.path.join(UPLOAD_DIR, f"{request.book_id}.txt")
    if not os.path.exists(text_path):
        raise HTTPException(status_code=404, detail="Book content not found")
        
    with open(text_path, "r", encoding="utf-8") as f:
        text = f.read()
        
    article_content = generate_article_from_text(text, request.topic)
    article_content = generate_article_from_text(text, request.topic)
    return {"content": article_content}

@app.get("/books/{book_id}/pages/{page_number}")
def get_book_page_image(book_id: str, page_number: int):
    import fitz  # PyMuPDF
    import io
    
    pdf_path = os.path.join(UPLOAD_DIR, f"{book_id}.pdf")
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="Book not found")
        
    try:
        doc = fitz.open(pdf_path)
        # page_number from AI is 1-based usually, fitz is 0-based
        # If AI returns 1, we want page 0.
        page_idx = page_number - 1
        
        if page_idx < 0 or page_idx >= len(doc):
            raise HTTPException(status_code=404, detail="Page number out of range")
            
        page = doc.load_page(page_idx)
        pix = page.get_pixmap(dpi=150) # render page to an image
        img_bytes = pix.tobytes("png")
        
        return Response(content=img_bytes, media_type="image/png")
    except Exception as e:
        print(f"Error rendering page: {e}")
        raise HTTPException(status_code=500, detail="Could not render page")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
