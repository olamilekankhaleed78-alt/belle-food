export function formatNairaFromKobo(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Math.round(kobo / 100));
}

export function nairaToKobo(naira: number) {
  return Math.round(naira * 100);
}

export function koboToNaira(kobo: number) {
  return kobo / 100;
}
