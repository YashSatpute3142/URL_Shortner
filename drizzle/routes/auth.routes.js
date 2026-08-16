import {Router} from "express";
import multer  from "multer";
import path from "path";
import * as authControllers from "../controllers/auth.controllers.js"
const router = Router();

router.get("/register", authControllers.getRegisterPage);
// router.get("/login", authControllers.getLoginPage);

router.route("/register")
.get(authControllers.getRegisterPage)
.post(authControllers.postRegister)

router
.route("/login")
.get(authControllers.getLoginPage)
.post(authControllers.poetLogin)

router
.route("/profile")
.get(authControllers.getProfilePage)


router
.route("/me")
.get(authControllers.getMe)

router
.route("/verify-email")
.get(authControllers.getVerifyEmailPage)

router
.route("/resend-verification-link")
.post(authControllers.resendVerificationLink)

router
.route("/verify-email-token")
.get(authControllers.verifyEmailToken)

const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads/avatar");
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}_${Math.random()}${ext}`)
    },
})

const avatarFileFilter = (req, file, cb) => {
    if(file.mimetype.startsWith("image/")) {
        cb(null, true)
    }else{
        cb(new Error("Only image file are allowed!"), false)
    }
}
const avatarupload = multer({
    storage:avatarStorage,
    fileFilter:avatarFileFilter,
    limits: {fileSize: 5 * 1024 * 1024}, //5mb
})

router
.route("/edit-profile")
.get(authControllers.getEditProfilePage)
.post(avatarupload.single("avatar"), authControllers.postChangeEditPeofile)
// .post(authControllers.postChangeEditPeofile)

router
.route("/change-password")
.get(authControllers.getChangePasswordPage)
.post(authControllers.postChangePassword)

router 
.route("/resend-password")
.get(authControllers.getResendPasswordPage)
.post(authControllers.postForgotPasswordPage)

router
.route("/resend-password/:token")
.get(authControllers.getResetPasswordTokenPassword)
.post(authControllers.postResetPasswordToken)

router
.route("/google")
.get(authControllers.getGoogleLoginPage)

router
.route("/google/callback")
.get(authControllers.getGoogleLoginCallback)

router
.route("/github")
.get(authControllers.getGithubLoginPage)

router
.route("/github/callback")
.get(authControllers.getGithubLoginCallback)

router
.route("/set-password")
.get(authControllers.getSetPasswordPage)
.post(authControllers.postSetPassword)

router
.route("/logout")
.get(authControllers.logoutUser)

export const authRoutes = router