import { LegalLayout } from '@/components/legal-layout'

export default function TermsPage() {
  return (
    <LegalLayout>
      <h1 className="text-foreground">Terms &amp; Conditions</h1>
      <p className="date text-muted-foreground">Last updated: May 2026</p>

      <h2 className="text-primary">General</h2>
      <p className="text-foreground/80">
        By placing an order on zhyto.london, you agree to these terms and conditions. We reserve the right to update these terms at any time. Continued use of the site constitutes acceptance of any changes.
      </p>

      <h2 className="text-primary">Orders &amp; Payment</h2>
      <p className="text-foreground/80">
        All orders are subject to availability. Payment is required at the time of ordering. We accept major credit/debit cards and other payment methods as displayed at checkout.
      </p>

      <h2 className="text-primary">Delivery</h2>
      <p className="text-foreground/80">
        We deliver within London zones as specified on our delivery page. Delivery times are estimates and not guaranteed. We are not responsible for delays caused by circumstances beyond our control.
      </p>
      <ul className="text-foreground/80">
        <li>Same-day delivery: London Zones 1–3 (order before 2 PM)</li>
        <li>Next-day delivery: All London areas</li>
        <li>Minimum order: £25</li>
        <li>Free delivery on orders over £50</li>
      </ul>

      <h2 className="text-primary">Food Safety &amp; Storage</h2>
      <p className="text-foreground/80">
        Our products are flash-frozen and delivered in insulated packaging. Customers are responsible for transferring products to a freezer upon receipt. Consume within the dates indicated on the packaging.
      </p>

      <h2 className="text-primary">Cancellations &amp; Refunds</h2>
      <p className="text-foreground/80">
        Orders may be cancelled within 1 hour of placement. If a product is damaged or defective upon arrival, please contact us within 24 hours at hello@zhyto.london for a resolution.
      </p>
    </LegalLayout>
  )
}
