import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Use — Authentifactor" };

export default function TermsPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1>Terms of Use</h1>
      <p className="text-sm text-gray-500">Last updated: 5 April 2026</p>

      <h2>1. Acceptance</h2>
      <p>By accessing or using the Authentifactor platform (&quot;Platform&quot;), you agree to be bound by these Terms of Use. If you do not agree, do not use the Platform.</p>

      <h2>2. Definitions</h2>
      <ul>
        <li><strong>&quot;Platform&quot;</strong> — The Authentifactor multi-tenant commerce infrastructure, including all APIs, dashboards, storefronts, and services.</li>
        <li><strong>&quot;Tenant&quot;</strong> — A business or individual using the Platform to operate a storefront.</li>
        <li><strong>&quot;End User&quot;</strong> — A customer of a Tenant who interacts with a Tenant&apos;s storefront.</li>
        <li><strong>&quot;Authentifactor&quot;</strong>, &quot;we&quot;, &quot;us&quot; — Authentifactor Ltd.</li>
      </ul>

      <h2>3. Platform Services</h2>
      <p>Authentifactor provides:</p>
      <ul>
        <li>Multi-tenant e-commerce hosting and infrastructure</li>
        <li>Custom domain management</li>
        <li>Payment processing integration (Stripe, Paystack)</li>
        <li>Admin and analytics dashboards</li>
        <li>Usage-based billing and reporting</li>
      </ul>

      <h2>4. Accounts</h2>
      <ul>
        <li>You must provide accurate, complete information when creating an account.</li>
        <li>You are responsible for maintaining the security of your credentials.</li>
        <li>You must notify us immediately of any unauthorised use.</li>
        <li>You must be at least 18 years old to use the Platform.</li>
      </ul>

      <h2>5. Billing</h2>
      <ul>
        <li>Tenants are billed monthly: Base Retainer + Hosting Usage (Vercel) + Backend Usage (Google Cloud).</li>
        <li>Prices are in GBP. Plans: Basic (£49/mo), Standard (£99/mo), Premium (£199/mo).</li>
        <li>Usage charges are computed from real infrastructure metrics and billed transparently.</li>
        <li>Failed payments will result in billing status &quot;delinquent&quot; and restricted admin access.</li>
        <li>We reserve the right to adjust pricing with 30 days written notice.</li>
      </ul>

      <h2>6. Acceptable Use</h2>
      <p>You agree NOT to:</p>
      <ul>
        <li>Use the Platform for illegal activities</li>
        <li>Upload malicious code, viruses, or exploits</li>
        <li>Attempt to access other tenants&apos; data</li>
        <li>Reverse engineer, decompile, or scrape the Platform</li>
        <li>Send unsolicited communications or spam</li>
        <li>Violate intellectual property rights</li>
        <li>Engage in activity that degrades platform performance</li>
      </ul>

      <h2>7. Intellectual Property</h2>
      <ul>
        <li>Authentifactor owns all Platform code, design, and infrastructure.</li>
        <li>Tenants retain ownership of their content, products, and branding.</li>
        <li>Tenants grant Authentifactor a licence to host and display their content.</li>
      </ul>

      <h2>8. Data Protection</h2>
      <p>We process personal data in accordance with our <a href="/legal/privacy">Privacy Policy</a> and applicable data protection laws (UK GDPR, DPA 2018, EU GDPR, CCPA).</p>

      <h2>9. Uptime &amp; Liability</h2>
      <ul>
        <li>We target 99.9% uptime but do not guarantee uninterrupted service.</li>
        <li>We are not liable for losses resulting from downtime, data loss, or third-party service failures.</li>
        <li>Our total liability is limited to the fees paid by you in the preceding 12 months.</li>
      </ul>

      <h2>10. Termination</h2>
      <ul>
        <li>Either party may terminate with 30 days written notice.</li>
        <li>We may suspend or terminate access immediately for Terms violations.</li>
        <li>Upon termination, we will provide data export for 30 days, then delete tenant data.</li>
      </ul>

      <h2>11. Governing Law</h2>
      <p>These Terms are governed by the laws of England and Wales. Disputes shall be resolved in the courts of England and Wales.</p>

      <h2>12. Changes</h2>
      <p>We may update these Terms. Material changes will be notified via email 30 days in advance.</p>

      <h2>13. Contact</h2>
      <p>Authentifactor Ltd<br />Email: <a href="mailto:legal@authentifactor.com">legal@authentifactor.com</a></p>
    </article>
  );
}
