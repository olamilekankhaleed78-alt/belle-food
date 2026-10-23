/** Turns a Nigerian phone number into digits with the country code, or "" if it looks wrong. */
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("234") && digits.length >= 13) return digits;
  if (digits.startsWith("0") && digits.length === 11) return `234${digits.slice(1)}`;
  if (digits.length >= 10 && digits.length <= 15 && !digits.startsWith("0")) return digits;
  return "";
}

export function whatsappLink(number: string, message: string): string {
  const phone = normalizePhone(number);
  if (!phone) return "";
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function telLink(number: string): string {
  const phone = normalizePhone(number);
  return phone ? `tel:+${phone}` : "";
}
