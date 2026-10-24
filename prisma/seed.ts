import { PrismaClient, ProviderType } from "@prisma/client";
import seed from "./data/bengaluru_seed.json";

const prisma = new PrismaClient();

type Entry = {
  name: string;
  type: keyof typeof ProviderType;
  phones: string[];
  address: string | null;
  lat: number | null;
  lng: number | null;
  is24x7: boolean | null;
  hours: string | null;
  willingToTakeStrays?: boolean | null;
  source?: string;
  notes?: string;
};

async function main() {
  const all = Object.values(seed).flat() as Entry[];
  for (const e of all) {
    const data = {
      type: ProviderType[e.type],
      phones: e.phones,
      address: e.address,
      lat: e.lat,
      lng: e.lng,
      is24x7: e.is24x7,
      hours: e.hours,
      willingToTakeStrays: e.willingToTakeStrays ?? null,
      source: e.source ?? null,
      notes: e.notes ?? null,
    };
    await prisma.provider.upsert({
      where: { name: e.name },
      update: data,
      create: { name: e.name, ...data },
    });
  }
  console.log(`Seeded ${all.length} providers`);
}

main().finally(() => prisma.$disconnect());
