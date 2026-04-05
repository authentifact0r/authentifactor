import type { Metadata } from "next";

export const metadata: Metadata = { title: "GDPR Compliance — Authentifactor" };

export default function GdprPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1>GDPR &amp; Data Protection Compliance</h1>
      <p className="text-sm text-gray-500">Last updated: 5 April 2026</p>

      <h2>Our Commitment</h2>
      <p>Authentifactor is committed to compliance with the UK General Data Protection Regulation (UK GDPR), the Data Protection Act 2018, the EU General Data Protection Regulation (EU GDPR), and the California Consumer Privacy Act (CCPA).</p>

      <h2>Data Controller</h2>
      <p>Authentifactor Ltd acts as a <strong>Data Controller</strong> for platform-level data (account, billing, usage) and as a <strong>Data Processor</strong> for tenant customer data (orders, addresses, preferences).</p>

      <h2>Lawful Basis for Processing</h2>
      <table>
        <thead><tr><th>Activity</th><th>Lawful Basis</th></tr></thead>
        <tbody>
          <tr><td>Account creation &amp; management</td><td>Contract</td></tr>
          <tr><td>Payment processing</td><td>Contract</td></tr>
          <tr><td>Usage billing</td><td>Contract</td></tr>
          <tr><td>Platform analytics</td><td>Legitimate interest</td></tr>
          <tr><td>Security monitoring</td><td>Legitimate interest</td></tr>
          <tr><td>Marketing emails</td><td>Consent</td></tr>
          <tr><td>Tax records</td><td>Legal obligation</td></tr>
        </tbody>
      </table>

      <h2>Your Rights</h2>
      <ul>
        <li><strong>Right of access</strong> — Request a copy of all data we hold about you</li>
        <li><strong>Right to rectification</strong> — Correct inaccurate or incomplete data</li>
        <li><strong>Right to erasure</strong> — Request deletion of your personal data</li>
        <li><strong>Right to data portability</strong> — Receive data in machine-readable format (JSON)</li>
        <li><strong>Right to restrict processing</strong> — Limit how we use your data</li>
        <li><strong>Right to object</strong> — Object to processing based on legitimate interest</li>
        <li><strong>Right not to be subject to automated decision-making</strong></li>
      </ul>

      <h2>Data Subject Access Requests (DSAR)</h2>
      <p>To exercise your rights, email <a href="mailto:privacy@authentifactor.com">privacy@authentifactor.com</a>. We will respond within 30 days.</p>
      <p>Tenant merchants can also request data export or deletion via their admin dashboard at <code>/admin/settings</code>.</p>

      <h2>Data Processing Agreements</h2>
      <p>We maintain Data Processing Agreements (DPAs) with all sub-processors:</p>
      <ul>
        <li>Stripe Inc. (payments)</li>
        <li>Paystack (payments)</li>
        <li>Vercel Inc. (hosting)</li>
        <li>Google Cloud Platform (infrastructure)</li>
        <li>Neon Inc. (database)</li>
      </ul>

      <h2>International Transfers</h2>
      <p>Data may be transferred outside the UK/EU to the United States. We rely on Standard Contractual Clauses (SCCs) and the UK International Data Transfer Agreement (IDTA) to ensure adequate protection.</p>

      <h2>Data Breach Notification</h2>
      <p>In the event of a personal data breach, we will notify the ICO within 72 hours and affected individuals without undue delay, as required by Article 33/34 of UK GDPR.</p>

      <h2>CCPA (California)</h2>
      <ul>
        <li>We do <strong>not sell</strong> personal information</li>
        <li>California residents may request disclosure of data collected and shared</li>
        <li>Right to opt-out of sale (not applicable — we do not sell data)</li>
        <li>Right to non-discrimination for exercising privacy rights</li>
      </ul>

      <h2>Contact &amp; Supervisory Authority</h2>
      <p>Data Protection queries: <a href="mailto:privacy@authentifactor.com">privacy@authentifactor.com</a></p>
      <p>Supervisory authority: Information Commissioner&apos;s Office (ICO) — <a href="https://ico.org.uk">ico.org.uk</a></p>
    </article>
  );
}
