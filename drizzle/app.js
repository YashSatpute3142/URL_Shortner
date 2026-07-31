import express from "express";
import {shortenedRoutes} from "./routes/shortener.routes.js";

const app = express();

const PORT = process.env.PORT || 3000;


// Middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs")
//app.use(router)
app.use(shortenedRoutes)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});