from google import genai
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configurar cliente
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

# Listar modelos de embedding
print("🔍 Modelos de embedding disponibles:")
for model in client.models.list():
    if 'embedding' in model.name:
        print(f"✅ {model.name}")