// Localization dictionaries
const i18n = {
  ru: {
    start: "👋 <b>Добро пожаловать в VinCertBot!</b>\n\nЯ помогу узнать историю автомобиля по базам Украины.\nПросто отправь мне <b>VIN-код (17 символов)</b> или <b>гос. номер</b>.\n\nПоддерживается ввод на кириллице и латинице!",
    btn_check: "🔍 Проверить авто",
    btn_about: "ℹ️ О боте",
    btn_support: "💙💛 Поддержать",
    check_prompt: "🚘 <b>Жду номер или VIN!</b>\nНапишите мне гос. номер или VIN-код.\n<i>Можно использовать русские/украинские буквы (АА1234ВВ).</i>",
    about_text: "🤖 <b>VinCertBot</b> — ваш надежный помощник.\n\nПросто отправьте <b>VIN-код</b> или <b>гос. номер</b> — и в течение нескольких секунд бот соберет для вас отчет.\n\n<b>Источники данных:</b>\n🔸 <b>AUTO.RIA</b> — объявления о продаже.\n🔸 <b>Baza-Gai</b> — официальный реестр МВД Украины.\n\n<i>Все данные собираются исключительно из открытых источников.</i>\n\n❗️ <i>Если ничего не найдено:</i> машина могла не переоформляться с 2013 года.\n\n💬 <b>Поддержка:</b> @tg_agteam_bot",
    help_text: "📖 <b>Инструкция:</b>\n\n1️⃣ Введите гос. номер или VIN.\n2️⃣ Ждите секунду.\n3️⃣ Получите отчет.\n\n❗️ <i>Если ничего не найдено:</i><br>Машина могла не переоформляться с 2013 года.\n\n💬 <b>Техническая поддержка:</b>\n@tg_agteam_bot",
    invalid_format: "⚠️ Неверный формат.<br>Введите VIN (17 символов) или гос. номер (напр. АА1234ВВ).",
    wait_msg: "⏳ Ищем информацию в базах...",
    not_found: "❌ Данные не найдены или сервис временно недоступен.",
    report_title: "📊 <b>Отчет по автомобилю:</b>",
    label_color: "Цвет",
    label_engine: "Объем двигателя",
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
    btn_support: "💙💛 Підтримати",
    check_prompt: "🚘 <b>Чекаю номер або VIN!</b>\nНапишіть держ. номер або VIN.\n<i>Можна використовувати українські літери (АА1234ВВ).</i>",
    about_text: "🤖 <b>VinCertBot</b> — ваш надійний помічник.\n\nПросто надішліть <b>VIN-код</b> або <b>держ. номер</b> — і за кілька секунд бот збере для вас звіт.\n\n<b>Джерела даних:</b>\n🔸 <b>AUTO.RIA</b> — оголошення про продаж.\n🔸 <b>Baza-Gai</b> — офіційний реєстр МВС України.\n\n<i>Всі дані збираються лише з відкритих джерел.</i>\n\n❗️ <i>Якщо нічого немає:</i> машину могло не переоформляти з 2013 року.\n\n💬 <b>Підтримка:</b> @tg_agteam_bot",
    help_text: "📖 <b>Інструкция:</b>\n\n1️⃣ Введіть номер або VIN.\n2️⃣ Зачекайте секунду.\n3️⃣ Отримайте звіт.\n\n❗️ <i>Якщо нічого немає:</i><br>Машину могло не переоформляти з 2013 року.\n\n💬 <b>Технічна підтримка:</b>\n@tg_agteam_bot",
    invalid_format: "⚠️ Невірний формат.<br>Введіть VIN або номер (напр. АА1234ВВ).",
    wait_msg: "⏳ Шукаємо інформацію в базах...",
    not_found: "❌ Дані не знайдено або сервіс тимчасово недоступний.",
    report_title: "📊 <b>Звіт по автомобілю:</b>",
    label_color: "Колір",
    label_engine: "Об'єм двигуна",
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

// Helper to visually transliterate Cyrillic plates to Latin matches
function normalizeInput(str) {
  const plateMap = {
    'А': 'A', 'В': 'B', 'С': 'C', 'Е': 'E', 'Н': 'H', 'І': 'I',
    'К': 'K', 'М': 'M', 'О': 'O', 'Р': 'P', 'Т': 'T', 'Х': 'X',
    'У': 'Y'
  };
  return str.toUpperCase().split('').map(char => plateMap[char] || char).join('');
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
      // IMPORTANT: explicitly list allowed_updates so Telegram is guaranteed
      // to deliver callback_query updates (button presses) to this webhook.
      // Without this, a previously configured webhook could keep an older,
      // narrower allowed_updates list and silently drop callback_query events.
      const tgUrl = `https://api.telegram.org/bot${env.BOT_TOKEN}/setWebhook`
        + `?url=${encodeURIComponent(webhookUrl)}`
        + `&allowed_updates=${encodeURIComponent(JSON.stringify(["message", "callback_query"]))}`;

      try {
        const res = await fetch(tgUrl);
        const data = await res.json();

        const cmdRes = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/setMyCommands`, {
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
        const cmdData = await cmdRes.json();

        return new Response(JSON.stringify({ setWebhook: data, setMyCommands: cmdData }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(`Failed to set webhook: ${err.message}`, { status: 500 });
      }
    }

    // Handy diagnostic endpoint: shows Telegram's current webhook info,
    // including pending_update_count and last_error_message if any.
    if (request.method === "GET" && url.pathname === "/info") {
      try {
        const res = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/getWebhookInfo`);
        const data = await res.json();
        return new Response(JSON.stringify(data, null, 2), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(`Failed to get webhook info: ${err.message}`, { status: 500 });
      }
    }

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
  try {
    const message = update.message;
    const callbackQuery = update.callback_query;

    const fromUser = message?.from || callbackQuery?.from;
    let userLang = fromUser?.language_code === 'uk' ? 'uk' : 'ru';

    const t = i18n[userLang];

    // Build Inline Keyboard.
    // Since Bot API 9.4 (Feb 9, 2026), InlineKeyboardButton supports a
    // "style" field to color the button. Valid values: "primary" (blue),
    // "success" (green), "danger" (red). Omit for the default gray look.
    // "Помощь" button removed per request — /help still works as a command.
    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: t.btn_check, callback_data: "action_check", style: "danger" },
          { text: t.btn_about, callback_data: "action_about", style: "primary" }
        ],
        [
          { text: t.btn_support, web_app: { url: SUPPORT_WEBAPP_URL }, style: "success" }
        ]
      ]
    };

    // Handle Callback Queries (button presses) FIRST, before touching `message`
    if (callbackQuery) {
      const cbChatId = callbackQuery.message?.chat?.id;
      const callbackData = callbackQuery.data;

      // Always answer the callback query so the loading spinner stops,
      // even if something below fails.
      const ackRes = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: callbackQuery.id })
      });
      const ackData = await ackRes.json();
      if (!ackData.ok) {
        console.error("answerCallbackQuery failed:", ackData);
      }

      if (!cbChatId) {
        console.error("No chat id on callback_query.message, cannot respond:", JSON.stringify(callbackQuery));
        return;
      }

      switch (callbackData) {
        case "action_check":
          await sendTelegramMessage(env.BOT_TOKEN, cbChatId, t.check_prompt, null, false, inlineKeyboard);
          break;
        case "action_about":
          await sendTelegramMessage(env.BOT_TOKEN, cbChatId, t.about_text, null, false, inlineKeyboard);
          break;
        default:
          console.error("Unknown callback_data:", callbackData);
      }
      return;
    }

    if (!message || !message.text) return;

    // Handle START Command
    if (message.text.toLowerCase() === '/start') {
      const welcomeMsg = t.start + "\n\n<b>⬇️ Используйте меню ниже ⬇️</b>";
      await sendTelegramMessage(env.BOT_TOKEN, message.chat.id, welcomeMsg, null, false, inlineKeyboard);
      return;
    }

    // Handle HELP Command (still available as a text command even without a button)
    if (message.text.toLowerCase() === '/help') {
      await sendTelegramMessage(env.BOT_TOKEN, message.chat.id, t.help_text, null, false, inlineKeyboard);
      return;
    }

    const chatId = message.chat.id;
    let rawText = message.text.trim();
    const transcribed = normalizeInput(rawText);

    const isVin = VIN_REGEX.test(transcribed);
    const isPlate = PLATE_REGEX.test(transcribed);

    if (isVin || isPlate) {
      const query = transcribed.replace(/\s+/g, '');

      const waitMsgRes = await sendTelegramMessage(env.BOT_TOKEN, chatId, t.wait_msg);
      const waitMsgId = waitMsgRes.result?.message_id;

      try {
        const report = await fetchCarData(query, isVin, isPlate, env, t, userLang);

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
      const upperText = rawText.toUpperCase();
      if (upperText === t.btn_check.toUpperCase() ||
          upperText === t.btn_about.toUpperCase()) {
        return;
      }

      await sendTelegramMessage(env.BOT_TOKEN, chatId, t.invalid_format, null, false, inlineKeyboard);
    }
  } catch (err) {
    console.error("handleUpdate fatal error:", err);
  }
}

async function fetchCarData(query, isVin, isPlate, env, t, userLang) {
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
    // API returns localized text under "ru" and "ua" keys (Ukrainian is "ua", not "uk")
    const langKey = userLang === 'uk' ? 'ua' : 'ru';

    let msg = `${t.report_title}\n\n`;

    const brand = data.vendor || "Невідомий бренд";
    const model = data.model || "Модел не визначено";
    const year = data.model_year ? ` (${data.model_year})` : "";

    msg += `🚘 <b>Авто:</b> ${brand} ${model}${year}\n`;

    if (data.digits) msg += `🔢 <b>Номер:</b> <code>${data.digits}</code>\n`;
    if (data.vin) msg += `⚙️ <b>VIN:</b> <code>${data.vin}</code>\n`;

    // Color and engine volume live inside each operation, not at top level.
    // Take them from the most recent operation (is_last, or the first item
    // as a fallback since the API returns operations sorted newest-first).
    const operations = Array.isArray(data.operations) ? data.operations : [];
    const latestOp = operations.find(op => op.is_last) || operations[0];

    if (latestOp?.color?.[langKey]) {
      msg += `🎨 <b>${t.label_color}:</b> ${latestOp.color[langKey]}\n`;
    }
    if (latestOp?.displacement) {
      const liters = (latestOp.displacement / 1000).toFixed(1);
      msg += `🛠 <b>${t.label_engine}:</b> ${liters} л\n`;
    }

    const isStolen = !!data.is_stolen;
    msg += `\n${isStolen ? t.stolen_yes : t.stolen_no}\n`;

    if (operations.length > 0) {
      msg += `\n📋 <b>История операций:</b>\n`;
      operations.slice(0, 3).forEach((op) => {
        const dateStr = op.registered_at || "—";
        const opText = (op.operation && (op.operation[langKey] || op.operation.ru)) || "Изменение владельца";
        const colorStr = op.color?.[langKey] ? `, ${op.color[langKey]}` : "";
        msg += `<i>${dateStr}</i>: ${opText}${colorStr}\n`;
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

  if (messageId && isEdit) body.message_id = messageId;
  if (replyMarkup) body.reply_markup = replyMarkup;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (!data.ok) {
    console.error("Telegram sendMessage/editMessageText failed:", JSON.stringify(data));
  }
  return data;
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

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (!data.ok) {
    console.error("Telegram editMessageText failed:", JSON.stringify(data));
  }
  return data;
}