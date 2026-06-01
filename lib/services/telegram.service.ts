import { getSupabaseAdmin } from '../utils/supabase';

async function getSettings() {
  const db = getSupabaseAdmin();
  const keys = ['telegram_bot_token', 'telegram_chat_id'];
  const { data } = await db.from('settings').select('key, value').in('key', keys);
  const map: Record<string, string> = {};
  for (const row of data || []) map[row.key] = row.value;
  return map;
}

async function callTelegram(method: string, payload: Record<string, unknown>) {
  const { telegram_bot_token: token } = await getSettings();
  if (!token) return null;
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function sendTelegramNotification(order: {
  id: string
  customer_name: string
  customer_email: string
  delivery_address: string
  total: number
  items: { name: string; quantity: number; price: number }[]
  created_at: string
}) {
  try {
    const settings = await getSettings();
    const { telegram_bot_token: token, telegram_chat_id: chatId } = settings;
    if (!token || !chatId) return;

    const itemsList = order.items
      .map(i => `  • ${i.name} × ${i.quantity} — £${(i.price * i.quantity).toFixed(2)}`)
      .join('\n');

    const date = new Date(order.created_at).toLocaleString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

    const shortId = order.id.slice(0, 8);
    const text = [
      `🆕 *New Order #${shortId}*`,
      ``,
      `👤 *Name:* ${order.customer_name || 'N/A'}`,
      `📧 *Email:* ${order.customer_email || 'N/A'}`,
      `📍 *Address:* ${order.delivery_address || 'N/A'}`,
      ``,
      `🛒 *Items:*`,
      itemsList,
      ``,
      `💰 *Total:* £${order.total.toFixed(2)}`,
      `📅 ${date}`,
      ``,
      `Status: PENDING`,
    ].join('\n');

    await callTelegram('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: '✅ Approve', callback_data: `approve:${order.id}` },
          { text: '❌ Cancel', callback_data: `cancel:${order.id}` },
        ]],
      },
    });
  } catch (e) {
    console.error('Telegram notification failed:', e);
  }
}

export async function processTelegramUpdate(body: any) {
  if (!body?.callback_query) return;

  const db = getSupabaseAdmin();
  const { data: cbData, message, id: callbackId } = body.callback_query;
  if (!cbData || !message?.chat?.id) return;

  const chatId = message.chat.id;

  // Verify sender is admin — check if chat_id matches the configured one
  const { data: settings } = await db.from('settings').select('value').eq('key', 'telegram_chat_id').single();
  const allowedChat = settings?.value;
  if (String(chatId) !== String(allowedChat)) {
    await callTelegram('answerCallbackQuery', {
      callback_query_id: callbackId,
      text: '⛔ Unauthorized',
      show_alert: true,
    });
    return;
  }

  const [action, orderId] = cbData.split(':');
  if (!action || !orderId) return;

  const status = action === 'approve' ? 'confirmed' : 'cancelled';

  const { data: order, error } = await db
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single();

  if (error || !order) {
    await callTelegram('answerCallbackQuery', {
      callback_query_id: callbackId,
      text: `❌ ${error?.message || 'Order not found'}`,
      show_alert: true,
    });
    return;
  }

  // Answer callback — removes loading state
  await callTelegram('answerCallbackQuery', {
    callback_query_id: callbackId,
    text: `✅ ${status}!`,
  });

  // Remove inline keyboard and update message
  const label = status === 'confirmed' ? 'Approved ✅' : 'Cancelled ❌';
  const updatedText = message.text + `\n\n*Status:* ${label}`;
  await callTelegram('editMessageText', {
    chat_id: chatId,
    message_id: message.message_id,
    text: updatedText,
    parse_mode: 'Markdown',
    reply_markup: { inline_keyboard: [] },
  });
}

export async function setTelegramWebhook(url: string) {
  const settings = await getSettings();
  const token = settings.telegram_bot_token;
  if (!token) return { ok: false, error: 'Bot token not configured' };
  const res = await callTelegram('setWebhook', { url });
  return res || { ok: false, error: 'Failed to set webhook' };
}

export async function getTelegramWebhookInfo() {
  const res = await callTelegram('getWebhookInfo', {});
  return res || { ok: false };
}
