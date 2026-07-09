// Builds an RFC 5545 iCalendar (.ics) feed of a user's subscription renewals.
// Each subscription becomes one recurring all-day event on its billing date so
// calendar apps (Google/Apple/Outlook) show upcoming renewals natively.

const CYCLE_TO_RRULE = {
  weekly: "FREQ=WEEKLY",
  monthly: "FREQ=MONTHLY",
  yearly: "FREQ=YEARLY",
};

// Escape text per RFC 5545 (backslash, semicolon, comma, newline).
function escapeText(value = "") {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function toDateValue(date) {
  const d = new Date(date);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

function toTimestamp(date) {
  return `${toDateValue(date)}T000000Z`;
}

// Fold lines longer than 75 octets per RFC 5545 (continuation lines start with a space).
function foldLine(line) {
  if (line.length <= 75) return line;
  const chunks = [];
  let rest = line;
  chunks.push(rest.slice(0, 75));
  rest = rest.slice(75);
  while (rest.length > 74) {
    chunks.push(" " + rest.slice(0, 74));
    rest = rest.slice(74);
  }
  if (rest.length) chunks.push(" " + rest);
  return chunks.join("\r\n");
}

function amountLabel(sub) {
  if (sub.originalAmount != null && sub.originalCurrency) {
    return `${sub.originalCurrency} ${sub.originalAmount}`;
  }
  return `$${(sub.costInDollar ?? 0).toFixed(2)}`;
}

/**
 * @param {object[]} subscriptions - Mongoose subscription docs (or plain objects).
 * @param {object} [opts]
 * @param {string} [opts.name] - Calendar display name.
 * @returns {string} the .ics document text (CRLF line endings).
 */
export function buildSubscriptionCalendar(subscriptions = [], { name = "Subscription renewals" } = {}) {
  const now = new Date();
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Subscription Manager//Renewals//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(name)}`,
    "X-PUBLISHED-TTL:PT12H",
  ];

  for (const sub of subscriptions) {
    if (!sub.nextBillingDate) continue;
    const rrule = CYCLE_TO_RRULE[sub.billingCycle] || CYCLE_TO_RRULE.monthly;
    const summary = `${sub.serviceName} renews (${amountLabel(sub)})`;
    const description = `${sub.serviceName} · ${sub.provider} · ${sub.billingCycle} billing`;

    lines.push(
      "BEGIN:VEVENT",
      `UID:subscription-${sub._id}@subscription-manager`,
      `DTSTAMP:${toTimestamp(now)}`,
      `DTSTART;VALUE=DATE:${toDateValue(sub.nextBillingDate)}`,
      `RRULE:${rrule}`,
      `SUMMARY:${escapeText(summary)}`,
      `DESCRIPTION:${escapeText(description)}`,
      "TRANSP:TRANSPARENT",
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return lines.map(foldLine).join("\r\n") + "\r\n";
}
