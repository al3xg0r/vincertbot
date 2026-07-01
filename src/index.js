// Localization dictionaries
const i18n = {
  ru: {
    start: "👋 <b>Добро пожаловать в VinCertBot!</b>\n\nЯ помогу узнать историю автомобиля по базам Украины.\nПросто отправь мне <b>VIN-код (17 символов)</b> или <b>гос. номер</b>.\n\nПоддерживается ввод на кириллице и латинице!",
    btn_check: "🔍 Проверить авто",
    btn_about: "ℹ️ О боте",
    btn_help: "🆘 Помощь",
    btn_support: "❤️ Поддержать",
    check_prompt: "🚘 <b>Жду номер или VIN!</b>\nНапишите мне гос. номер или VIN-код.\n<i>Можно использовать русские буквы (АА1234ББ).</i>",
    about_text: "🤖 <b>VinCertBot</b> — ваш надежный помощник.\n\n<b>Источники данных:</b>\n🔸 <b>AUTO.RIA</b> — объявления о продаже.\n🔸 <b>Baza-Gai</b> — официальный реестр МВД Украины.\n\n<i>Все данные собираются исключительно из открытых источников.</i>",
    help_text: "📖 <b>Инструкция:</b>\n\n1️⃣ Введите гос. номер или VIN.\n2️⃣ Ждите секунду.\n3️⃣ Получите отчет.\n\n❗️ <i>Если ничего не найдено:</i><br>Машина могла не переоформляться с 2013 года.",
    invalid_format: "⚠️ Неверный формат.<br>Введите VIN (17 символов) или гос. номер (напр. АА1234ББ).",
    wait_msg: "⏳ Ищем информацию в базах...",
    not_found: "❌ Данные не найдены или сервис временно недоступен.",
    report_title: "📊 <b>Отчет по автомобилю:</b>",
    stolen_yes: "🚨 <b>В РОЗЫСКЕ!</b>",
    stolen_no: "✅ Чисто, в розыске не числится",
    support_success: "Спасибо за вашу поддержку! 🙏\nЭто помогает развивать бота лучше.",
    cmd_start: "Запуск бота",
    cmd_check: "Проверка авто",
    cmd_about: "О проекте",
    cmd_help: "Помощь"
  },
  uk: {
    start: "👋 <b>Ласкаво просимо до VinCertBot!</b>\n\nЯ допоможу дізнатися історію автомобіля за базами України.\nПросто відправ мені <b>VIN-код</b> або <b>держ. номер</b>.\n\nПідтримується введення кирилицею та латиною!",
    btn_check: "🔍 Перевірити авто",
    btn_about: "ℹ️ Про бота",
    btn_help: "🆘 Допомога",
    btn_support: "❤️ Підтримати",
    check_prompt: "🚘 <b>Чекаю номер або VIN!</b>\nНапишіть держ. номер або VIN.\n<i>Можна використовувати російські літери (АА1234ББ).</i>",
    about_text: "🤖 <b>VinCertBot</b> — ваш надійний помічник.\n\n<b>Джерела даних:</b>\n🔸 <b>AUTO.RIA</b> — оголошення про продаж.\n🔸 <b>Baza-Gai</b> — офіційний реєстр МВС України.\n\n<i>Всі дані збираються лише з відкритих джерел.</i>",
    help_text: "📖 <b>Інструкція:</b>\n\n1️⃣ Введіть номер або VIN.\n2️⃣ Зачекайте секунду.\n3️⃣ Отримайте звіт.\n\n❗️ <i>Якщо нічого немає:</i><br>Машину могло не переоформляти з 2013 року.",
    invalid_format: "⚠️ Невірний формат.<br>Введіть VIN або номер (напр. АА1234ББ).",
    wait_msg: "⏳ Шукаємо інформацію в базах...",
    not_found: "❌ Дані не знайдено або сервіс тимчасово недоступний.",
    report_title: "📊 <b>Звіт по автомобілю:</b>",
    stolen_yes: "🚨 <b>У РОЗШУКУ!</b>",
    stolen_no: "✅ У розшуку не перебуває",
    support_success: "Дякую за підтримку! 🙏\nЦе допомагає покращувати бота.",
    cmd_start: "Запуск бота",
    cmd_check: "Перевірка авто",
    cmd_about: "Про проект",
    cmd_help: "Допомога"
  }
};

// Support configuration
const SUPPORT_USER_ID = "@tg_agteam_bot"; 
const SUPPORT_LINK = "https://agteambot.hubapps.workers.dev/app/?project=VinCertBot";

// Helper to transliterate Cyrillic plates to Latin
function toLatin(str) {
  const map = {
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'H', 'Є': 'E', 'И': 'Y', 'І': 'I', 
    'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'Р': 'P', 'С': 'C', 
    'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ч': 'Ch', 'Ш': 'Sh', 
    'Ї': 'Yi', 'Ю': 'Yu', 'Я': 'Ya',
    // Russian equivalents often used by users
    'Ё': 'YO', 'Ц': 'Ts', 'Э': 'E', 'Ъ': '', 'Ь': ''
  };
  return str.split('').map(char => map[char.toUpperCase()] || char).join('');
}

// Regex patterns (strict for validation after conversion)
const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/;
// Standard UA plate pattern: AA 1234 BB -> AAAA1234BB format expected by API usually, but let's match structure
// LL DDDD LL (e.g., AC1234AB)
const PLATE_REGEX = /^[A-Z]{2}\d{4}[A-Z]{2}$/;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle GET request to set webhook automatically from Cloudflare infrastructure
    if (request.method === "GET" && url.pathname === "/set") {
      const webhookUrl = `https://${url.hostname}`;
      const tgUrl = `https://api.telegram.org/bot${env.BOT_TOKEN}/setWebhook?url=${encodeURIComponent(webhookUrl)}`;
      
      try {
        const res = await fetch(tgUrl);
        const data = await res.json();
        
        // Optional: Set bot commands description here too for better UX
        /*
        const commands = [
            { command: 'start', description: i18n.ru.cmd_start },
            { command: 'check', description: i18n.ru.cmd_check },
            { command: 'about', description: i18n.ru.cmd_about },
            { command: 'help', description: i18n.ru.cmd_help }
        ];
        await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/setMyCommands`, {
            method: 'POST',
            body: JSON.stringify({commands})
        });
        */

        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(`Failed to set webhook: ${err.message}`, { status: 500 });
      }
    }

    // Health check or non-POST requests
    if (request.method !== "POST") {
      return new Response("OK", { status: 200 });
    }

    try {
      const payload = await request.json();
      
      // Immediately acknowledge Telegram to prevent timeouts/retries
      ctx.waitUntil(handleUpdate(payload, env));
      
      return new Response("OK", { status: 200 });
    } catch (e) {
      console.error(e);
      return new Response("Error processing update", { status: 500 });
    }
  }
};

async function handleUpdate(update, env) {
  const message = update.message;
  
  // Ignore updates that are not messages with text
  if (!message || !message.text) return;

  const chatId = message.chat.id;
  // Normalize input: trim and uppercase
  let rawText = message.text.trim().toUpperCase();
  
  // Detect language
  let userLang = message.from?.language_code === 'uk' ? 'uk' : 'ru';
  const t = i18n[userLang];

  // Modern UI: Inline Keyboards with Support Button
  // Added support button as third row
  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: t.btn_check, callback_data: "cmd_check" },
        { text: t.btn_about, callback_data: "cmd_about" }
      ],
      [
        { text: t.btn_help, callback_data: "cmd_help" }
      ],
      [
        { 
          text: t.btn_support, 
          url: SUPPORT_LINK  // Direct link opens in WebView/Telegram Browser
        }
      ]
    ]
  };

  // Handle Commands and Button Callbacks
  if (rawText.startsWith('/')) {
    if (rawText === '/START') {
      await sendTelegramMessage(env.BOT_TOKEN, chatId, t.start, null, true, inlineKeyboard);
      return;
    }
    // Ignore other commands if not implemented yet
    return;
  }

  // Handle Inline Callbacks (buttons pressed)
  if (update.callback_query) {
    const callbackData = update.callback_query.data;
    const cbChatId = update.callback_query.message.chat.id;
    
    // Answer the callback first to remove loading spinner on button
    await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/answerCallbackQuery`, {
        method: 'POST',
        body: JSON.stringify({ callback_query_id: update.callback_query.id })
    });

    if (callbackData === 'cmd_check') {
      await sendTelegramMessage(env.BOT_TOKEN, cbChatId, t.check_prompt, null, false, inlineKeyboard);
      return;
    }
    if (callbackData === 'cmd_about') {
      await sendTelegramMessage(env.BOT_TOKEN, cbChatId, t.about_text, null, false, inlineKeyboard);
      return;
    }
    if (callbackData === 'cmd_help') {
      await sendTelegramMessage(env.BOT_TOKEN, cbChatId, t.help_text, null, false, inlineKeyboard);
      return;
    }
    // Note: Support button uses 'url', not callback_data, so it won't trigger here.
    return;
  }

  // Process Text Input (VIN or Plate)
  // Step 1: Transliterate Cyrillic to Latin
  const normalizedText = toLatin(rawText);
  
  const isVin = VIN_REGEX.test(normalizedText);
  const isPlate = PLATE_REGEX.test(normalizedText);

  if (isVin || isPlate) {
    const query = normalizedText.replace(/\s+/g, '');
    
    // Send waiting message
    const waitMsgRes = await sendTelegramMessage(env.BOT_TOKEN, chatId, t.wait_msg, null, false);
    const waitMsgId = waitMsgRes.result?.message_id;
    const targetChatId = waitMsgRes.result?.chat?.id || chatId;

    try {
      const report = await fetchCarData(query, isVin, isPlate, env, t);
      
      if (waitMsgId) {
        await editTelegramMessage(env.BOT_TOKEN, targetChatId, waitMsgId, report, null, inlineKeyboard);
      } else {
        await sendTelegramMessage(env.BOT_TOKEN, chatId, report, null, false, inlineKeyboard);
      }
    } catch (err) {
      console.error(err);
      if (waitMsgId) {
        await editTelegramMessage(env.BOT_TOKEN, targetChatId, waitMsgId, t.not_found, null, inlineKeyboard);
      } else {
        await sendTelegramMessage(env.BOT_TOKEN, chatId, t.not_found, null, false, inlineKeyboard);
      }
    }
  } else {
    // Invalid format handling
    await sendTelegramMessage(env.BOT_TOKEN, chatId, t.invalid_format, null, false, inlineKeyboard);
  }
}

async function fetchCarData(query, isVin, isPlate, env, t) {
  try {
    // Construct endpoint
    let endpoint = isPlate 
        ? `https://baza-gai.com.ua/nomer/${query}` 
        : `https://baza-gai.com.ua/vin/${query}`;

    const gaiResponse = await fetch(endpoint, {
      headers: {
        "Accept": "application/json",
        "X-Api-Key": env.BAZAGAI_API_KEY || "" // Safety fallback
      }
    });

    if (!gaiResponse.ok) {
      throw new Error(`API Error: ${gaiResponse.status}`);
    }

    const data = await gaiResponse.json();

    // Build report safely avoiding undefined
    let msg = `${t.report_title}\n\n`;
    
    // Safe access for vendor/model/year
    const brand = data.vendor || "Невідомий бренд";
    const model = data.model || "Модел не визначено";
    const year = data.model_year ? `(${data.model_year})` : "";
    
    msg += `🚘 <b>Авто:</b> ${brand} ${model} ${year}\n`;
    
    if (data.digits) msg += `🔢 <b>Номер:</b> <code>${data.digits}</code>\n`;
    if (data.vin) msg += `⚙️ <b>VIN:</b> <code>${data.vin}</code>\n`;
    
    // Status check
    const isStolen = !!data.is_stolen; // Ensure boolean
    msg += `\n${isStolen ? t.stolen_yes : t.stolen_no}\n`;

    // Operations list
    if (Array.isArray(data.operations) && data.operations.length > 0) {
      msg += `\n📋 <b>Історія переходів:</b>\n`;
      // Limit to last 3 operations
      data.operations.slice(0, 3).forEach((op) => {
        const dateStr = op.date ? op.date : "—";
        // Try both keys for operation text, fallback to safe string
        const opText = (op.operation && (op.operation.ru || op.operation.ua)) || "Реєстрація зміни власника";
        msg += `<i>${dateStr}</i>: ${opText}\n`;
      });
    }

    // Photo handling
    if (data.photo_url) {
      // Append photo link
      msg += `\n📸 <a href="${data.photo_url}">Дивіться фото тут</a>`;
    }

    // Add support footer information below the report
    msg += `\n\n💡 <b>Підтримати розробку:</b>\n<a href="${SUPPORT_LINK}">${t.btn_support}</a> (@${SUPPORT_USER_ID.replace('@', '')})`;

    return msg;

  } catch (err) {
    console.error("Fetch error:", err);
    return t.not_found;
  }
}

// Helper to send message with HTML parse mode and optional inline keyboard
async function sendTelegramMessage(token, chatId, text, messageId = null, isEdit = false, replyMarkup = null) {
  const url = isEdit 
    ? `https://api.telegram.org/bot${token}/editMessageText` 
    : `https://api.telegram.org/bot${token}/sendMessage`;
    
  const body = {
    chat_id: chatId,
    text: text,
    parse_mode: "HTML",
    disable_web_page_preview: true // Cleaner look for links
  };

  if (messageId && isEdit) {
    body.message_id = messageId;
  }

  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  }

  // Only include text in POST body, ignore messageId in sendMessage logic slightly differently
  if (!isEdit) delete body.message_id; 

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
     const errText = await res.text();
     console.error("TG API Error:", errText);
  }

  return await res.json();
}

async function editTelegramMessage(token, chatId, messageId, text, linkPreview = null, replyMarkup = null) {
  const url = `https://api.telegram.org/bot${token}/editMessageText`;
  const body = {
    chat_id: chatId,
    message_id: messageId,
    text: text,
    parse_mode: "HTML",
    disable_web_page_preview: true
  };

  if (replyMarkup) body.reply_markup = replyMarkup;

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}