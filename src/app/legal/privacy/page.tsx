import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy — Authentifactor" };

export default function PrivacyPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1>Privacy Policy</h1>
      <p className="text-sm text-gray-500">Last updated: 5 April 2026</p>

      <h2>1. Introduction</h2>
      <p>Authentifactor Ltd (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the Authentifactor multi-tenant commerce platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform, including our website at authentifactor.com and all tenant storefronts powered by our infrastructure.</p>
      <p>We are committed to protecting your privacy and complying with the UK General Data Protection Regulation (UK GDPR), the Data Protection Act 2018, the EU General Data Protection Regulation (EU GDPR), and the California Consumer Privacy Act (CCPA).</p>

      <h2>2. Information We Collect</h2>
      <h3>2.1 Personal Data</h3>
      <ul>
        <li><strong>Account information:</strong> name, email address, phone number, password (hashed)</li>
        <li><strong>Billing information:</strong> processed by Stripe — we do not store full card numbers</li>
        <li><strong>Order information:</strong> shipping address, order history, payment status</li>
        <li><strong>Communications:</strong> emails, support requests, feedback</li>
      </ul>
      <h3>2.2 Usage Data</h3>
      <ul>
        <li>IP address, browser type, device information</li>
        <li>Pages visited, time spent, referral source</li>
        <li>Infrastructure usage metrics (build times, bandwidth, API calls)</li>
      </ul>
      <h3>2.3 Cookies and Tracking</h3>
      <p>See our <a href="/legal/cookies">Cookie Policy</a> for details on how we use cookies and similar technologies.</p>

      <h2>3. How We Use Your Information</h2>
      <ul>
        <li>To provide, maintain, and improve our platform</li>
        <li>To process transactions and send related information</li>
        <li>To communicate with you about your account, orders, and services</li>
        <li>To monitor and analyse usage patterns and infrastructure performance</li>
        <li>To compute billing based on actual platform usage</li>
        <li>To detect, prevent, and address fraud and security issues</li>
        <li>To comply with legal obligations</li>
      </ul>

      <h2>4. Legal Basis for Processing (UK/EU GDPR)</h2>
      <ul>
        <li><strong>Contract:</strong> Processing necessary to perform our contract with you (account management, order fulfilment, billing)</li>
        <li><strong>Legitimate interest:</strong> Platform improvement, security, fraud prevention, analytics</li>
        <li><strong>Consent:</strong> Marketing communications, non-essential cookies</li>
        <li><strong>Legal obligation:</strong> Tax records, regulatory compliance</li>
      </ul>

      <h2>5. Data Sharing</h2>
      <p>We share personal data only with:</p>
      <ul>
        <li><strong>Stripe:</strong> Payment processing (PCI DSS compliant)</li>
        <li><strong>Paystack:</strong> Payment processing for African markets</li>
        <li><strong>Vercel:</strong> Infrastructure hosting (edge network)</li>
        <li><strong>Google Cloud:</strong> Backend infrastructure, database hosting</li>
        <li><strong>Neon:</strong> PostgreSQL database hosting</li>
      </ul>
      <p>We do not sell your personal data to third parties.</p>

      <h2>6. Data Retention</h2>
      <ul>
        <li>Account data: retained while your account is active + 2 years after deletion</li>
        <li>Transaction data: 7 years (legal/tax requirements)</li>
        <li>Usage analytics: 24 months</li>
        <li>Server logs: 90 days</li>
      </ul>

      <h2>7. Your Rights</h2>
      <p>Under UK GDPR, EU GDPR, and CCPA, you have the right to:</p>
      <ul>
        <li><strong>Access:</strong> Request a copy of your personal data</li>
        <li><strong>Rectification:</strong> Correct inaccurate data</li>
        <li><strong>Erasure:</strong> Request deletion of your data (&quot;right to be forgotten&quot;)</li>
        <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
        <li><strong>Restriction:</strong> Limit how we process your data</li>
        <li><strong>Objection:</strong> Object to processing based on legitimate interest</li>
        <li><strong>Opt-out of sale:</strong> Under CCPA, you can opt out of the sale of personal information (we do not sell data)</li>
      </ul>
      <p>To exercise any of these rights, contact us at <a href="mailto:privacy@authentifactor.com">privacy@authentifactor.com</a>.</p>

      <h2>8. International Transfers</h2>
      <p>Your data may be processed in the UK, EU, and United States. We ensure appropriate safeguards (Standard Contractual Clauses, UK IDTA) are in place for international transfers.</p>

      <h2>9. Security</h2>
      <p>We implement industry-standard security measures including:</p>
      <ul>
        <li>TLS/HTTPS encryption for all data in transit</li>
        <li>Encryption at rest for databases</li>
        <li>JWT-based authentication with token rotation</li>
        <li>Role-based access control (RBAC)</li>
        <li>Regular security audits</li>
      </ul>
      <p>See our <a href="/legal/security">Security Policy</a> for details.</p>

      <h2>10. Children&apos;s Privacy</h2>
      <p>Our platform is not intended for children under 16. We do not knowingly collect personal data from children.</p>

      <h2>11. Changes to This Policy</h2>
      <p>We may update this policy periodically. We will notify you of material changes via email or platform notification.</p>

      <h2>12. Contact</h2>
      <p>Authentifactor Ltd<br />Email: <a href="mailto:privacy@authentifactor.com">privacy@authentifactor.com</a><br />Website: <a href="https://authentifactor.com">authentifactor.com</a></p>
      <p>If you are unsatisfied with our response, you have the right to lodge a complaint with the Information Commissioner&apos;s Office (ICO) at <a href="https://ico.org.uk">ico.org.uk</a>.</p>
    </article>
  );
}
