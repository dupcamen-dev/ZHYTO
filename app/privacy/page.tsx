import { LegalLayout } from '@/components/legal-layout'

export default function PrivacyPage() {
  return (
    <LegalLayout>
      <h1 className="text-foreground">Privacy Policy</h1>
      <p className="date text-muted-foreground">Last updated: May 2026</p>

      <h2 className="text-primary">Information We Collect</h2>
      <p className="text-foreground/80">
        When you place an order on zhyto.london, we collect your name, email address, phone number, and delivery address. This information is necessary to process and deliver your order.
      </p>

      <h2 className="text-primary">How We Use Your Information</h2>
      <p className="text-foreground/80">
        We use your personal data solely to:
      </p>
      <ul className="text-foreground/80">
        <li>Process and fulfil your orders</li>
        <li>Communicate with you about your order</li>
        <li>Improve our products and services</li>
      </ul>

      <h2 className="text-primary">Data Protection</h2>
      <p className="text-foreground/80">
        Your personal information is stored securely and never shared with third parties for marketing purposes. We may share necessary details with delivery partners solely for order fulfilment.
      </p>

      <h2 className="text-primary">Your Rights</h2>
      <p className="text-foreground/80">
        You have the right to request access to, correction of, or deletion of your personal data at any time. Contact us at hello@zhyto.london for any data-related requests.
      </p>

      <h2 className="text-primary">Cookies</h2>
      <p className="text-foreground/80">
        Our website uses essential cookies to ensure proper functionality. We do not use tracking cookies or third-party analytics without your consent.
      </p>
    </LegalLayout>
  )
}
