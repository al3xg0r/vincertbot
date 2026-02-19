import aiohttp
import logging
import json
from config import AUTORIA_API_KEY, RAPIDAPI_KEY, RAPIDAPI_HOST, BAZAGAI_API_KEY

def get_standard_template() -> dict:
    return {
        "vendor": "Неизвестно", "model": "Неизвестно", "year": "Нет данных",
        "engine": "Нет данных", "color": "Нет данных", "mileage": "Нет записей",
        "accidents": "Нет записей", "owners_count": "Нет данных", 
        "is_stolen": False, "photo_url": None, "source": ""
    }

async def fetch_autoria(vin: str, session: aiohttp.ClientSession) -> dict | None:
    if not AUTORIA_API_KEY: return None
    url = f"https://developers.auto.ria.com/api/checks/info?api_key={AUTORIA_API_KEY}&vin={vin}"
    try:
        async with session.get(url) as response:
            if response.status == 200:
                data = await response.json()
                if "error" in data: return None
                res = get_standard_template()
                res["source"] = "AUTO.RIA"
                res["vendor"] = data.get("markName", "Неизвестно")
                res["model"] = data.get("modelName", "Неизвестно")
                res["year"] = str(data.get("year", "Нет данных"))
                res["photo_url"] = data.get("photoData", {}).get("seoLinkF")
                return res
            else:
                logging.error(f"AutoRIA Status {response.status}: {await response.text()}")
    except Exception as e:
        logging.error(f"AutoRIA Error: {e}")
    return None

async def fetch_rapidapi(vin: str, session: aiohttp.ClientSession) -> dict | None:
    if not RAPIDAPI_KEY: return None
    
    url = f"https://{RAPIDAPI_HOST}/vin_decoder_standard?vin={vin}" 
    
    headers = {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST
    }
    try:
        async with session.get(url, headers=headers) as response:
            if response.status == 200:
                raw_text = await response.text()
                logging.info(f"RapidAPI RAW JSON: {raw_text}") 
                data = json.loads(raw_text)
                
                # Обработка ответа "FAILED" от провайдера
                if data.get("Status") == "FAILED":
                    logging.warning(f"RapidAPI не нашел данные для VIN {vin}")
                    return None
                    
                res = get_standard_template()
                res["source"] = "RapidAPI"
                
                # Универсальный парсинг для успешного ответа (ищем с большой и маленькой буквы)
                res["vendor"] = str(data.get("Make", data.get("make", "Неизвестно")))
                res["model"] = str(data.get("Model", data.get("model", "Неизвестно")))
                res["year"] = str(data.get("Year", data.get("year", "Нет данных")))
                res["engine"] = str(data.get("Engine", data.get("engine", "Нет данных")))
                
                return res
            else:
                logging.error(f"RapidAPI Status {response.status}: {await response.text()}")
    except Exception as e:
        logging.error(f"RapidAPI Error: {e}")
    return None

async def fetch_bazagai(vin: str, session: aiohttp.ClientSession) -> dict | None:
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
            else:
                logging.error(f"Baza-Gai Status {response.status}: {await response.text()}")
    except Exception as e:
        logging.error(f"Baza-Gai Error: {e}")
    return None

async def fetch_vin_data(vin: str) -> dict | None:
    async with aiohttp.ClientSession() as session:
        data = await fetch_autoria(vin, session)
        if data: return data
        
        data = await fetch_rapidapi(vin, session)
        if data: return data

        data = await fetch_bazagai(vin, session)
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