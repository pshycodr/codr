import re


def sanitize_text(text: str) -> str:
    text = text.replace("\\n", "\n")                   
    text = re.sub(r'\s+', ' ', text)                    
    text = re.sub(r'\n{2,}', '\n\n', text)              
    text = re.sub(r'\s{2,}', ' ', text)
    return text.strip()
