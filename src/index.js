// Localization dictionaries
const i18n = {
  ru: {
    start: "👋 <b>Добро пожаловать в VinCertBot!</b>\n\nЯ помогу узнать историю автомобиля по базам Украины.\nОтправь мне <b>VIN-код (17 символов)</b> или <b>гос. номер</b>.\n\nВвод на латинице.",
    btn_check: "🔍 Проверить авто",
    btn_about: "ℹ️ О боте",
    btn_help: "🆘 Помощь",
    check_prompt: "🚘 <b>Жду номер или VIN!</b>\nНапишите мне гос. номер или VIN-код.",
    about_text: "🤖 <b>VinCertBot</b> — ваш надежный помощник.\n\n<b>Источники данных:</b>\n🔸 <b>AUTO.RIA</b> — объявления о продаже.\n🔸 <b>Baza-Gai</b> — официальный реестр МВД Украины.",
    help_text: "📖 <b>Инструкция:</b>\n\n1️⃣ Введите гос. номер или VIN.\n2️⃣ Ждите секунду.\n3️⃣ Получите отчет.\n\n💬 <b>Поддержка:</b> @tg_agteam_bot",
    invalid_format: "⚠️ Неверный формат.<br>Введите VIN (17 символов) или гос. номер (напр. AA1234BC).",
    wait_msg: "⏳ Ищем информацию в базах...",
    not_found: "❌ Данные не найдены или сервис временно недоступен.",
    report_title: "📊 <b>Отчет по автомобилю:</b>",
    stolen_yes: "🚨 <b>В РОЗЫСКЕ!</b>",
    stolen_no: "✅ Чисто, в розыске не числится"
  },
  uk: {
    start: "👋 <b>Ласкаво просимо до VinCertBot!</b>\n\nЯ допоможу дізнатися історію автомобіля за базами України.\nВідправ мені <b>VIN-код (17 символів)</b> або <b>держ. номер</b>.\n\nВведення латиною.",
    btn_check: "🔍 Перевірити авто",
    btn_about: "ℹ️ Про бота",
    btn_help: "🆘 Допомога",
    check_prompt: "🚘 <b>Чекаю номер або VIN!</b>\nНапишіть держ. номер або VIN.",
    about_text: "🤖 <b>VinCertBot</b> — ваш надійний помічник.\n\n<b>Джерела даних:</b>\n🔸 <b>AUTO.RIA</b> — оголошення про продаж.\n🔸 <b>Baza-Gai</b> — офіційний реєстр МВС України.",
    help_text: "📖 <b>Інструкція:</b>\n\n1️⃣ Введіть номер або VIN.\n2️⃣ Зачекайте секунду.\n3️⃣ Отримайте звіт.\n\n💬 <b>Підтримка:</b> @tg_agteam_bot",
    invalid_format: "⚠️ Невірний формат.<br>Введіть VIN або номер (напр. AA1234BC).",
    wait_msg: "⏳ Шукаємо інформацію в базах...",
    not_found: "❌ Дані не знайдено або сервіс тимчасово недоступний.",
    report_title: "📊 <b>Звіт по автомобілю:</b>",
    stolen_yes: "🚨 <b>У РОЗШУКУ!</b>",
    stolen_no: "✅ У розшуку не перебуває"
  }
};

// Support Mini App URL
const SUPPORT_WEBAPP_URL = "https://agteambot.hubapps.workers.dev/app/?project=VinCertBot";

// Regex patterns - Latin only
const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/;
const PLATE_REGEX = /^[A-Z]{2}\d{4}[A-Z]{2}$/;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/set") {
      const webhookUrl = `https://${url.hostname}`;
      const tgUrl = `https://api.telegram.org/bot${env.BOT_TOKEN}/setWebhook?url=${encodeURIComponent(webhookUrl)}`;
      
      try {
        const res = await fetch(tgUrl);
        const data = await res.json();
        
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(`Failed to set webhook: ${err.message}`, { status: 500 });
      }
    }

    if (request.method !== "POST") {
      return new Response("OK", { status: 200 });
    }

    try {
      const payload = await request.json();
      ctx.waitUntil(processUpdate(payload, env));
      return new Response("OK", { status: 200 });
    } catch (e) {
      console.error(e);
      return new Response("Error", { status: 500 });
    }
  }
};

async function processUpdate(update, env) {
  // Language detection
  let lang = 'ru';
  if ((update.callback_query?.from?.language_code === 'uk') || 
      (update.message?.from?.language_code === 'uk')) {
    lang = 'uk';
  }
  
  const t = i18n[lang];
  const chatId = update.message?.chat?.id ?? update.callback_query?.message?.chat?.id;
  
  if (!chatId) return;

  // Inline Keyboard (no colors for maximum compatibility)
  const keyboard = {
    inline_keyboard: [
      [{ text: t.btn_check, callback_data: "check" }],
      [{ text: t.btn_about, callback_data: "about" }],
      [{ text: t.btn_help, callback_data: "help" }],
      [{ text: t.btn_support, web_app: { url: SUPPORT_WEBAPP_URL } }]
    ]
  };

  // START command
  if (update.message?.text?.toLowerCase() === '/start') {
    await sendMessage(env.BOT_TOKEN, chatId, t.start, keyboard);
    return;
  }

  // HELP command
  if (update.message?.text?.toLowerCase() === '/help') {
    await sendMessage(env.BOT_TOKEN, chatId, t.help_text, keyboard);
    return;
  }

  // BUTTON CALLBACKS
  if (update.callback_query) {
    const cbChatId = update.callback_query.message.chat.id;
    const data = update.callback_query.data;

    // Acknowledge click immediately
    await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/answerCallbackQuery`, {
      method: 'POST',
      body: JSON.stringify({ callback_query_id: update.callback_query.id })
    });

    if (data === 'check') {
      await sendMessage(env.BOT_TOKEN, cbChatId, t.check_prompt, keyboard);
    } else if (data === 'about') {
      await sendMessage(env.BOT_TOKEN, cbChatId, t.about_text, keyboard);
    } else if (data === 'help') {
      await sendMessage(env.BOT_TOKEN, cbChatId, t.help_text, keyboard);
    }
    return;
  }

  // Skip non-text messages
  if (!update.message || !update.message.text) return;

  const text = update.message.text.trim().toUpperCase();
  
  // Validate input (Latin only)
  const isVin = VIN_REGEX.test(text);
  const isPlate = PLATE_REGEX.test(text);

  if (isVin || isPlate) {
    const query = text.replace(/\s+/g, '');
    
    const waitRes = await sendMessage(env.BOT_TOKEN, chatId, t.wait_msg);
    const msgId = waitRes.result?.message_id;
    
    try {
      const report = await getCarReport(query, isVin, env, t);
      
      if (msgId) {
        await editMessage(env.BOT_TOKEN, chatId, msgId, report, keyboard);
      } else {
        await sendMessage(env.BOT_TOKEN, chatId, report, keyboard);
      }
    } catch (err) {
      console.error(err);
      if (msgId) {
        await editMessage(env.BOT_TOKEN, chatId, msgId, t.not_found, keyboard);
      } else {
        await sendMessage(env.BOT_TOKEN, chatId, t.not_found, keyboard);
      }
    }
  } else {
    await sendMessage(env.BOT_TOKEN, chatId, t.invalid_format, keyboard);
  }
}

async function getCarReport(query, isVin, env, t) {
  try {
    const endpoint = isVin 
      ? `https://baza-gai.com.ua/vin/${query}`
      : `https://baza-gai.com.ua/nomer/${query}`;

    const resp = await fetch(endpoint, {
      headers: {
        "Accept": "application/json",
        "X-Api-Key": env.BAZAGAI_API_KEY || ""
      }
    });

    if (!resp.ok) throw new Error(`API error: ${resp.status}`);
    
    const data = await resp.json();
    let msg = `${t.report_title}\n\n`;
    
    msg += `🚘 <b>Авто:</b> ${(data.vendor || '')} ${(data.model || '')}${data.model_year ? ` (${data.model_year})` : ''}\n`;
    if (data.digits) msg += `🔢 <b>Номер:</b> <code>${data.digits}</code>\n`;
    if (data.vin) msg += `⚙️ <b>VIN:</b> <code>${data.vin}</code>\n`;
    msg += `\n${(data.is_stolen) ? t.stolen_yes : t.stolen_no}\n`;

    if (Array.isArray(data.operations)) {
      const ops = data.operations.slice(0, 3);
      if (ops.length > 0) {
        msg += `\n📋 <b>История:</b>\n`;
        ops.forEach(op => {
          const txt = op.operation?.ru || op.operation?.ua || '';
          msg += `<i>${op.date || '—'}</i>: ${txt}\n`;
        });
      }
    }

    if (data.photo_url) {
      msg += `\n📸 <a href="${data.photo_url}">Фото</a>`;
    }

    return msg;
  } catch (err) {
    console.error(err);
    return t.not_found;
  }
}

async function sendMessage(token, chatId, text, keyboard = null) {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...(keyboard ? { reply_markup: keyboard } : {})
    })
  });
  return await res.json();
}

async function editMessage(token, chatId, messageId, text, keyboard = null) {
  await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text: text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...(keyboard ? { reply_markup: keyboard } : {})
    })
  });
}