import { WEDDING } from "./config";

export function formatReveal(iso: string) {
  const d = new Date(iso);
  const day = d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: WEDDING.timeZone });
  const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: WEDDING.timeZone });
  return `${day} à ${time.replace(":", "h")}`;
}

export function plural(n: number, one: string, many: string) {
  return `${n.toLocaleString("fr-FR")} ${n > 1 ? many : one}`;
}
