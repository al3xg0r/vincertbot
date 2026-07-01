const i18n = {
  ru: {
    start: "👋 <b>Вітаю у VinCertBot!</b>\n\nПросто відправ мені <b>VIN-код</b> або <b>гос номер</b>.",
    btn_check: "🔍 Проверить авто",
    btn_about: "ℹ️ О боте",
    btn_help: "🆘 Помощь",
    btn_support: "💚 Поддержать",
    check_prompt: "🚘 <b>Жду номер!</b>\nНапишіть VIN або гос номер латиною.",
    about_text: "🤖 Інформація про бота...\n\nДжерела: AUTO.RIA + Baza-Gai",
    help_text: "📖 Як користуватись:\n1. Введіть номер/VIN\n2. Отримайте результат\n\nПідтримка: @tg_agteam_bot",
    wait_msg: "⏳ Шукємо дані...",
    invalid_format: "⚠️ Неверный формат"
  },
  uk: {
    start: "👋 <b>Ласкаво просимо!</b>\n\nВідправ мені <b>VIN-код</b> або <b>держ номер</b>.",
    btn_check: "🔍 Перевірити авто",
    btn_about: "ℹ️ Про бота",
    btn_help: "🆘 Допомога",
    btn_support: "💚 Підтримати",
    check_prompt: "🚘 <b>Чекаю номер!</b>\nНапишіть VIN або держ номер.",
    about_text: "🤖 Інформація про бота...\n\nДжерела: AUTO.RIA + Baza-Gai",
    help_text: "📖 Як користуватись:\n1. Введіть номер/VIN\n2. Отримайте результат\n\nПідтримка: @tg_agteam_bot",
    wait_msg: "⏳ Шукаємо дані...",
    invalid_format: "⚠️ Невірний формат"
  }
};

const SUPPORT_URL = "https://agteambot.hubapps.workers.dev/app/?project=VinCertBot";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    console.log('[DEBUG] Request method:', request.method);
    console.log('[DEBUG] Pathname:', url.pathname);

    if (request.method === "GET" && url.pathname === "/set") {
      try {
        const webhookUrl = `https://${url.hostname}/`;
        const tgUrl = `https://api.telegram.org/bot${env.BOT_TOKEN}/setWebhook?url=${encodeURIComponent(webhookUrl)}`;
        
        const res = await fetch(tgUrl);
        const data = await res.json();
        
        console.log('[SETWEBHOOK]', data);
        
        return new Response(JSON.stringify(data), { 
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } catch (err) {
        console.error('[ERROR]', err.message);
        return new Response(`Error: ${err.message}`, { status: 500 });
      }
    }

    if (request.method !== "POST") {
      return new Response("OK");
    }

    let payload;
    try {
      payload = await request.json();
      console.log('[RAW UPDATE]', JSON.stringify(payload).substring(0, 200));
    } catch (e) {
      console.error('[JSON ERROR]', e.message);
      return new Response("Invalid JSON", { status: 400 });
    }

    ctx.waitUntil(handleUpdate(payload, env));
    return new Response("OK");
  }
};

async function handleUpdate(update, env) {
  console.log('[HANDLE_UPDATE] Start');
  
  try {
    // Get language
    const langCode = update.callback_query?.from?.language_code || 
                     update.message?.from?.language_code || 'ru';
    const lang = langCode === 'uk' ? 'uk' : 'ru';
    const t = i18n[lang];
    
    console.log('[LANG]', lang);

    const chatId = update.message?.chat?.id || 
                   update.callback_query?.message?.chat?.id;
    
    console.log('[CHAT_ID]', chatId);

    if (!chatId) {
      console.log('[SKIP] No chat ID');
      return;
    }

    // Build keyboard
    const keyboard = {
      inline_keyboard: [
        [
          { text: t.btn_check, callback_data: "btn_check" },
          { text: t.btn_about, callback_data: "btn_about" }
        ],
        [{ text: t.btn_help, callback_data: "btn_help" }],
        [{ text: t.btn_support, web_app: { url: SUPPORT_URL } }]
      ]
    };

    // Command handler (/start)
    if (update.message && update.message.text === '/start') {
      console.log('[COMMAND] /start');
      await apiCall(env.BOT_TOKEN, 'sendMessage', {
        chat_id: chatId,
        text: t.start,
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
      return;
    }

    // Callback handler (buttons)
    if (update.callback_query) {
      const cbId = update.callback_query.id;
      const data = update.callback_query.data;
      
      console.log('[CALLBACK]', cbId, data);

      // Answer callback first!
      await apiCall(env.BOT_TOKEN, 'answerCallbackQuery', {
        callback_query_id: cbId
      });

      if (data === 'btn_check') {
        await apiCall(env.BOT_TOKEN, 'sendMessage', {
          chat_id: chatId,
          text: t.check_prompt,
          parse_mode: 'HTML',
          reply_markup: keyboard
        });
      } else if (data === 'btn_about') {
        await apiCall(env.BOT_TOKEN, 'sendMessage', {
          chat_id: chatId,
          text: t.about_text,
          parse_mode: 'HTML',
          reply_markup: keyboard
        });
      } else if (data === 'btn_help') {
        await apiCall(env.BOT_TOKEN, 'sendMessage', {
          chat_id: chatId,
          text: t.help_text,
          parse_mode: 'HTML',
          reply_markup: keyboard
        });
      }
      return;
    }

    // Text message handler (VIN/plate search)
    if (update.message && update.message.text) {
      const text = update.message.text.trim().toUpperCase();
      console.log('[MESSAGE TEXT]', text.substring(0, 20));
      
      const isValidPlate = /^[A-Z]{2}\d{4}[A-Z]{2}$/.test(text);
      const isValidVin = /^[A-HJ-NPR-Z0-9]{17}$/.test(text);

      if (!isValidPlate && !isValidVin) {
        console.log('[INVALID FORMAT]');
        await apiCall(env.BOT_TOKEN, 'sendMessage', {
          chat_id: chatId,
          text: t.invalid_format,
          parse_mode: 'HTML',
          reply_markup: keyboard
        });
        return;
      }

      // Processing
      console.log('[SEARCHING]', text);
      
      const waitMsg = await apiCall(env.BOT_TOKEN, 'sendMessage', {
        chat_id: chatId,
        text: t.wait_msg,
        parse_mode: 'HTML'
      });
      const msgId = waitMsg.result?.message_id;

      try {
        const report = await getData(text, env);
        
        if (msgId) {
          await apiCall(env.BOT_TOKEN, 'editMessageText', {
            chat_id: chatId,
            message_id: msgId,
            text: report,
            parse_mode: 'HTML',
            reply_markup: keyboard
          });
        } else {
          await apiCall(env.BOT_TOKEN, 'sendMessage', {
            chat_id: chatId,
            text: report,
            parse_mode: 'HTML',
            reply_markup: keyboard
          });
        }
      } catch (err) {
        console.error('[API ERR]', err.message);
        if (msgId) {
          await apiCall(env.BOT_TOKEN, 'editMessageText', {
            chat_id: chatId,
            message_id: msgId,
            text: t.invalid_format,
            parse_mode: 'HTML'
          });
        }
      }
    }
    
  } catch (err) {
    console.error('[FATAL]', err.stack || err.message);
  }
}

async function getData(query, env) {
  const endpoint = query.length >= 16 
    ? `https://baza-gai.com.ua/vin/${query}`
    : `https://baza-gai.com.ua/nomer/${query}`;
  
  console.log('[FETCH]', endpoint);
  
  const resp = await fetch(endpoint, {
    headers: {
      "Accept": "application/json",
      "X-Api-Key": env.BAZAGAI_API_KEY || ""
    }
  });
  
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  
  const data = await resp.json();
  
  let result = "📊 <b>Отчет:</b>\n\n";
  result += `🚘 ${(data.vendor || '')} ${(data.model || '')}\n`;
  result += data.digits ? `\n🔢 Номер: <code>${data.digits}</code>\n` : '';
  result += data.vin ? `⚙️ VIN: <code>${data.vin}</code>\n` : '';
  
  return result;
}

async function apiCall(token, method, params) {
  const url = `https://api.telegram.org/bot${token}/${method}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  
  const result = await resp.json();
  console.log(`[TELEGRAM:${method}]`, result.ok ? 'OK' : result.description);
  
  return result;
}