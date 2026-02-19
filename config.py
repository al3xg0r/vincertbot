import os
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")
VIN_API_KEY = os.getenv("VIN_API_KEY")
VIN_API_URL = os.getenv("VIN_API_URL")

if not BOT_TOKEN:
    raise ValueError("BOT_TOKEN не найден в .env")
