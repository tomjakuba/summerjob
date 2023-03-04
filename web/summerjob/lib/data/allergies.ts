import prisma from "lib/prisma/connection";

export async function getAllergies() {
  const allergies = await prisma.allergy.findMany({});
  return allergies;
}
