import { Link } from "react-router-dom";

// Update this to the inbox you want privacy inquiries to reach.
const CONTACT_EMAIL = "farianrahman1000@gmail.com";
const LAST_UPDATED = "July 10, 2026";

const Section = ({ title, children }) => (
  <section className="mt-8">
    <h2 className="text-lg font-semibold tracking-tight text-foreground mb-2">{title}</h2>
    <div className="space-y-3 text-sm leading-relaxed text-muted">{children}</div>
  </section>
);

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-background">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <Link to="/" className="text-sm text-accent hover:underline">
        ← Back to Subscription Manager
      </Link>

      <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted">Last updated: {LAST_UPDATED}</p>

      <p className="mt-6 text-sm leading-relaxed text-muted">
        Subscription Manager ("we", "us", or "the app") helps you track your recurring
        subscriptions and spending. This policy explains what information we collect, how we use
        it, and the choices you have.
      </p>

      <Section title="Information we collect">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <span className="text-foreground font-medium">Account information</span> you provide:
            name, email address, password (stored hashed, never in plain text), gender, an optional
            profile picture, and your preferred display currency.
          </li>
          <li>
            <span className="text-foreground font-medium">Subscription data</span> you enter:
            service names, providers, amounts, billing cycles, dates, categories, and payment method
            labels (a name, type, and the last four digits only — we never collect full card numbers
            or process payments).
          </li>
          <li>
            <span className="text-foreground font-medium">Preferences</span>: your reminder and
            notification settings.
          </li>
        </ul>
      </Section>

      <Section title="Google Calendar (Google user data)">
        <p>
          If you choose to connect Google Calendar, we request the{" "}
          <code className="text-foreground">https://www.googleapis.com/auth/calendar.events</code>{" "}
          scope (and your email address, used only to show which account is linked). We use this
          access solely to:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>create, update, and delete calendar events that correspond to your subscription renewals.</li>
        </ul>
        <p>
          To keep your calendar in sync we store a Google refresh token, encrypted at rest. We never
          sell this data, use it for advertising, or share it with third parties. You can disconnect
          at any time from Settings, which revokes our access to your Google account.
        </p>
        <p className="rounded-xl border border-border bg-surface-2 p-4 text-foreground">
          <span className="font-medium">Limited Use disclosure.</span> Subscription Manager's use and
          transfer of information received from Google APIs adheres to the{" "}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements.
        </p>
      </Section>

      <Section title="How we use your information">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Provide the core service: tracking, dashboards, and spending summaries.</li>
          <li>Send renewal reminder emails (when enabled) and account emails such as verification and password resets.</li>
          <li>Generate AI-powered spending insights, if your plan includes that feature.</li>
          <li>Sync subscription renewals to your Google Calendar, if you connect it.</li>
        </ul>
      </Section>

      <Section title="Third-party services">
        <p>We rely on the following providers to operate the app:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>MongoDB Atlas — database hosting.</li>
          <li>Google Calendar API — only if you connect it.</li>
          <li>
            An AI provider (an OpenAI-compatible service such as Groq) — to generate insights we send
            a summary of your subscription amounts and categories. We do not send your name, email,
            or payment details.
          </li>
          <li>Gmail (SMTP) — to deliver reminder and account emails.</li>
          <li>ImgBB — only if you upload a profile picture.</li>
          <li>A public exchange-rate API — for currency conversion.</li>
        </ul>
      </Section>

      <Section title="Data storage and security">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Passwords are hashed; Google refresh tokens are encrypted at rest.</li>
          <li>Data is transmitted over encrypted HTTPS connections.</li>
        </ul>
      </Section>

      <Section title="Data retention and deletion">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            You can delete your account at any time from Settings → Security. This permanently removes
            your subscriptions, transactions, and notifications.
          </li>
          <li>
            Disconnecting Google Calendar revokes our access and stops any further syncing.
          </li>
        </ul>
      </Section>

      <Section title="Your choices">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Manage reminder and email preferences in Settings.</li>
          <li>Connect or disconnect Google Calendar at any time.</li>
          <li>Delete your account at any time.</li>
        </ul>
      </Section>

      <Section title="Children's privacy">
        <p>The app is not directed to children under 13, and we do not knowingly collect their data.</p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          We may update this policy from time to time. The "Last updated" date above reflects the most
          recent revision.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          If you have any questions about this policy or your data, email us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </Section>
    </div>
  </div>
);

export default PrivacyPolicy;
