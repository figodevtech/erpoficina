import { NextResponse } from "next/server";
import { QUOTES } from "@/lib/quotes"

const TZ = "America/Fortaleza";

function getYYYYMMDDInTZ(date = new Date(), timeZone = TZ) {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, p) => {
      if (p.type !== "literal") acc[p.type] = p.value;
      return acc;
    }, {});
  // pt-BR costuma vir como dd/mm/aaaa
  const dd = parts.day;
  const mm = parts.month;
  const yyyy = parts.year;
  return `${yyyy}-${mm}-${dd}`;
}

function indexForDate(dateStr: string, listLen: number) {
  // hash simples/determinístico com base em YYYY-MM-DD
  let h = 0;
  for (let i = 0; i < dateStr.length; i++) {
    h = (h * 31 + dateStr.charCodeAt(i)) >>> 0;
  }
  return h % listLen;
}

export const dynamic = "force-static"; // permite cache estático + revalidate

export async function GET() {
  const today = getYYYYMMDDInTZ();
  const idx = indexForDate(today, QUOTES.length);
  const quote = QUOTES[idx];

  // cache por 24h no lado do servidor/CDN
  const res = NextResponse.json({ date: today, ...quote });
  res.headers.set("Cache-Control", "public, max-age=0, s-maxage=86400, stale-while-revalidate=3600");
  return res;
}
