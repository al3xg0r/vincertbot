import os
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")
if not BOT_TOKEN:
    raise ValueError("BOT_TOKEN не найден в .env")

# API Keys
AUTORIA_API_KEY = os.getenv("AUTORIA_API_KEY")
RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
RAPIDAPI_HOST = os.getenv("RAPIDAPI_HOST", "vin-decoder19.p.rapidapi.com")
BAZAGAI_API_KEY = os.getenv("BAZAGAI_API_KEY")