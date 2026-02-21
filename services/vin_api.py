import aiohttp
import logging
from config import AUTORIA_API_KEY, AUTORIA_USER_ID, BAZAGAI_API_KEY

def get_standard_template() -> dict:
    return {
        "vendor": "Неизвестно", "model": "Неизвестно", "year": "Нет данных",
        "engine": "Нет данных", "color": "Нет данных", "mileage": "Нет записей",
        "accidents": "Нет записей", "owners_count": "Нет данных", 
        "is_stolen": False, "photo_url": None, "source": ""
    }

async def fetch_autoria(query: str, session: aiohttp.ClientSession) -> dict | None:
    if not AUTORIA_API_KEY or not AUTORIA_USER_ID: 
        return None
    
    url = f"https://developers.ria.com/auto/params/by/vin-code/?user_id={AUTORIA_USER_ID}&api_key={AUTORIA_API_KEY}"
    
    payload = {
        "langId": 4,
        "period": 365,
        "params": {
            "omniId": query  # AutoRIA умеет переваривать и VIN, и гос. номера через один параметр
        }
    }
    
    try:
        async with session.post(url, json=payload) as response:
            if response.status == 200:
                data = await response.json()
                
                if "noticeData" in data:
                    for notice in data["noticeData"]:
                        if notice.get("noticeType") == "error":
                            logging.info(f"AutoRIA: Машина с '{query}' не найдена на сайте.")
                            return None
                
                res = get_standard_template()
                res["source"] = "AUTO.RIA"
                
                chips = data.get("chipsData", {}).get("chips", [])
                
                def get_chip_name(entity_name):
                    for c in chips:
                        if c.get("entity") == entity_name:
                            return c.get("name", "")
                    return ""
                    
                def get_chip_value_gte(entity_name):
                    for c in chips:
                        if c.get("entity") == entity_name:
                            val = c.get("value", {})
                            if isinstance(val, dict):
                                return val.get("gte", "")
                    return ""

                vendor = get_chip_name("brandId")
                model = get_chip_name("modelId")
                if vendor: res["vendor"] = vendor
                if model: res["model"] = model
                
                year = get_chip_value_gte("year")
                if year: res["year"] = str(year)
                
                color = get_chip_name("colorId")
                if color: res["color"] = color
                
                fuel = get_chip_name("fuelId")
                modification = get_chip_name("modificationId")
                engine = f"{fuel}, {modification}".strip(", ")
                if engine: res["engine"] = engine
                
                mileage = get_chip_value_gte("mileage")
                if mileage: res["mileage"] = f"{mileage} тис. км"
                
                return res
            else:
                logging.error(f"AutoRIA Status {response.status}: {await response.text()}")
    except Exception as e:
        logging.error(f"AutoRIA Error: {e}")
    return None

async def fetch_bazagai(query: str, session: aiohttp.ClientSession) -> dict | None:
    if not BAZAGAI_API_KEY: return None
    
    # Очищаем запрос от пробелов и делаем заглавными
    query = query.upper().replace(" ", "")
    
    # Если 17 символов — это VIN, иначе — гос. номер
    is_vin = len(query) == 17
    endpoint = "vin" if is_vin else "nomer"
    
    url = f"https://baza-gai.com.ua/{endpoint}/{query}"
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
            elif response.status == 404:
                logging.info(f"Baza-Gai: авто с '{query}' не найдено в базе.")
                return None
            else:
                logging.error(f"Baza-Gai Status {response.status}: {await response.text()}")
    except Exception as e:
        logging.error(f"Baza-Gai Error: {e}")
    return None

async def fetch_vin_data(query: str) -> dict | None:
    # Санитаризация ввода (убираем случайные пробелы до и после)
    query = query.upper().strip()
    
    async with aiohttp.ClientSession() as session:
        data = await fetch_autoria(query, session)
        if data: return data

        data = await fetch_bazagai(query, session)
        if data: return data

    return None

def format_vin_report(data: dict) -> tuple[str, str | None]:
    wanted_text = "🚨 <b>В РОЗЫСКЕ!</b>" if data["is_stolen"] else "✅ В розыске не числится"

    report = (
        f"🚘 <b>Отчет по авто: {data['vendor']} {data['model']} ({data['year']})</b>\n"
        f"🔍 <i>Источник: {data['source']}</i>\n\n"
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