import os
import random
import json
from pypdf import PdfReader
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("OPENAI_API_KEY")

def extract_text_from_pdf(pdf_path):
    try:
        import fitz # PyMuPDF
        doc = fitz.open(pdf_path)
        text = ""
        for i, page in enumerate(doc):
            content = page.get_text()
            if content:
                text += f"\n[PAGE {i+1}]\n{content}\n"
        return text
    except Exception as e:
        print(f"Error extracting text: {e}")
        return ""

def delete_all_data(data_dir):
    import shutil
    if os.path.exists(data_dir):
        shutil.rmtree(data_dir)
    os.makedirs(data_dir)

def get_openai_client():
    if not API_KEY:
        return None
    try:
        from openai import OpenAI
        return OpenAI(api_key=API_KEY)
    except Exception as e:
        print(f"Failed to init OpenAI: {e}")
        return None

def generate_question_from_text(full_text):
    client = get_openai_client()
    
    # Parse the text into pages to ensure 100% accurate citation
    import re
    # Split by [PAGE number] markers. odd indices will be numbers, even indices will be text
    parts = re.split(r'\[PAGE (\d+)\]', full_text)
    
    # parts[0] is usually empty or pre-amble.
    # parts[1] is page number, parts[2] is text, parts[3] is page number, parts[4] is text...
    
    pages = []
    for i in range(1, len(parts), 2):
        page_num = int(parts[i])
        page_text = parts[i+1].strip()
        if len(page_text) > 50: # Reduced threshold to capture more pages
            pages.append((page_num, page_text))
            
    if not pages:
        # Fallback if parsing fails (e.g. old uploaded book without markers)
        context = full_text[:2000]
        selected_page_num = 1
    else:
        # Pick a random page
        selected_page_num, context = random.choice(pages)

    if client:
        try:
            prompt = (
                f"Based on the following text from Page {selected_page_num}, generate a multiple-choice question.\n"
                "IMPORTANT: Detect the language of the text. Generate the question, options, and answer content in that SAME language.\n"
                "Return valid JSON with format: \n"
                "{'question': '...', 'options': ['A', 'B', 'C', 'D'], 'answer': 'Correct Option String'}\n"
                f"Text: {context[:2000]}..."
            )
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                response_format={ "type": "json_object" }
            )
            content = response.choices[0].message.content
            data = json.loads(content)
            
            # Inject the KNOWN correct page number
            data['source_page_number'] = selected_page_num
            return data
        except Exception as e:
            print(f"AI Error: {e}")
            # Fallback below
            pass
            
    # Fallback / Simulation
    return {
        "question": "Sample question generated from text content (AI unavailable)?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "answer": "Option A",
        "source_page_number": 1
    }

def generate_article_from_text(full_text, topic):
    client = get_openai_client()
    
    if client:
        try:
            prompt = f"Write a professional, publishable 2-page article about '{topic}' based on the following context. Make it detailed.\n\nContext: {full_text[:4000]}"
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}]
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error generating article: {e}"

    return (
        f"# Article on {topic}\n\n"
        "AI API Key missing or invalid. This is a placeholder article.\n\n"
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " * 20
    )
