import {reset, seed} from "drizzle-seed";
import * as schemas from "./schema.js";
import {db} from "../config/db.js";

// await resizeTo(db, schemas);
// await sendEmail(
//     db, 
//     {
//         usersTable:schemas.usersTable,
//         shortLinksTable:schemas.shortLinksTable
//     },
//     {count:1}

// ).refine((f) => {
//     usersTable:{
//         with: {
//             shortLinksTable:100,
//         }
//     }
// })

const USER_ID = 7;
await reset(db, {shortLinksTable: schemas.shortLinksTable});
await seed(
    db,
    {shortLinksTable: schemas.shortLinksTable},
    {count:100}
).refine((f) => ({
    shortLinksTable: {
        columns: {
            userId: f.default({defaultValue: USER_ID}),
            url: f.default({defaultValue: "https://www.youtube.com/watch?v=5BOvC328DHY"})
        }
    }
}))
process.exit(0);