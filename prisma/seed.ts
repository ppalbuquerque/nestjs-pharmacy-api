import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const medicationName = 'Dexason';

  const medication = await prisma.medication.findFirst({
    where: { name: medicationName },
  });

  if (medication === null) {
    await prisma.medication.create({
      data: {
        chemicalComposition: 'Dexametasona',
        dosageInstructions: 'Um comprimido a cada 8 horas',
        name: medicationName,
        samplePhotoUrl: 'https://picsum.photos/200/300',
        shelfLocation: '1F',
        stockAvailability: 20,
        unitPrice: 2.0,
        usefulness:
          'Anti-inflamatório que serve para garganta, entre outras inflamações',
        boxPrice: 10.0,
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
