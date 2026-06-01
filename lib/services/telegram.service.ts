import { getSupabaseAdmin } from '../utils/supabase';

async function getSettings() {
  const db = getSupabaseAdmin();
  const keys = ['telegram_bot_token', 'telegram_chat_id'];
  const { data } = await db.from('settings').select('key, value').in('key', keys);
  const map: Record<string, string> = {};
  for (const row of data || []) map[row.key] = row.value;
  return map;
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
    const token = settings.telegram_bot_token;
    const chatId = settings.telegram_chat_id;
    if (!token || !chatId) return;

    const itemsList = order.items
      .map(i => `  • ${i.name} × ${i.quantity} — £${(i.price * i.quantity).toFixed(2)}`)
      .join('\n');

    const date = new Date(order.created_at).toLocaleString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

    const text = [
      `🆕 *New Order #${order.id.slice(0, 8)}*`,
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

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
      }),
    });
  } catch (e) {
    console.error('Telegram notification failed:', e);
  }
}
