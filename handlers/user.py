import re
from aiogram import Router, F
from aiogram.types import Message, ReplyKeyboardMarkup, KeyboardButton
from aiogram.filters import CommandStart
from services.vin_api import fetch_vin_data, format_vin_report

router = Router()

# Создаем красивое постоянное меню с кнопками
main_menu = ReplyKeyboardMarkup(
    keyboard=[
        [KeyboardButton(text="🔍 Проверить авто")],
        [KeyboardButton(text="ℹ️ О боте"), KeyboardButton(text="🆘 Помощь")]
    ],
    resize_keyboard=True, # Подгоняет размер кнопок под экран
    input_field_placeholder="Введите VIN или гос. номер..." # Текст-подсказка в строке ввода
)

@router.message(CommandStart())
async def cmd_start(message: Message):
    text = (
        "👋 <b>Добро пожаловать в VinCertBot!</b>\n\n"
        "Я помогу узнать историю автомобиля по базам Украины.\n"
        "Просто отправь мне <b>VIN-код (17 символов)</b> или <b>гос. номер (например, AA1234BC)</b>.\n\n"
        "👇 Используй меню ниже для навигации."
    )
    # Отправляем сообщение вместе с нашим меню
    await message.answer(text, reply_markup=main_menu, parse_mode="HTML")

@router.message(F.text == "🔍 Проверить авто")
async def btn_check_auto(message: Message):
    await message.answer(
        "🚘 <b>Жду номер или VIN!</b>\n"
        "Напиши мне гос. номер (например, <code>AA1234BC</code>) или 17-значный VIN-код.",
        parse_mode="HTML"
    )

@router.message(F.text == "ℹ️ О боте")
async def btn_about(message: Message):
    text = (
        "🤖 <b>VinCertBot</b> — ваш надежный помощник.\n\n"
        "<b>Источники данных:</b>\n"
        "🔸 <b>AUTO.RIA</b> — объявления о продаже.\n"
        "🔸 <b>Baza-Gai</b> — официальный реестр МВД Украины.\n\n"
        "<i>Все данные собираются исключительно из открытых источников и предоставляются как есть.</i>"
    )
    await message.answer(text, parse_mode="HTML")

@router.message(F.text == "🆘 Помощь")
async def btn_help(message: Message):
    text = (
        "📖 <b>Как пользоваться ботом:</b>\n\n"
        "1️⃣ Найдите гос. номер авто или его VIN-код.\n"
        "2️⃣ Отправьте его мне (без пробелов, английскими буквами).\n"
        "3️⃣ Подождите пару секунд, пока я соберу отчет.\n\n"
        "❗️ <i>Если бот ничего не нашел:</i>\n"
        "Возможно, машина не переоформлялась с 2013 года и не продавалась на популярных площадках в интернете."
    )
    await message.answer(text, parse_mode="HTML")

@router.message(F.text)
async def handle_vin_request(message: Message):
    # Убираем лишние пробелы по краям и внутри, переводим в верхний регистр
    query = message.text.strip().upper().replace(" ", "")
    
    # Проверка длины: от 4 до 17 символов
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