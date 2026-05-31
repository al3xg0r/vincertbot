# 🚘 VinCertBot

A Telegram bot for quick and convenient checking of vehicle history using Ukrainian databases. The bot aggregates data from open sources and generates a clear, easy-to-read report with specifications, mileage, registration history, and wanted/stolen status.

## 🌟 Features

* **Smart Search:** Supports searching by both a 17-character VIN code and a state license plate (e.g., `AA1234BC`).
* **Cascade System (Fallback):** If data is missing on one platform (e.g., the car was never sold online), the bot automatically and seamlessly switches to the Ministry of Internal Affairs (MIA) database.
* **Bilingual Support:** Automatically detects the user's Telegram app language and responds in Ukrainian (`uk`) or Russian (`ru`).
* **Deep Parsing:** Extracts not only the make and year but also the color, fuel type, and engine capacity directly from the registration history.

## 🔌 Integrations (Data Sources)

1. **[AUTO.RIA API](https://developers.ria.com/)** — checking vehicles that have been listed for sale (parsing trim levels, mileage, photos).
2. **[Baza-Gai](https://baza-gai.com.ua/) (MIA of Ukraine)** — the official vehicle registry (registration history since 2013, ownership changes, stolen vehicle checks).

## Tech Stack
- **JavaScript (ES Modules)**
- **Cloudflare Workers** (Serverless execution)
- **Telegram Bot API** (Webhooks)
- **Baza-Gai & AUTO.RIA APIs**

## 📄 License

This project is distributed under the **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)** license. 
You are free to study, modify, and use the code for personal purposes, but **commercial use (selling, monetizing, using in a business) is strictly prohibited**. See the `LICENSE` file for details.
