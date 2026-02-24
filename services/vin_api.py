import aiohttp
import logging
from config import AUTORIA_API_KEY, AUTORIA_USER_ID, BAZAGAI_API_KEY

def get_standard_template(lang: str) -> dict:
    if lang == "uk":
        return {
            "vendor": "Невідомо", "model": "Невідомо", "year": "Немає даних",
            "engine": "Немає даних", "color": "Немає даних", "mileage": "Немає записів",
            "accidents": "Немає записів", "owners_count": "Немає даних", 
            "is_stolen": False, "photo_url": None, "source": ""
        }
    return {
        "vendor": "Неизвестно", "model": "Неизвестно", "year": "Нет данных",
        "engine": "Нет данных", "color": "Нет данных", "mileage": "Нет записей",
        "accidents": "Нет записей", "owners_count": "Нет данных", 
        "is_stolen": False, "photo_url": None, "source": ""
    }

async def fetch_autoria(query: str, session: aiohttp.ClientSession, lang: str) -> dict | None:
    if not AUTORIA_API_KEY or not AUTORIA_USER_ID: 
        return None
    
    url = f"https://developers.ria.com/auto/params/by/vin-code/?user_id={AUTORIA_USER_ID}&api_key={AUTORIA_API_KEY}"
    
    payload = {
        "langId": 4,
        "period": 365,
        "params": {
            "omniId": query
        }
    }
    
    try:
        async with session.post(url, json=payload) as response:
            if response.status == 200:
                data = await response.json()
                
                if "noticeData" in data:
                    for notice in data["noticeData"]:
                        if notice.get("noticeType") == "error":
                            return None
                
                res = get_standard_template(lang)
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
                mil_suffix = "тис. км" if lang == "uk" else "тыс. км"
                if mileage: res["mileage"] = f"{mileage} {mil_suffix}"
                
                return res
            else:
                logging.error(f"AutoRIA Status {response.status}: {await response.text()}")
    except Exception as e:
        logging.error(f"AutoRIA Error: {e}")
    return None

async def fetch_bazagai(query: str, session: aiohttp.ClientSession, lang: str) -> dict | None:
    if not BAZAGAI_API_KEY: return None
    
    query = query.upper().replace(" ", "")
    is_vin = len(query) == 17
    endpoint = "vin" if is_vin else "nomer"
    
    url = f"https://baza-gai.com.ua/{endpoint}/{query}"
    headers = {"X-Api-Key": BAZAGAI_API_KEY, "Accept": "application/json"}
    try:
        async with session.get(url, headers=headers) as response:
            if response.status == 200:
                data = await response.json()
                
                res = get_standard_template(lang)
                res["source"] = "Baza-Gai"
                res["vendor"] = data.get("vendor", "Неизвестно")
                res["model"] = data.get("model", "Неизвестно")
                res["year"] = str(data.get("model_year", "Нет данных"))
                res["photo_url"] = data.get("photo_url")
                res["is_stolen"] = data.get("is_stolen", False)
                
                operations = data.get("operations", [])
                res["owners_count"] = str(len(operations)) if operations else ("Немає даних" if lang == "uk" else "Нет данных")
                
                lang_key = "ua" if lang == "uk" else "ru"
                
                if operations:
                    last_op = operations[0]
                    
                    color_obj = last_op.get("color") or data.get("color")
                    if isinstance(color_obj, dict):
                        res["color"] = color_obj.get(lang_key) or color_obj.get("title") or res["color"]
                    elif color_obj:
                        res["color"] = str(color_obj)
                        
                    capacity = last_op.get("engine_capacity")
                    fuel_obj = last_op.get("fuel")
                    
                    fuel = ""
                    if isinstance(fuel_obj, dict):
                        fuel = fuel_obj.get(lang_key) or fuel_obj.get("title") or ""
                    elif fuel_obj:
                        fuel = str(fuel_obj)
                        
                    engine_parts = []
                    if fuel: engine_parts.append(fuel)
                    if capacity: engine_parts.append(f"{capacity} см³")
                    
                    if engine_parts:
                        res["engine"] = ", ".join(engine_parts)
                        
                return res
            elif response.status == 404:
                return None
            else:
                logging.error(f"Baza-Gai Status {response.status}: {await response.text()}")
    except Exception as e:
        logging.error(f"Baza-Gai Error: {e}")
    return None

async def fetch_vin_data(query: str, lang: str = "ru") -> dict | None:
    query = query.upper().strip()
    
    async with aiohttp.ClientSession() as session:
        data = await fetch_autoria(query, session, lang)
        if data: return data

        data = await fetch_bazagai(query, session, lang)
        if data: return data

    return None

def format_vin_report(data: dict, lang: str = "ru") -> tuple[str, str | None]:
    if lang == "uk":
        wanted_text = "🚨 <b>В РОЗШУКУ!</b>" if data["is_stolen"] else "✅ В розшуку не значиться"
        report = (
            f"🚘 <b>Звіт по авто: {data['vendor']} {data['model']} ({data['year']})</b>\n"
            f"🔍 <i>Джерело: {data['source']}</i>\n\n"
            f"<b>Характеристики:</b>\n"
            f"▪️ Двигун: {data['engine']}\n"
            f"▪️ Колір: {data['color']}\n\n"
            f"<b>Історія:</b>\n"
            f"👥 Записів про реєстрацію: {data['owners_count']}\n"
            f"🛣 Пробіг: {data['mileage']}\n"
            f"💥 ДТП: {data['accidents']}\n\n"
            f"<b>Статус:</b>\n"
            f"{wanted_text}"
        )
    else:
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