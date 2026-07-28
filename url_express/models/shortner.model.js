// import { readFile, writeFile } from "fs/promises";
// import path from "path";

// // const DATA_FILE = path.join("data", "links.json");

// // Load links from file
// export const loadLinks = async () => {
//     try {
//         const data = await readFile(DATA_FILE, "utf-8");
//         return JSON.parse(data);
//     } catch (error) {
//         if (error.code === "ENOENT") {
//             await writeFile(DATA_FILE, JSON.stringify({}, null, 2));
//             return {};
//         }
//         throw error;
//     }
// };

// // Save links
// export const saveLinks = async (links) => {
//     await writeFile(DATA_FILE, JSON.stringify(links, null, 2));
// };


import { env } from "../config/env.js";
import {db} from "../config/db-client.js"

// const db = dbClient.db(env.MONGODB_DATABASE_NAME);
// const shortenerCollection = db.collection("shorteners") 

export const loadLinks = async () => {
    // return shortenerCollection.find().toArray();
    const [rows] = await db.execute('Select * from short_links');
    return rows

}

export const saveLinks = async ({ url, shortCode }) => {
    const [result] = await db.execute(
        "INSERT INTO short_links(short_code, url) VALUES (?, ?)",
        [shortCode, url]
    );

    return result;
};

export const getLinkByShortCode = async (shortCode) => {
//    return await shortenerCollection.findOne({ shortCode });
   const [rows] =  await db.execute(`select * from short_links where short_code = ?`,[shortCode]);
   if(rows.length > 0){
    return rows[0]
   }else{
    return null;
   }
}