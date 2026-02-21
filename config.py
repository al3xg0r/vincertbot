import os
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")
if not BOT_TOKEN:
    raise ValueError("BOT_TOKEN не найден в .env")

AUTORIA_API_KEY = os.getenv("AUTORIA_API_KEY")
AUTORIA_USER_ID = os.getenv("AUTORIA_USER_ID") # Добавили ID пользователя
BAZAGAI_API_KEY = os.getenv("BAZAGAI_API_KEY")