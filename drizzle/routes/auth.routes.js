import {Router} from "express";

import * as authControllers from "../controllers/auth.controllers.js"
const router = Router();

router.get("/register", authControllers.getRegisterPage);
// router.get("/login", authControllers.getLoginPage);

router.route("/register")
.get(authControllers.getRegisterPage)
.post(authControllers.postRegister)

router.route("/login")
.get(authControllers.getLoginPage)
.post(authControllers.poetLogin)

export const authRoutes = router