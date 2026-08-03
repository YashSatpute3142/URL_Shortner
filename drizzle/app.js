import express from "express";
import {shortenedRoutes} from "./routes/shortener.routes.js";
import { authRoutes } from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import flash from "connect-flash";
import {verifyAuthentication} from "./middlewares/verify.auth.middleware.js"

const app = express();

const PORT = process.env.PORT || 3000;


// Middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs")

app.use(cookieParser())
//app.use(router)

app.use(session({secret:"my-secret", resave:true, saveUninitialized: false}))

app.use(flash())



app.use(verifyAuthentication)
app.use((req, res, next) => {
    
    res.locals.user = req.user;
    next();
});
app.use(authRoutes)
app.use(shortenedRoutes)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});