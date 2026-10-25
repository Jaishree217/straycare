import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Flip to true once you have verified the listings yourself.
const SHOW_ONLY_VERIFIED = false;

function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(bLat - aLat);
  const dLng = rad(bLng - aLng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export async function POST(req: Request) {
  let body: { lat?: unknown; lng?: unknown; note?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const lat = typeof body.lat === "number" ? body.lat : null;
  const lng = typeof body.lng === "number" ? body.lng : null;
  const note =
    typeof body.note === "string" ? body.note.trim().slice(0, 500) : "";

  if (
    (lat !== null && (lat < -90 || lat > 90)) ||
    (lng !== null && (lng < -180 || lng > 180))
  ) {
    return NextResponse.json({ error: "Invalid location" }, { status: 400 });
  }

  let reportId: string | null = null;
  if (lat !== null && lng !== null) {
    const report = await prisma.report.create({
      data: { lat, lng, note: note || null },
    });
    reportId = report.id;
  }

  const rows = await prisma.provider.findMany({
    where: SHOW_ONLY_VERIFIED ? { verified: true } : {},
  });

  const providers = rows
    .filter((p) => p.phones.length > 0)
    .map((p) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      phones: p.phones,
      address: p.address,
      is24x7: p.is24x7,
      hours: p.hours,
      distanceKm:
        lat !== null && lng !== null && p.lat !== null && p.lng !== null
          ? Math.round(distanceKm(lat, lng, p.lat, p.lng) * 10) / 10
          : null,
    }))
    .sort((a, b) => {
      if (a.distanceKm !== null && b.distanceKm !== null)
        return a.distanceKm - b.distanceKm;
      if (a.distanceKm !== null) return -1;
      if (b.distanceKm !== null) return 1;
      return Number(b.is24x7 === true) - Number(a.is24x7 === true);
    });

  return NextResponse.json({ reportId, providers });
}
