import asyncio
import logging
from aiogram import Bot, Dispatcher
from config import BOT_TOKEN
from handlers.user import router as user_router

async def main():
    # Переключили уровень логов на WARNING, чтобы не забивать диск
    logging.basicConfig(level=logging.WARNING)
    
    bot = Bot(token=BOT_TOKEN)
    dp = Dispatcher()
    
    # Регистрация роутеров
    dp.include_router(user_router)
    
    # Оставим сообщение о старте как WARNING, чтобы видеть перезагрузки
    logging.warning("Бот запущен...") 
    await dp.start_polling(bot)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Бот остановлен вручную.")