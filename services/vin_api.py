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

async def fetch_autoria(vin: str, session: aiohttp.ClientSession) -> dict | None:
    if not AUTORIA_API_KEY or not AUTORIA_USER_ID: 
        return None
    
    url = f"https://developers.ria.com/auto/params/by/vin-code/?user_id={AUTORIA_USER_ID}&api_key={AUTORIA_API_KEY}"
    
    payload = {
        "langId": 4,
        "period": 365,
        "params": {
            "omniId": vin
        }
    }
    
    try:
        async with session.post(url, json=payload) as response:
            if response.status == 200:
                data = await response.json()
                
                # Обработка ошибки "Некоректні вхідні данні" (Машины нет на АвтоРИА)
                if "noticeData" in data:
                    for notice in data["noticeData"]:
                        if notice.get("noticeType") == "error":
                            logging.info(f"AutoRIA: Машина с VIN {vin} не продавалась на сайте (Некоректні вхідні данні).")
                            return None
                
                # Если ошибки нет, выводим сырой JSON успешного ответа в лог для написания парсера
                logging.info(f"AutoRIA SUCCESS JSON: {data}")
                
                res = get_standard_template()
                res["source"] = "AUTO.RIA"
                res["vendor"] = "Тест (Ждем успешный лог)"
                return res
            else:
                logging.error(f"AutoRIA Status {response.status}: {await response.text()}")
    except Exception as e:
        logging.error(f"AutoRIA Error: {e}")
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
            elif response.status == 404:
                logging.info(f"Baza-Gai: авто с VIN {vin} не найдено в базе.")
                return None
            else:
                logging.error(f"Baza-Gai Status {response.status}: {await response.text()}")
    except Exception as e:
        logging.error(f"Baza-Gai Error: {e}")
    return None

async def fetch_vin_data(vin: str) -> dict | None:
    async with aiohttp.ClientSession() as session:
        data = await fetch_autoria(vin, session)
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