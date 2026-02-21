import re
from aiogram import Router, F
from aiogram.types import Message
from aiogram.filters import CommandStart
from services.vin_api import fetch_vin_data, format_vin_report

router = Router()

@router.message(CommandStart())
async def cmd_start(message: Message):
    await message.answer(
        "Привет! Отправь мне VIN-код автомобиля (17 символов) "
        "или гос. номер (например, AA1234BC) для получения полного отчета по базам Украины."
    )

@router.message(F.text)
async def handle_vin_request(message: Message):
    # Убираем лишние пробелы по краям и внутри, переводим в верхний регистр
    query = message.text.strip().upper().replace(" ", "")
    
    # Проверка длины: от 4 до 17 символов (чтобы пропускать и номера, и VIN)
    if len(query) < 4 or len(query) > 17:
        await message.answer("⚠️ Неверный формат. Отправьте 17-значный VIN-код или гос. номер авто (например, AA1234BC).")
        return

    msg = await message.answer("⏳ Запрашиваю данные по базам. Подождите...")

    # Передаем очищенный запрос в нашу универсальную функцию
    data = await fetch_vin_data(query)
    
    if not data:
        await msg.edit_text("❌ Данные по этому запросу не найдены или сервис временно недоступен.")
        return

    report_text, photo_url = format_vin_report(data)

    # Если есть фото, отправляем его с текстом (caption). Иначе просто текст.
    if photo_url:
        await message.answer_photo(photo=photo_url, caption=report_text, parse_mode="HTML")
        await msg.delete()
    else:
        await msg.edit_text(report_text, parse_mode="HTML")