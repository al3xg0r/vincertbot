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
        "для получения полного отчета по базам Украины."
    )

@router.message(F.text)
async def handle_vin_request(message: Message):
    vin = message.text.strip().upper()
    
    # Проверка формата VIN (17 символов, исключая I, O, Q)
    if not re.match(r"^[A-HJ-NPR-Z0-9]{17}$", vin):
        await message.answer("⚠️ Неверный формат. VIN-код должен состоять ровно из 17 символов (латиница и цифры).")
        return

    msg = await message.answer("⏳ Запрашиваю данные по базам. Подождите...")

    data = await fetch_vin_data(vin)
    
    if not data:
        await msg.edit_text("❌ Данные по этому VIN не найдены или сервис временно недоступен.")
        return

    report_text, photo_url = format_vin_report(data)

    # Если есть фото, отправляем его с текстом (caption). Иначе просто текст.
    if photo_url:
        await message.answer_photo(photo=photo_url, caption=report_text, parse_mode="HTML")
        await msg.delete()
    else:
        await msg.edit_text(report_text, parse_mode="HTML")
