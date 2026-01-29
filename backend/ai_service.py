import os
import random
import json
from pypdf import PdfReader
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("OPENAI_API_KEY")

def extract_text_from_pdf(pdf_path):
    try:
        reader = PdfReader(pdf_path)
        text = ""
        for i, page in enumerate(reader.pages):
            content = page.extract_text()
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
    
    # Take a random chunk of text to base the question on
    if len(full_text) > 2000:
        start = random.randint(0, len(full_text) - 2000)
        context = full_text[start:start+2000]
    else:
        context = full_text

    if client:
        try:
            prompt = (
                "Based on the following text (which contains [PAGE X] markers), generate a multiple-choice question.\n"
                "You MUST identify the specific page number(s) where the answer is found from the markers.\n"
                "Return valid JSON with format: \n"
                "{'question': '...', 'options': ['A', 'B', 'C', 'D'], 'answer': 'Correct Option String', 'source_page_number': 123}\n"
                "If multiple pages, use the first one. source_page_number must be an Integer.\n"
                f"Text: {context[:1500]}..."
            )
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                response_format={ "type": "json_object" }
            )
            content = response.choices[0].message.content
            return json.loads(content)
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
