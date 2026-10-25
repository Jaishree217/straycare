import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function lookup(q: string) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "straycare-bengaluru/1.0 (student project)" },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { lat: string; lon: string }[];
  return data[0]
    ? { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
    : null;
}

async function main() {
  const rows = await prisma.provider.findMany({
    where: { lat: null, address: { not: null } },
  });
  for (const p of rows) {
    const parts = p.address!.split(",").map((s) => s.trim()).filter(Boolean);
    let found: { lat: number; lng: number } | null = null;
    // Try the full address, then drop leading parts until something matches.
    for (let i = 0; i < parts.length - 1 && !found; i++) {
      found = await lookup(parts.slice(i).join(", ") + ", Bengaluru");
      await sleep(1100); // Nominatim allows about 1 request per second
    }
    if (found) {
      await prisma.provider.update({ where: { id: p.id }, data: found });
      console.log(`OK   ${p.name}: ${found.lat}, ${found.lng}`);
    } else {
      console.log(`MISS ${p.name}`);
    }
  }
}

main().finally(() => prisma.$disconnect());
