import type { Metadata } from "next";

export const metadata: Metadata = { title: "Merchant Terms — Authentifactor" };

export default function MerchantTermsPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1>Merchant Terms of Service</h1>
      <p className="text-sm text-gray-500">Last updated: 5 April 2026</p>

      <h2>1. Overview</h2>
      <p>These Merchant Terms govern the relationship between Authentifactor Ltd (&quot;Platform Provider&quot;) and businesses (&quot;Merchants&quot; or &quot;Tenants&quot;) who use the Authentifactor multi-tenant commerce platform to operate their online storefronts.</p>

      <h2>2. Service Description</h2>
      <p>Authentifactor provides Merchants with:</p>
      <ul>
        <li>Hosted, branded e-commerce storefront</li>
        <li>Custom domain with SSL</li>
        <li>Product catalogue and inventory management</li>
        <li>Order processing and fulfilment tools</li>
        <li>Payment processing integration (Stripe, Paystack)</li>
        <li>Admin dashboard with analytics</li>
        <li>SEO tools and sitemap generation</li>
        <li>Usage-based billing transparency</li>
      </ul>

      <h2>3. Billing Structure</h2>
      <p>Merchants are billed monthly with three components:</p>
      <ol>
        <li><strong>Base Retainer</strong> — Fixed monthly fee (Basic £49, Standard £99, Premium £199) covering platform maintenance, security updates, and support.</li>
        <li><strong>Hosting Usage (Vercel)</strong> — Variable cost based on actual frontend infrastructure usage: build minutes, serverless invocations, bandwidth, edge requests.</li>
        <li><strong>Backend Usage (Google Cloud)</strong> — Variable cost based on actual backend infrastructure usage: Cloud Run compute, Firestore operations, Cloud Storage.</li>
      </ol>
      <p>Usage costs are computed transparently and visible in the Merchant admin dashboard at <code>/admin/billing</code>.</p>

      <h2>4. Merchant Obligations</h2>
      <ul>
        <li>Comply with all applicable laws (consumer protection, advertising standards, product safety)</li>
        <li>Provide accurate product descriptions and pricing</li>
        <li>Fulfil orders in a timely manner</li>
        <li>Handle customer complaints and returns per your own published policies</li>
        <li>Maintain a published Privacy Policy and Terms of Sale on your storefront</li>
        <li>Not sell prohibited, illegal, or counterfeit goods</li>
        <li>Not engage in fraudulent transactions</li>
      </ul>

      <h2>5. Data Processing</h2>
      <p>Authentifactor acts as a <strong>Data Processor</strong> for Merchant customer data. Merchants act as <strong>Data Controllers</strong> for their customers.</p>
      <ul>
        <li>We process customer data solely to provide the Platform services</li>
        <li>We do not use Merchant customer data for our own marketing</li>
        <li>We implement appropriate technical and organisational security measures</li>
        <li>We will assist Merchants in responding to Data Subject Access Requests</li>
        <li>We notify Merchants of data breaches affecting their customer data within 24 hours</li>
      </ul>

      <h2>6. Intellectual Property</h2>
      <ul>
        <li>Merchants retain full ownership of their content, branding, products, and customer relationships</li>
        <li>Authentifactor retains ownership of the Platform software, infrastructure, and design system</li>
        <li>Merchants grant Authentifactor a limited licence to host and display their content</li>
      </ul>

      <h2>7. Availability &amp; SLA</h2>
      <table>
        <thead><tr><th>Plan</th><th>Uptime SLA</th><th>Support Response</th></tr></thead>
        <tbody>
          <tr><td>Basic</td><td>99.5%</td><td>48h email</td></tr>
          <tr><td>Standard</td><td>99.9%</td><td>24h priority email</td></tr>
          <tr><td>Premium</td><td>99.9%</td><td>Phone + Slack, dedicated AM</td></tr>
        </tbody>
      </table>

      <h2>8. Termination</h2>
      <ul>
        <li>Either party may terminate with 30 days written notice</li>
        <li>Authentifactor may suspend for non-payment after 14 days past due</li>
        <li>Upon termination, Merchants receive a 30-day data export window</li>
        <li>After the export window, all Merchant data is permanently deleted</li>
      </ul>

      <h2>9. Limitation of Liability</h2>
      <p>Authentifactor&apos;s total liability is limited to the fees paid by the Merchant in the preceding 12 months. We are not liable for indirect, consequential, or punitive damages, lost profits, or third-party claims.</p>

      <h2>10. Governing Law</h2>
      <p>These Terms are governed by the laws of England and Wales.</p>

      <h2>11. Contact</h2>
      <p>Authentifactor Ltd<br />Email: <a href="mailto:legal@authentifactor.com">legal@authentifactor.com</a></p>
    </article>
  );
}
