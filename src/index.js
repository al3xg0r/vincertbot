// Localization dictionaries
const i18n = {
  ru: {
    start: "👋 <b>Добро пожаловать в VinCertBot!</b>\n\nЯ помогу узнать историю автомобиля по базам Украины.\nПросто отправь мне <b>VIN-код (17 символов)</b> или <b>гос. номер (например, AA1234BC)</b>.\n\n👇 Используй меню ниже для навигации.",
    btn_check: "🔍 Проверить авто",
    btn_about: "ℹ️ О боте",
    btn_help: "🆘 Помощь",
    check_prompt: "🚘 <b>Жду номер или VIN!</b>\nНапиши мне гос. номер (например, <code>AA1234BC</code>) или 17-значный VIN-код.",
    about_text: "🤖 <b>VinCertBot</b> — ваш надежный помощник.\n\n<b>Источники данных:</b>\n🔸 <b>AUTO.RIA</b> — объявления о продаже.\n🔸 <b>Baza-Gai</b> — официальный реестр МВД Украины.\n\n<i>Все данные собираются исключительно из открытых источников и предоставляются как есть.</i>",
    help_text: "📖 <b>Как пользоваться ботом:</b>\n\n1️⃣ Найдите гос. номер авто или его VIN-код.\n2️⃣ Отправьте его мне (без пробелов, английскими буквами).\n3️⃣ Подождите пару секунд, пока я соберу отчет.\n\n❗️ <i>Если бот ничего не нашел:</i>\nВозможно, машина не переоформлялась с 2013 года и не продавалась на популярных площадках в интернете.",
    invalid_format: "⚠️ Неверный формат. Отправьте 17-значный VIN-код или гос. номер авто (например, AA1234BC).",
    wait_msg: "⏳ Запрашиваю данные по базам. Подождите...",
    not_found: "❌ Данные по этому запросу не найдены или сервис временно недоступен.",
    report_title: "📊 <b>Отчет по автомобилю:</b>",
    stolen_yes: "🚨 <b>В РОЗЫСКЕ!</b>",
    stolen_no: "✅ В розыске не числится"
  },
  uk: {
    start: "👋 <b>Ласкаво просимо до VinCertBot!</b>\n\nЯ допоможу дізнатися історію автомобіля за базами України.\nПросто відправ мені <b>VIN-код (17 символів)</b> або <b>держ. номер (наприклад, AA1234BC)</b>.\n\n👇 Використовуй меню нижче для навігації.",
    btn_check: "🔍 Перевірити авто",
    btn_about: "ℹ️ Про бота",
    btn_help: "🆘 Допомога",
    check_prompt: "🚘 <b>Чекаю номер або VIN!</b>\nНапиши мені держ. номер (наприклад, <code>AA1234BC</code>) або 17-значний VIN-код.",
    about_text: "🤖 <b>VinCertBot</b> — ваш надійний помічник.\n\n<b>Джерела даних:</b>\n🔸 <b>AUTO.RIA</b> — оголошення про продаж.\n🔸 <b>Baza-Gai</b> — офіційний реєстр МВС України.\n\n<i>Всі дані збираються виключно з відкритих джерел і надаються як є.</i>",
    help_text: "📖 <b>Як користуватися ботом:</b>\n\n1️⃣ Знайдіть держ. номер авто або його VIN-код.\n2️⃣ Відправте його мені (без пробілів, англійськими літерами).\n3️⃣ Зачекайте пару секунд, поки я зберу звіт.\n\n❗️ <i>Якщо бот нічого не знайшов:</i>\nМожливо, машина не переоформлялася з 2013 року і не продавалася на популярних майданчиках в інтернеті.",
    invalid_format: "⚠️ Невірний формат. Відправте 17-значний VIN-код або держ. номер авто (наприклад, AA1234BC).",
    wait_msg: "⏳ Запитую дані з баз. Зачекайте...",
    not_found: "❌ Дані за цим запитом не знайдені або сервіс тимчасово недоступний.",
    report_title: "📊 <b>Звіт по автомобілю:</b>",
    stolen_yes: "🚨 <b>У РОЗШУКУ!</b>",
    stolen_no: "✅ В розшуку не перебуває"
  }
};

export default {
  async fetch(request, env, ctx) {
    // Only accept POST requests for Webhooks
    if (request.method !== "POST") {
      return new Response("OK", { status: 200 });
    }

    try {
      const payload = await request.json();

      // Ensure we immediately return 200 OK to Telegram so it doesn't retry
      // while we process APIs in the background.
      ctx.waitUntil(handleUpdate(payload, env));
      
      return new Response("OK", { status: 200 });
    } catch (e) {
      return new Response("Error", { status: 500 });
    }
  }
};

// Main Telegram Update Handler
async function handleUpdate(update, env) {
  const message = update.message;
  
  if (!message || !message.text) return;

  const chatId = message.chat.id;
  const text = message.text.trim().toUpperCase();
  
  // Detect language. Fallback to 'ru' if not 'uk'
  let userLang = message.from?.language_code === 'uk' ? 'uk' : 'ru';
  const t = i18n[userLang];

  // Regex patterns
  const isVin = /^[A-HJ-NPR-Z0-9]{17}$/.test(text);
  const isPlate = /^[A-Z]{2}\d{4}[A-Z]{2}$/.test(text.replace(/\s+/g, ''));

  // Main Menu Keyboard
  const replyKeyboard = {
    keyboard: [
      [{ text: t.btn_check }],
      [{ text: t.btn_about }, { text: t.btn_help }]
    ],
    resize_keyboard: true
  };

  // Handle standard buttons / commands
  if (text === "/START") {
    await sendTelegramMessage(env.BOT_TOKEN, chatId, t.start, replyKeyboard);
    return;
  }

  if (text === t.btn_check.toUpperCase()) {
    await sendTelegramMessage(env.BOT_TOKEN, chatId, t.check_prompt, replyKeyboard);
    return;
  }

  if (text === t.btn_about.toUpperCase()) {
    await sendTelegramMessage(env.BOT_TOKEN, chatId, t.about_text, replyKeyboard);
    return;
  }

  if (text === t.btn_help.toUpperCase()) {
    await sendTelegramMessage(env.BOT_TOKEN, chatId, t.help_text, replyKeyboard);
    return;
  }

  // Handle Search Request
  if (isVin || isPlate) {
    const query = text.replace(/\s+/g, '');
    
    // Send Wait Message and keep its ID to edit later
    const waitMsgRes = await sendTelegramMessage(env.BOT_TOKEN, chatId, t.wait_msg);
    const waitMsgId = waitMsgRes.result?.message_id;

    // Fetch Data
    const report = await fetchCarData(query, isVin, isPlate, env, t);

    // Edit the wait message with the result
    if (waitMsgId) {
      await editTelegramMessage(env.BOT_TOKEN, chatId, waitMsgId, report);
    } else {
      await sendTelegramMessage(env.BOT_TOKEN, chatId, report);
    }
  } else {
    // Invalid input
    await sendTelegramMessage(env.BOT_TOKEN, chatId, t.invalid_format, replyKeyboard);
  }
}

// Fetch APIs: BazaGai (Primary) & AutoRIA (Secondary)
async function fetchCarData(query, isVin, isPlate, env, t) {
  try {
    let endpoint = isPlate 
        ? `https://baza-gai.com.ua/nomer/${query}` 
        : `https://baza-gai.com.ua/vin/${query}`;

    const gaiResponse = await fetch(endpoint, {
      headers: {
        "Accept": "application/json",
        "X-Api-Key": env.BAZAGAI_API_KEY
      }
    });

    if (!gaiResponse.ok) {
      return t.not_found;
    }

    const data = await gaiResponse.json();

    // Formatting the report
    let msg = `${t.report_title}\n\n`;
    msg += `🚘 <b>Авто:</b> ${data.vendor} ${data.model} (${data.model_year})\n`;
    
    if (data.digits) msg += `🔢 <b>Номер:</b> <code>${data.digits}</code>\n`;
    if (data.vin) msg += `⚙️ <b>VIN:</b> <code>${data.vin}</code>\n`;
    
    msg += `\n${data.is_stolen ? t.stolen_yes : t.stolen_no}\n`;

    if (data.operations && data.operations.length > 0) {
      msg += `\n📋 <b>Регистрации:</b>\n`;
      data.operations.slice(0, 3).forEach((op, idx) => {
        msg += `<i>${op.date}</i> - ${op.operation.ru || op.operation.ua}\n`;
      });
    }

    // Attempting to append AutoRIA photo if available
    if (data.photo_url) {
      msg += `\n📸 <a href="${data.photo_url}">Фото автомобиля</a>`;
    }

    return msg;
  } catch (err) {
    return t.not_found;
  }
}

// Telegram API interaction helpers
async function sendTelegramMessage(token, chatId, text, keyboard = null) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const body = {
    chat_id: chatId,
    text: text,
    parse_mode: "HTML",
    disable_web_page_preview: false
  };

  if (keyboard) body.reply_markup = keyboard;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return await res.json();
}

async function editTelegramMessage(token, chatId, messageId, text) {
  const url = `https://api.telegram.org/bot${token}/editMessageText`;
  const body = {
    chat_id: chatId,
    message_id: messageId,
    text: text,
    parse_mode: "HTML",
    disable_web_page_preview: false
  };

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}
