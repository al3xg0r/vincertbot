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
    help_text: "📖 <b>Инструкция:</b>\n\n1️⃣ Введите гос. номер или VIN.\n2️⃣ Ждите секунду.\n3️⃣ Получите отчет.\n\n❗️ <i>Если ничего не найдено:</i><br>Машина могла не переоформляться с 2013 года.\n\n💬 <b>Техническая поддержка:</b>\n@tg_agteam_bot",
    invalid_format: "⚠️ Неверный формат.<br>Введите VIN (17 символов) или гос. номер (напр. АА1234ББ).",
    wait_msg: "⏳ Ищем информацию в базах...",
    not_found: "❌ Данные не найдены или сервис временно недоступен.",
    report_title: "📊 <b>Отчет по автомобилю:</b>",
    stolen_yes: "🚨 <b>В РОЗЫСКЕ!</b>",
    stolen_no: "✅ Чисто, в розыске не числится",
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
    help_text: "📖 <b>Інструкція:</b>\n\n1️⃣ Введіть номер або VIN.\n2️⃣ Зачекайте секунду.\n3️⃣ Отримайте звіт.\n\n❗️ <i>Якщо нічого немає:</i><br>Машину могло не переоформляти з 2013 року.\n\n💬 <b>Технічна підтримка:</b>\n@tg_agteam_bot",
    invalid_format: "⚠️ Невірний формат.<br>Введіть VIN або номер (напр. АА1234ББ).",
    wait_msg: "⏳ Шукаємо інформацію в базах...",
    not_found: "❌ Дані не знайдено або сервіс тимчасово недоступний.",
    report_title: "📊 <b>Звіт по автомобілю:</b>",
    stolen_yes: "🚨 <b>У РОЗШУКУ!</b>",
    stolen_no: "✅ У розшуку не перебуває",
    cmd_start: "Запуск бота",
    cmd_check: "Перевірка авто",
    cmd_about: "Про проект",
    cmd_help: "Допомога"
  }
};

// Support Mini App configuration
const SUPPORT_WEBAPP_URL = "https://agteambot.hubapps.workers.dev/app/?project=VinCertBot";
const SUPPORT_USERNAME = "tg_agteam_bot";

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

// Regex patterns
const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/;
const PLATE_REGEX = /^[A-Z]{2}\d{4}[A-Z]{2}$/;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle GET request to set webhook automatically
    if (request.method === "GET" && url.pathname === "/set") {
      const webhookUrl = `https://${url.hostname}`;
      const tgUrl = `https://api.telegram.org/bot${env.BOT_TOKEN}/setWebhook?url=${encodeURIComponent(webhookUrl)}`;
      
      try {
        const res = await fetch(tgUrl);
        const data = await res.json();
        
        // Set bot commands for better UX
        await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/setMyCommands`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            commands: [
              { command: 'start', description: 'Старт / Start' },
              { command: 'check', description: 'Проверка авто' },
              { command: 'about', description: 'О боте' },
              { command: 'help', description: 'Помощь' }
            ]
          })
        });

        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(`Failed to set webhook: ${err.message}`, { status: 500 });
      }
    }

    // Only accept POST requests for Webhooks
    if (request.method !== "POST") {
      return new Response("OK", { status: 200 });
    }

    try {
      const payload = await request.json();
      ctx.waitUntil(handleUpdate(payload, env));
      return new Response("OK", { status: 200 });
    } catch (e) {
      console.error(e);
      return new Response("Error", { status: 500 });
    }
  }
};

async function handleUpdate(update, env) {
  const message = update.message;
  const callbackQuery = update.callback_query;
  
  // Get language from user preference (auto-detect)
  let userLang = message?.from?.language_code === 'uk' ? 'uk' : 'ru';
  if (!userLang || (callbackQuery && !message)) {
    // Try to preserve language across callbacks by storing in a simple way
    // For now fallback to detecting from original message user_lang
    userLang = message?.from?.language_code === 'uk' ? 'uk' : 'ru';
  }
  
  // Ensure we have a valid lang (fallback to russian)
  if (userLang !== 'uk') userLang = 'ru';
  
  const t = i18n[userLang];

  // Build Reply Keyboard for initial messages
  const replyKeyboard = {
    keyboard: [
      [{ text: '/START' }],
      [{ text: '/HELP' }]
    ],
    resize_keyboard: true
  };

  // Build Inline Keyboard with colored buttons (using emoji indicators since TG doesn't support custom colors)
  // Blue button indicator 📘 for support, Green 🟢 for help
  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: `${t.btn_check}`, callback_data: "action_check" },
        { text: `${t.btn_about}`, callback_data: "action_about" }
      ],
      [
        { text: `${t.btn_help}`, callback_data: "action_help" }
      ],
      [
        { 
          text: `${t.btn_support}`, 
          web_app: { url: SUPPORT_WEBAPP_URL }
        }
      ]
    ]
  };

  // Handle START Command (case insensitive)
  if (message && message.text && message.text.toLowerCase() === '/start') {
    const welcomeMsg = t.start + "\n\n<b>⬇️ Используйте меню ниже ⬇️</b>";
    await sendTelegramMessage(env.BOT_TOKEN, message.chat.id, welcomeMsg, null, false, inlineKeyboard);
    return;
  }

  // Handle HELP Command
  if (message && message.text && message.text.toLowerCase() === '/help') {
    await sendTelegramMessage(env.BOT_TOKEN, message.chat.id, t.help_text, null, false, inlineKeyboard);
    return;
  }

  // Handle Callback Queries (button presses)
  if (callbackQuery) {
    const cbChatId = callbackQuery.message.chat.id;
    const callbackData = callbackQuery.data;
    
    // Acknowledge the callback to remove loading state
    await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/answerCallbackQuery`, {
      method: 'POST',
      body: JSON.stringify({ callback_query_id: callbackQuery.id })
    });

    // Determine language from stored context or re-detect
    // Since we can't store per-user lang easily without KV, we'll rely on original detection
    // In production you'd use KV storage here
    
    switch (callbackData) {
      case "action_check":
        await sendTelegramMessage(env.BOT_TOKEN, cbChatId, t.check_prompt, null, false, inlineKeyboard);
        break;
      case "action_about":
        await sendTelegramMessage(env.BOT_TOKEN, cbChatId, t.about_text, null, false, inlineKeyboard);
        break;
      case "action_help":
        await sendTelegramMessage(env.BOT_TOKEN, cbChatId, t.help_text, null, false, inlineKeyboard);
        break;
    }
    return;
  }

  // Skip non-text messages
  if (!message || !message.text) return;

  const chatId = message.chat.id;
  
  // Normalize input: trim and uppercase for validation
  let rawText = message.text.trim();
  const normalizedUpper = rawText.toUpperCase();
  
  // Step 1: Transliterate Cyrillic to Latin before validation
  const transcribed = toLatin(normalizedUpper);
  
  const isVin = VIN_REGEX.test(transcribed);
  const isPlate = PLATE_REGEX.test(transcribed);

  if (isVin || isPlate) {
    const query = transcribed.replace(/\s+/g, '');
    
    // Send waiting message
    const waitMsgRes = await sendTelegramMessage(env.BOT_TOKEN, chatId, t.wait_msg);
    const waitMsgId = waitMsgRes.result?.message_id;
    
    try {
      const report = await fetchCarData(query, isVin, isPlate, env, t);
      
      if (waitMsgId) {
        await editTelegramMessage(env.BOT_TOKEN, chatId, waitMsgId, report, null, inlineKeyboard);
      } else {
        await sendTelegramMessage(env.BOT_TOKEN, chatId, report, null, false, inlineKeyboard);
      }
    } catch (err) {
      console.error(err);
      if (waitMsgId) {
        await editTelegramMessage(env.BOT_TOKEN, chatId, waitMsgId, t.not_found, null, inlineKeyboard);
      } else {
        await sendTelegramMessage(env.BOT_TOKEN, chatId, t.not_found, null, false, inlineKeyboard);
      }
    }
  } else {
    // Check if it's just a button label echo (old behavior prevention)
    const upperText = rawText.toUpperCase();
    if (upperText === t.btn_check.toUpperCase() || 
        upperText === t.btn_about.toUpperCase() || 
        upperText === t.btn_help.toUpperCase()) {
      // User clicked old-style reply button, guide them instead
      return;
    }
    
    // Invalid format handling
    await sendTelegramMessage(env.BOT_TOKEN, chatId, t.invalid_format, null, false, inlineKeyboard);
  }
}

async function fetchCarData(query, isVin, isPlate, env, t) {
  try {
    let endpoint = isPlate 
        ? `https://baza-gai.com.ua/nomer/${query}` 
        : `https://baza-gai.com.ua/vin/${query}`;

    const gaiResponse = await fetch(endpoint, {
      headers: {
        "Accept": "application/json",
        "X-Api-Key": env.BAZAGAI_API_KEY || ""
      }
    });

    if (!gaiResponse.ok) {
      throw new Error(`API Error: ${gaiResponse.status}`);
    }

    const data = await gaiResponse.json();

    // Build report safely avoiding undefined
    let msg = `${t.report_title}\n\n`;
    
    const brand = data.vendor || "Невідомий бренд";
    const model = data.model || "Модел не визначено";
    const year = data.model_year ? ` (${data.model_year})` : "";
    
    msg += `🚘 <b>Авто:</b> ${brand} ${model}${year}\n`;
    
    if (data.digits) msg += `🔢 <b>Номер:</b> <code>${data.digits}</code>\n`;
    if (data.vin) msg += `⚙️ <b>VIN:</b> <code>${data.vin}</code>\n`;
    
    const isStolen = !!data.is_stolen;
    msg += `\n${isStolen ? t.stolen_yes : t.stolen_no}\n`;

    if (Array.isArray(data.operations) && data.operations.length > 0) {
      msg += `\n📋 <b>История операций:</b>\n`;
      data.operations.slice(0, 3).forEach((op) => {
        const dateStr = op.date || "—";
        const opText = (op.operation && (op.operation.ru || op.operation.ua)) || "Изменение владельца";
        msg += `<i>${dateStr}</i>: ${opText}\n`;
      });
    }

    if (data.photo_url) {
      msg += `\n📸 <a href="${data.photo_url}">Фото автомобиля</a>`;
    }

    return msg;

  } catch (err) {
    console.error("Fetch error:", err);
    return t.not_found;
  }
}

async function sendTelegramMessage(token, chatId, text, messageId = null, isEdit = false, replyMarkup = null) {
  const url = isEdit 
    ? `https://api.telegram.org/bot${token}/editMessageText` 
    : `https://api.telegram.org/bot${token}/sendMessage`;
    
  const body = {
    chat_id: chatId,
    text: text,
    parse_mode: "HTML",
    disable_web_page_preview: true
  };

  if (messageId && isEdit) {
    body.message_id = messageId;
  }

  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  }

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