import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const REGIONS = [
  "طنجة-تطوان-الحسيمة",
  "الشرق",
  "فاس-مكناس",
  "الرباط-سلا-القنيطرة",
  "بني ملال-خنيفرة",
  "الدار البيضاء-سطات",
  "مراكش-آسفي",
  "درعة-تافيلالت",
  "سوس-ماسة",
  "كلميم-واد نون",
  "العيون-الساقية الحمراء",
  "الداخلة-وادي الذهب",
];

async function main() {
  console.log("Seeding regions...");
  const regions = await Promise.all(
    REGIONS.map((nameAr, i) =>
      prisma.region.upsert({
        where: { slug: `region-${i + 1}` },
        update: {},
        create: { nameAr, slug: `region-${i + 1}` },
      })
    )
  );

  console.log("Seeding admin user...");
  const passwordHash = await bcrypt.hash("ChangeMe123!", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@marsad.ma" },
    update: {},
    create: {
      email: "admin@marsad.ma",
      name: "مدير المنصة",
      role: "ADMIN",
      passwordHash,
    },
  });

  console.log("Seeding sample party & promise...");
  const party = await prisma.party.upsert({
    where: { slug: "sample-party" },
    update: {},
    create: {
      nameAr: "حزب نموذجي (بيانات تجريبية)",
      slug: "sample-party",
      description: "بيانات تجريبية لأغراض التطوير فقط.",
    },
  });

  await prisma.promise.create({
    data: {
      description: "بناء 50 مركزًا صحيًا جديدًا في المناطق القروية",
      category: "الصحة",
      regionId: regions[0].id,
      partyId: party.id,
      status: "IN_PROGRESS",
      sourceUrl: "https://example.gov.ma/programme-2026",
      updates: {
        create: {
          previousStatus: "NOT_STARTED",
          newStatus: "IN_PROGRESS",
          sourceUrl: "https://example.gov.ma/rapport-2026-q1",
          note: "بدء الأشغال في 12 موقعًا",
          updatedById: admin.id,
        },
      },
    },
  });

  console.log("Seeding sample project...");
  await prisma.project.create({
    data: {
      name: "تهيئة الطريق الوطنية رقم 1",
      regionId: regions[0].id,
      budget: 45000000,
      progressPercent: 40,
      sourceUrl: "https://example.gov.ma/projets/route-n1",
      latitude: 35.7595,
      longitude: -5.834,
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
