import re
from aiogram import Router, F
from aiogram.types import Message, ReplyKeyboardMarkup, KeyboardButton
from aiogram.filters import CommandStart
from services.vin_api import fetch_vin_data, format_vin_report

router = Router()

# Словари переводов для интерфейса
TEXTS = {
    'uk': {
        'start': "👋 <b>Ласкаво просимо до VinCertBot!</b>\n\nЯ допоможу дізнатися історію автомобіля по базах України.\nПросто відправ мені <b>VIN-код (17 символів)</b> або <b>держ. номер (наприклад, AA1234BC)</b>.\n\n👇 Використовуй меню нижче для навігації.",
        'btn_check': "🔍 Перевірити авто",
        'btn_about': "ℹ️ Про бота",
        'btn_help': "🆘 Допомога",
        'check_prompt': "🚘 <b>Чекаю номер або VIN!</b>\nНапиши мені держ. номер (наприклад, <code>AA1234BC</code>) або 17-значний VIN-код.",
        'about_text': "🤖 <b>VinCertBot</b> — ваш надійний помічник.\n\n<b>Джерела даних:</b>\n🔸 <b>AUTO.RIA</b> — оголошення про продаж.\n🔸 <b>Baza-Gai</b> — офіційний реєстр МВС України.\n\n<i>Всі дані збираються виключно з відкритих джерел і надаються як є.</i>",
        'help_text': "📖 <b>Як користуватися ботом:</b>\n\n1️⃣ Знайдіть держ. номер авто або його VIN-код.\n2️⃣ Відправте його мені (без пробілів, англійськими літерами).\n3️⃣ Зачекайте пару секунд, поки я зберу звіт.\n\n❗️ <i>Якщо бот нічого не знайшов:</i>\nМожливо, машина не переоформлювалася з 2013 року і не продавалася на популярних майданчиках в інтернеті.",
        'invalid_format': "⚠️ Невірний формат. Відправте 17-значний VIN-код або держ. номер авто (наприклад, AA1234BC).",
        'wait_msg': "⏳ Запитую дані по базах. Зачекайте...",
        'not_found': "❌ Дані за цим запитом не знайдені або сервіс тимчасово недоступний.",
        'placeholder': "Введіть VIN або номер..."
    },
    'ru': {
        'start': "👋 <b>Добро пожаловать в VinCertBot!</b>\n\nЯ помогу узнать историю автомобиля по базам Украины.\nПросто отправь мне <b>VIN-код (17 символов)</b> или <b>гос. номер (например, AA1234BC)</b>.\n\n👇 Используй меню ниже для навигации.",
        'btn_check': "🔍 Проверить авто",
        'btn_about': "ℹ️ О боте",
        'btn_help': "🆘 Помощь",
        'check_prompt': "🚘 <b>Жду номер или VIN!</b>\nНапиши мне гос. номер (например, <code>AA1234BC</code>) или 17-значный VIN-код.",
        'about_text': "🤖 <b>VinCertBot</b> — ваш надежный помощник.\n\n<b>Источники данных:</b>\n🔸 <b>AUTO.RIA</b> — объявления о продаже.\n🔸 <b>Baza-Gai</b> — официальный реестр МВД Украины.\n\n<i>Все данные собираются исключительно из открытых источников и предоставляются как есть.</i>",
        'help_text': "📖 <b>Как пользоваться ботом:</b>\n\n1️⃣ Найдите гос. номер авто или его VIN-код.\n2️⃣ Отправьте его мне (без пробелов, английскими буквами).\n3️⃣ Подождите пару секунд, пока я соберу отчет.\n\n❗️ <i>Если бот ничего не нашел:</i>\nВозможно, машина не переоформлялась с 2013 года и не продавалась на популярных площадках в интернете.",
        'invalid_format': "⚠️ Неверный формат. Отправьте 17-значный VIN-код или гос. номер авто (например, AA1234BC).",
        'wait_msg': "⏳ Запрашиваю данные по базам. Подождите...",
        'not_found': "❌ Данные по этому запросу не найдены или сервис временно недоступен.",
        'placeholder': "Введите VIN или номер..."
    }
}

def get_lang(message: Message) -> str:
    # Телеграм передает язык клиента пользователя (uk, ru, en и т.д.)
    lang_code = message.from_user.language_code
    if lang_code and lang_code.startswith("uk"):
        return "uk"
    return "ru" # По умолчанию для всех остальных

def get_menu(lang: str) -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text=TEXTS[lang]['btn_check'])],
            [KeyboardButton(text=TEXTS[lang]['btn_about']), KeyboardButton(text=TEXTS[lang]['btn_help'])]
        ],
        resize_keyboard=True,
        input_field_placeholder=TEXTS[lang]['placeholder']
    )

@router.message(CommandStart())
async def cmd_start(message: Message):
    lang = get_lang(message)
    await message.answer(TEXTS[lang]['start'], reply_markup=get_menu(lang), parse_mode="HTML")

# Используем in_ для отлова кнопок на любом из языков
@router.message(F.text.in_({TEXTS['ru']['btn_check'], TEXTS['uk']['btn_check']}))
async def btn_check_auto(message: Message):
    lang = get_lang(message)
    await message.answer(TEXTS[lang]['check_prompt'], parse_mode="HTML")

@router.message(F.text.in_({TEXTS['ru']['btn_about'], TEXTS['uk']['btn_about']}))
async def btn_about(message: Message):
    lang = get_lang(message)
    await message.answer(TEXTS[lang]['about_text'], parse_mode="HTML")

@router.message(F.text.in_({TEXTS['ru']['btn_help'], TEXTS['uk']['btn_help']}))
async def btn_help(message: Message):
    lang = get_lang(message)
    await message.answer(TEXTS[lang]['help_text'], parse_mode="HTML")

@router.message(F.text)
async def handle_vin_request(message: Message):
    lang = get_lang(message)
    query = message.text.strip().upper().replace(" ", "")
    
    if len(query) < 4 or len(query) > 17:
        await message.answer(TEXTS[lang]['invalid_format'])
        return

    msg = await message.answer(TEXTS[lang]['wait_msg'])

    # Передаем язык в парсер для перевода ответов базы
    data = await fetch_vin_data(query, lang)
    
    if not data:
        await msg.edit_text(TEXTS[lang]['not_found'])
        return

    report_text, photo_url = format_vin_report(data, lang)

    if photo_url:
        await message.answer_photo(photo=photo_url, caption=report_text, parse_mode="HTML")
        await msg.delete()
    else:
        await msg.edit_text(report_text, parse_mode="HTML")