import aiohttp
import logging
from config import VIN_API_KEY, VIN_API_URL

async def fetch_vin_data(vin: str) -> dict | None:
    """Запрашивает данные по VIN из API Baza-Gai."""
    headers = {
        "X-Api-Key": VIN_API_KEY,
        "Accept": "application/json"
    }
    
    # Baza-gai использует URL формата: https://baza-gai.com.ua/vin/{vin}
    url = f"{VIN_API_URL}/{vin}"
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(url, headers=headers) as response:
                if response.status == 200:
                    return await response.json()
                elif response.status == 404:
                    logging.info(f"Авто с VIN {vin} не найдено в базе.")
                    return None
                else:
                    logging.error(f"API Error {response.status}: {await response.text()}")
                    return None
        except Exception as e:
            logging.error(f"Connection error: {e}")
            return None

def format_vin_report(data: dict) -> tuple[str, str | None]:
    """Форматирует JSON ответ Baza-Gai в читабельный текст. Возвращает (Текст_отчета, URL_фото)."""
    
    # Основные данные
    vendor = data.get("vendor", "Неизвестно")
    model = data.get("model", "Неизвестно")
    year = data.get("model_year", "Нет данных")
    color = data.get("color", "Нет данных")
    digits = data.get("digits", "Нет данных")
    
    # Розыск
    is_stolen = data.get("is_stolen", False)
    wanted_text = "🚨 <b>В РОЗЫСКЕ!</b>" if is_stolen else "✅ В розыске не числится"
    
    # Регистрации (владельцы)
    operations = data.get("operations", [])
    owners_count = len(operations) if operations else "Нет данных"
    
    last_operation = "Нет записей"
    if operations:
        # Берем последнюю операцию (обычно нулевой элемент)
        last_op = operations[0]
        date = last_op.get("registered_at", "Неизвестная дата")
        dep = last_op.get("department", "Неизвестный СЦ")
        notes = last_op.get("notes", "")
        last_operation = f"{date} ({notes}) — {dep}"

    # Фото (если доступно в API)
    photo_url = data.get("photo_url")

    report = (
        f"🚘 <b>Отчет по авто: {vendor} {model} ({year})</b>\n\n"
        f"<b>Идентификация:</b>\n"
        f"▪️ Гос. номер: {digits}\n"
        f"▪️ Цвет: {color}\n\n"
        f"<b>История:</b>\n"
        f"👥 Записей о регистрации: {owners_count}\n"
        f"📝 Последняя операция:\n<i>{last_operation}</i>\n\n"
        f"<b>Статус:</b>\n"
        f"{wanted_text}"
    )
    
    return report, photo_url