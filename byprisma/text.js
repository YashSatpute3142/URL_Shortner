import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

try {
  console.log("Connecting...");
  const result = await prisma.shortLink.findMany();
  console.log(result);
} catch (err) {
  console.error(err);
} finally {
  await prisma.$disconnect();
}