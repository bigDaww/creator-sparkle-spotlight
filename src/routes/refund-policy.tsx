import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, Section } from "@/components/LegalPage";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title: "Refund Policy — CoraHQ" },
      { name: "description", content: "CoraHQ offers refunds within 14 days of purchase if the service hasn't been substantially used. Payments and refunds are handled by Paddle." },
      { property: "og:title", content: "Refund Policy — CoraHQ" },
      { property: "og:description", content: "14-day refund window, how to request one, and what isn't refundable." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RefundPage,
});

function RefundPage() {
  return (
    <LegalPage
      title="Refund Policy"
      updated="1 August 2026"
      intro="Short version: if CoraHQ isn't for you, email us within 14 days of your payment and we'll refund it, as long as you haven't already run a large amount of work through the tool."
    >
      <Section n={1} title="The refund window">
        <ul>
          <li>Refunds are available within <strong>14 days</strong> of a payment (first purchase or a renewal).</li>
          <li>The plan must not have been substantially used — as a rule of thumb, fewer than 10 optimizations or scans on that billing period.</li>
          <li>Approved refunds cover the full amount of that payment.</li>
        </ul>
      </Section>

      <Section n={2} title="How to request one">
        <ul>
          <li>Email <a href="mailto:hello@corahq.com">hello@corahq.com</a> from the address on your account, with your Paddle order or receipt number.</li>
          <li>Or open the Paddle customer portal link in your receipt email and request it there.</li>
          <li>We reply within 2 business days. Once approved, the money typically lands back on your card in 5–10 business days depending on your bank.</li>
        </ul>
      </Section>

      <Section n={3} title="What isn't refundable">
        <ul>
          <li>Payments older than 14 days.</li>
          <li>Billing periods where the service was substantially used.</li>
          <li>Partial or unused time after you cancel mid-period — cancelling stops the next renewal, and you keep access until the period ends.</li>
          <li>Accounts closed by us for abuse or breach of the Terms of Service.</li>
        </ul>
        <p>If your situation doesn't fit neatly into the rules above, email us anyway — we'd rather sort it out than argue about it.</p>
      </Section>

      <Section n={4} title="Who processes the refund">
        <p>
          All payments for CoraHQ are processed by <strong>Paddle.com</strong>, which is the merchant
          of record for every order. That means Paddle issues your invoice, handles tax, and executes
          the actual refund transaction back to your original payment method. We authorise the refund;
          Paddle moves the money.
        </p>
      </Section>
    </LegalPage>
  );
}
