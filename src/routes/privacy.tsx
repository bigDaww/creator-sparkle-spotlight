import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, Section } from "@/components/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — CoraHQ" },
      { name: "description", content: "What data CoraHQ collects from creators, how it's used, who it's shared with, how long it's kept, and how to request deletion." },
      { property: "og:title", content: "Privacy Policy — CoraHQ" },
      { property: "og:description", content: "Plain-language privacy policy for CoraHQ: data collected, third parties, retention and your rights." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="1 August 2026"
      intro="This explains what CoraHQ collects, why, and what you can ask us to do about it. CoraHQ is operated by Cora at corahq.online. If anything here is unclear, email hello@corahq.com."
    >
      <Section n={1} title="What we collect">
        <ul>
          <li><strong>Account info</strong> — your email address and authentication details. Sign-in is handled by Supabase; if you use Google sign-in we receive your email and basic profile from Google.</li>
          <li><strong>Content you submit</strong> — video titles, descriptions, tags, transcripts, channel URLs and any notes you paste in, plus the results we generate from them.</li>
          <li><strong>Usage data</strong> — which features you use, when, and basic technical data like browser type and error logs, so we can keep the app working.</li>
          <li><strong>Payment data</strong> — your plan status and subscription ID. Payments run through Paddle as merchant of record. <strong>We never see or store your card number</strong>; it stays with Paddle and its processors.</li>
        </ul>
      </Section>

      <Section n={2} title="How we use it">
        <ul>
          <li>To run the service: score visibility, generate optimized titles, descriptions, FAQs and chapters, and show your history.</li>
          <li>To manage your account, subscription and access level.</li>
          <li>To fix bugs, monitor abuse and improve the product in aggregate.</li>
          <li>To send you service emails (receipts, account and security notices) and, only if you opted in, product updates. You can unsubscribe from marketing at any time.</li>
        </ul>
        <p>We do not sell your data and we do not use your private video content for advertising.</p>
      </Section>

      <Section n={3} title="Who we share it with">
        <ul>
          <li><strong>Supabase</strong> — database, authentication and hosting for your account and saved scans.</li>
          <li><strong>Paddle</strong> — payment processing, invoicing and tax as merchant of record.</li>
          <li><strong>Lovable AI gateway</strong> — the AI provider that generates scoring and optimization output. The content you submit for analysis is sent to this provider to produce your results.</li>
          <li><strong>YouTube's public Data API</strong> — used to read publicly available channel and video statistics when a feature needs them.</li>
        </ul>
        <p>We may also disclose data if the law requires it, or to protect the service and its users from abuse.</p>
      </Section>

      <Section n={4} title="How long we keep it">
        <ul>
          <li>Scan and optimization history is kept while your account is open, so you can go back to it.</li>
          <li>If you delete your account, we remove your account data and content within 30 days.</li>
          <li>Billing and tax records are kept longer where the law requires it, and are held by Paddle as well as us.</li>
          <li>Anonymised, aggregated statistics that can't identify you may be kept indefinitely.</li>
        </ul>
      </Section>

      <Section n={5} title="Your rights">
        <p>
          You can ask us for a copy of your data, ask us to correct it, or ask us to delete it. Email{" "}
          <a href="mailto:hello@corahq.com">hello@corahq.com</a> from your account address and we'll
          respond within 30 days. You can also delete individual scans and optimizations from inside
          the app at any time.
        </p>
      </Section>

      <Section n={6} title="Cookies and tracking">
        <p>
          We use cookies and local storage that are needed for the app to work — mainly keeping you
          signed in and remembering your session. Paddle sets its own cookies during checkout to
          process your payment and prevent fraud. We do not run third-party advertising trackers.
        </p>
      </Section>

      <Section n={7} title="Security">
        <p>
          Traffic to and from CoraHQ is encrypted in transit (HTTPS). Account data sits in a managed
          Supabase database with row-level access rules so users can only read their own records, and
          administrative access is limited to people who need it. No system is perfectly secure, so we
          don't claim it is — if we ever discover a breach affecting your data, we'll tell you.
        </p>
      </Section>

      <Section n={8} title="Children's privacy">
        <p>
          CoraHQ isn't directed at anyone under 18 and we don't knowingly collect data from children.
          If you believe a minor has created an account, email us and we'll remove it.
        </p>
      </Section>

      <Section n={9} title="Changes to this policy">
        <p>
          If we change how we handle data we'll update this page and move the “last updated” date.
          For significant changes we'll also email account holders or show a notice in the app before
          the change takes effect.
        </p>
      </Section>

      <Section n={10} title="Contact">
        <p>
          Questions or requests: <a href="mailto:hello@corahq.com">hello@corahq.com</a>.
        </p>
      </Section>
    </LegalPage>
  );
}
