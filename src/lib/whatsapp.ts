type WhatsAppPayload = {
  to: string;
  message: string;
};

export async function sendWhatsAppMessage({ to, message }: WhatsAppPayload) {
  const endpoint = process.env.WHATSAPP_API_URL;
  const token = process.env.WHATSAPP_API_TOKEN;

  if (!endpoint || !token) {
    return { ok: false, skipped: true as const };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ to, message }),
      cache: "no-store",
    });

    return { ok: response.ok, skipped: false as const };
  } catch {
    return { ok: false, skipped: false as const };
  }
}
