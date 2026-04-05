import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cookie Policy — Authentifactor" };

export default function CookiesPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1>Cookie Policy</h1>
      <p className="text-sm text-gray-500">Last updated: 5 April 2026</p>

      <h2>1. What Are Cookies</h2>
      <p>Cookies are small text files stored on your device when you visit a website. They help us provide a better experience, remember your preferences, and understand how you use our platform.</p>

      <h2>2. Cookies We Use</h2>

      <h3>2.1 Essential Cookies</h3>
      <p>Required for the platform to function. Cannot be disabled.</p>
      <table>
        <thead><tr><th>Cookie</th><th>Purpose</th><th>Duration</th></tr></thead>
        <tbody>
          <tr><td><code>access_token</code></td><td>Authentication (JWT)</td><td>7 days</td></tr>
          <tr><td><code>refresh_token</code></td><td>Session refresh</td><td>30 days</td></tr>
        </tbody>
      </table>

      <h3>2.2 Analytics Cookies</h3>
      <p>Help us understand how you use the platform.</p>
      <table>
        <thead><tr><th>Cookie</th><th>Provider</th><th>Purpose</th><th>Duration</th></tr></thead>
        <tbody>
          <tr><td><code>_ga</code></td><td>Google Analytics</td><td>Usage analytics</td><td>2 years</td></tr>
          <tr><td><code>_ga_*</code></td><td>Google Analytics</td><td>Session tracking</td><td>2 years</td></tr>
        </tbody>
      </table>

      <h3>2.3 Third-Party Cookies</h3>
      <p>Set by our payment and infrastructure providers:</p>
      <ul>
        <li><strong>Stripe:</strong> Fraud prevention and payment processing</li>
        <li><strong>Paystack:</strong> Payment processing for African markets</li>
        <li><strong>Vercel:</strong> Performance analytics and edge routing</li>
      </ul>

      <h2>3. Managing Cookies</h2>
      <p>You can manage cookies through your browser settings. Disabling essential cookies may prevent the platform from functioning correctly.</p>

      <h2>4. Contact</h2>
      <p>Questions about our cookie practices: <a href="mailto:privacy@authentifactor.com">privacy@authentifactor.com</a></p>
    </article>
  );
}
