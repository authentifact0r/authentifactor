import type { Metadata } from "next";

export const metadata: Metadata = { title: "Security — Authentifactor" };

export default function SecurityPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1>Security Policy</h1>
      <p className="text-sm text-gray-500">Last updated: 5 April 2026</p>

      <h2>Infrastructure Security</h2>
      <table>
        <thead><tr><th>Layer</th><th>Measure</th></tr></thead>
        <tbody>
          <tr><td>Transport</td><td>TLS 1.3 / HTTPS enforced on all endpoints</td></tr>
          <tr><td>Hosting</td><td>Vercel Edge Network (DDoS protection, WAF, automatic SSL)</td></tr>
          <tr><td>Backend</td><td>Google Cloud Run (isolated containers, auto-scaling)</td></tr>
          <tr><td>Database</td><td>PostgreSQL on Neon (encryption at rest, connection pooling, SSL)</td></tr>
          <tr><td>Payments</td><td>Stripe &amp; Paystack (PCI DSS Level 1 compliant — we never store card data)</td></tr>
        </tbody>
      </table>

      <h2>Application Security</h2>
      <ul>
        <li><strong>Authentication:</strong> JWT tokens with HS256 signing, 7-day expiry, httpOnly cookies</li>
        <li><strong>Authorization:</strong> Role-based access control (SuperAdmin, Admin, Manager, Customer)</li>
        <li><strong>Tenant isolation:</strong> All database queries are tenant-scoped via Prisma middleware</li>
        <li><strong>Input validation:</strong> Zod schema validation on all API boundaries</li>
        <li><strong>XSS prevention:</strong> React auto-escaping, no dangerouslySetInnerHTML on user data</li>
        <li><strong>CSRF:</strong> SameSite cookie policy + origin verification</li>
        <li><strong>Rate limiting:</strong> API endpoints rate-limited per tenant</li>
      </ul>

      <h2>Security Headers</h2>
      <ul>
        <li><code>X-Frame-Options: DENY</code></li>
        <li><code>X-Content-Type-Options: nosniff</code></li>
        <li><code>Strict-Transport-Security: max-age=63072000</code></li>
        <li><code>Referrer-Policy: strict-origin-when-cross-origin</code></li>
        <li><code>Permissions-Policy: camera=(), microphone=(), geolocation=()</code></li>
      </ul>

      <h2>Data Encryption</h2>
      <ul>
        <li><strong>In transit:</strong> TLS 1.3 for all connections</li>
        <li><strong>At rest:</strong> AES-256 encryption on database storage (Neon)</li>
        <li><strong>Secrets:</strong> Environment variables, never committed to source control</li>
        <li><strong>Passwords:</strong> bcrypt with 12 salt rounds</li>
      </ul>

      <h2>Incident Response</h2>
      <ol>
        <li>Detection — automated monitoring + alerting</li>
        <li>Containment — isolate affected systems within 1 hour</li>
        <li>Notification — ICO within 72 hours, affected users without undue delay</li>
        <li>Recovery — restore from backups, patch vulnerability</li>
        <li>Post-mortem — root cause analysis within 7 days</li>
      </ol>

      <h2>Responsible Disclosure</h2>
      <p>If you discover a security vulnerability, please report it responsibly:</p>
      <ul>
        <li>Email: <a href="mailto:security@authentifactor.com">security@authentifactor.com</a></li>
        <li>Do not publicly disclose the vulnerability until we have resolved it</li>
        <li>We will acknowledge receipt within 24 hours and provide a timeline</li>
      </ul>

      <h2>Compliance</h2>
      <ul>
        <li>UK GDPR / Data Protection Act 2018</li>
        <li>EU GDPR</li>
        <li>CCPA (California)</li>
        <li>PCI DSS (via Stripe/Paystack — we never handle card data directly)</li>
      </ul>
    </article>
  );
}
