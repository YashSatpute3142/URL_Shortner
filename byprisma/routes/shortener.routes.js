import { Router } from "express";
import { postUrlShortner, getShortenerPage, redirectTOShortLink } from "../controllers/postShortner.controller.js";

const router = Router();

// report page

router.get("/report", (req,res) => {
    const student = [
        {name: "Yash",Grade: "15",favSubject: "Maths"},
        {name: "Vedant",Grade: "15",favSubject: "Bio"},
        {name: "Rahul",Grade: "15",favSubject: "science"},
        {name: "Shiv",Grade: "15",favSubject: "marathi"},

    ]
    res.render("report", {student})
})

// Home Page
router.get("/", getShortenerPage);

router.post("/", postUrlShortner)
// Create Short URL


// Redirect
router.get("/:shortCode",redirectTOShortLink )
// default export
// export default router

// named export 
export const shortenedRoutes = router