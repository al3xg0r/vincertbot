import aiohttp
import logging
from config import AUTORIA_API_KEY, RAPIDAPI_KEY, RAPIDAPI_HOST, BAZAGAI_API_KEY

def get_standard_template() -> dict:
    """Единый шаблон данных для всех API, чтобы не ломать вывод."""
    return {
        "vendor": "Неизвестно", "model": "Неизвестно", "year": "Нет данных",
        "engine": "Нет данных", "color": "Нет данных", "mileage": "Нет записей",
        "accidents": "Нет записей", "owners_count": "Нет данных", 
        "is_stolen": False, "photo_url": None, "source": ""
    }

async def fetch_autoria(vin: str, session: aiohttp.ClientSession) -> dict | None:
    if not AUTORIA_API_KEY: return None
    # Пример эндпоинта AutoRIA (зависит от купленного пакета проверок)
    url = f"https://developers.auto.ria.com/api/checks/info?api_key={AUTORIA_API_KEY}&vin={vin}"
    try:
        async with session.get(url) as response:
            if response.status == 200:
                data = await response.json()
                if "error" in data: return None
                
                res = get_standard_template()
                res["source"] = "AUTO.RIA"
                # Подгоняем поля (адаптируй под реальный ответ API)
                res["vendor"] = data.get("markName", "Неизвестно")
                res["model"] = data.get("modelName", "Неизвестно")
                res["year"] = str(data.get("year", "Нет данных"))
                res["photo_url"] = data.get("photoData", {}).get("seoLinkF")
                return res
    except Exception as e:
        logging.error(f"AutoRIA Error: {e}")
    return None

async def fetch_rapidapi(vin: str, session: aiohttp.ClientSession) -> dict | None:
    if not RAPIDAPI_KEY: return None
    url = f"https://{RAPIDAPI_HOST}/vin/{vin}"
    headers = {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST
    }
    try:
        async with session.get(url, headers=headers) as response:
            if response.status == 200:
                data = await response.json()
                res = get_standard_template()
                res["source"] = "RapidAPI"
                # Пример парсинга типичного VIN декодера
                specs = data.get("specs", {})
                res["vendor"] = specs.get("make", "Неизвестно")
                res["model"] = specs.get("model", "Неизвестно")
                res["year"] = specs.get("year", "Нет данных")
                res["engine"] = specs.get("engine", "Нет данных")
                return res
    except Exception as e:
        logging.error(f"RapidAPI Error: {e}")
    return None

async def fetch_bazagai(vin: str, session: aiohttp.ClientSession) -> dict | None:
    """Резерв для Baza-Gai, когда пришлют ключ."""
    if not BAZAGAI_API_KEY: return None
    url = f"https://baza-gai.com.ua/vin/{vin}"
    headers = {"X-Api-Key": BAZAGAI_API_KEY, "Accept": "application/json"}
    try:
        async with session.get(url, headers=headers) as response:
            if response.status == 200:
                data = await response.json()
                res = get_standard_template()
                res["source"] = "Baza-Gai"
                res["vendor"] = data.get("vendor", "Неизвестно")
                res["model"] = data.get("model", "Неизвестно")
                res["year"] = str(data.get("model_year", "Нет данных"))
                res["color"] = data.get("color", "Нет данных")
                res["photo_url"] = data.get("photo_url")
                res["is_stolen"] = data.get("is_stolen", False)
                operations = data.get("operations", [])
                res["owners_count"] = str(len(operations)) if operations else "Нет данных"
                return res
    except Exception as e:
        logging.error(f"Baza-Gai Error: {e}")
    return None

async def fetch_vin_data(vin: str) -> dict | None:
    """Главная функция: перебирает API по очереди."""
    async with aiohttp.ClientSession() as session:
        # 1. Пробуем AutoRIA
        data = await fetch_autoria(vin, session)
        if data: return data
        
        # 2. Фоллбэк на RapidAPI
        data = await fetch_rapidapi(vin, session)
        if data: return data

        # 3. Фоллбэк на Baza-Gai (сработает, когда добавишь ключ)
        data = await fetch_bazagai(vin, session)
        if data: return data

    return None

def format_vin_report(data: dict) -> tuple[str, str | None]:
    """Форматирует единый словарь в текст."""
    wanted_text = "🚨 <b>В РОЗЫСКЕ!</b>" if data["is_stolen"] else "✅ В розыске не числится"

    report = (
        f"🚘 <b>Отчет по авто: {data['vendor']} {data['model']} ({data['year']})</b>\n"
        f"🔍 <i>Источник данных: {data['source']}</i>\n\n"
        f"<b>Характеристики:</b>\n"
        f"▪️ Двигатель: {data['engine']}\n"
        f"▪️ Цвет: {data['color']}\n\n"
        f"<b>История:</b>\n"
        f"👥 Записей о регистрации: {data['owners_count']}\n"
        f"🛣 Пробег: {data['mileage']}\n"
        f"💥 ДТП: {data['accidents']}\n\n"
        f"<b>Статус:</b>\n"
        f"{wanted_text}"
    )
    
    return report, data["photo_url"]