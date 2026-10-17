// Placeholder utilities — never render raw [BRACKETS] or invent facts.
export function isPlaceholder(value) {
  if (typeof value !== "string") return false;
  const v = value.trim();
  return v.startsWith("[") && v.endsWith("]");
}

export function collectPlaceholders(event) {
  const found = [];
  const walk = (obj, path) => {
    if (typeof obj === "string") {
      if (isPlaceholder(obj)) found.push(`${path}: ${obj}`);
      return;
    }
    if (Array.isArray(obj)) {
      obj.forEach((v, i) => walk(v, `${path}[${i}]`));
      return;
    }
    if (obj && typeof obj === "object") {
      Object.entries(obj).forEach(([k, v]) => walk(v, path ? `${path}.${k}` : k));
    }
  };
  walk(event, "event");
  return found;
}

export function logPlaceholderWarnings(event) {
  const list = collectPlaceholders(event);
  if (list.length > 0) {
    console.warn(
      `[recap] ${list.length} placeholder(s) still unfilled:\n` + list.map((s) => `  - ${s}`).join("\n")
    );
  }
  return list;
}

// Offer is only renderable when enabled AND all fields are real values.
export function isOfferRenderable(offer) {
  if (!offer || offer.enabled === false) return false;
  return ![offer.headline, offer.details, offer.deadline].some(isPlaceholder);
}

export function whatsappLink(number, message) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

// Standard credit line wherever the organizers are named.
export function organizerCredit(event) {
  const lead = event.organizers?.lead;
  const collab = event.organizers?.collaborator;
  if (!lead || !collab) return "";
  return `Organized by ${lead.name} (${lead.short}) in collaboration with ${collab.name}`;
}
