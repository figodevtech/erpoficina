import { NextResponse } from "next/server";
import { fetchPrimeiroLogoEmpresa } from "@/lib/empresa-logo";

export const runtime = "nodejs";

export async function GET() {
  const logoUrl = await fetchPrimeiroLogoEmpresa();
  return NextResponse.json({ logoUrl });
}
