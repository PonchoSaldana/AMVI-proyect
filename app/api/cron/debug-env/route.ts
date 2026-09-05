import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  const pk = process.env.FIREBASE_PRIVATE_KEY || "";
  
  return NextResponse.json({
    hasPrivateKey: !!pk,
    length: pk.length,
    startsWith: pk.substring(0, 40),
    endsWith: pk.substring(pk.length - 40),
    hasNewlines: pk.includes('\n'),
    hasLiteralNewlines: pk.includes('\\n'),
    hasQuotes: pk.startsWith('"'),
    hasBeginHeader: pk.includes('BEGIN PRIVATE KEY'),
  });
}
