import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

const prisma = new PrismaClient({
  adapter,
});

export const loadLinks = async () => {
    
    // const [rows] = await db.execute('Select * from shortLink');
    // return rows

    const allShortLinks = await prisma.shortLink.findMany();
    return allShortLinks

}

export const getLinkByShortCode = async (shortCode) => {
//    return await shortenerCollection.findOne({ shortCode });
//    const [rows] =  await db.execute(`select * from short_links where short_code = ?`,[shortCode]);
   
   const shortLink = await prisma.shortLink.findUnique({
    where: {shortCode :shortCode}
   })
   return shortLink
}

export const saveLinks = async ({ url, shortCode }) => {
    // const [result] = await db.execute(
    //     "INSERT INTO short_links(short_code, url) VALUES (?, ?)",
    //     [shortCode, url]
    // );

    // return result;

    const newShortLink = await prisma.shortLink.create({
        data: {shortCode, url}
    })
    return newShortLink;
};