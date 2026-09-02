import { Order } from '../types/order.types';
import { User } from '../types/user.types';

// TODO: Інтегрувати Resend або SendGrid
// npm install resend

export const emailService = {
  async sendOrderConfirmation(order: Order): Promise<void> {
    console.log('📧 Відправка підтвердження замовлення:', order.id);
    // TODO: Реалізувати відправку email
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'orders@varenyky.com',
    //   to: order.customer_email,
    //   subject: 'Підтвердження замовлення',
    //   html: `<p>Дякуємо за замовлення #${order.id}</p>`,
    // });
  },

  async sendOrderStatusUpdate(order: Order): Promise<void> {
    console.log('📧 Відправка оновлення статусу:', order.id, order.status);
    // TODO: Реалізувати відправку email
  },

  async sendAdminNotification(order: Order): Promise<void> {
    console.log('📧 Відправка нотифікації адміну про нове замовлення:', order.id);
    // TODO: Реалізувати відправку email
  },

  async sendWelcomeEmail(user: User): Promise<void> {
    console.log('📧 Відправка вітального листа:', user.email);
    // TODO: Реалізувати відправку email
  },

  async sendLowStockAlert(productName: string, stock: number): Promise<void> {
    console.log('📧 Попередження про низький залишок:', productName, stock);
    // TODO: Реалізувати відправку email адміну
  },
};
