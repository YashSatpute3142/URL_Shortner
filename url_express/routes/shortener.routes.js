import { readFile, writeFile } from "fs/promises";
import crypto from "crypto";
import path from "path";
import { Router } from "express";

const router = Router();

const DATA_FILE = path.join("data", "links.json");

// Load links from file
const loadLinks = async () => {
    try {
        const data = await readFile(DATA_FILE, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        if (error.code === "ENOENT") {
            await writeFile(DATA_FILE, JSON.stringify({}, null, 2));
            return {};
        }
        throw error;
    }
};

// Save links
const saveLinks = async (links) => {
    await writeFile(DATA_FILE, JSON.stringify(links, null, 2));
};

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
router.get("/", async (req, res) => {
    try {
        const file = await readFile(path.join("views", "index.html"), "utf-8");

        const links = await loadLinks();

        const list = Object.entries(links)
            .map(
                ([shortCode, url]) =>
                    `<li>
                        <a href="/${shortCode}" target="_blank">
                            ${req.headers.host}/${shortCode}
                        </a>
                        → ${url}
                    </li>`
            )
            .join("");

        const content = file.replace("{{shortened_urls}}", list);

        res.send(content);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error!");
    }
});

// Create Short URL
router.post("/", async (req, res) => {
    try {
        const { url, shortCode } = req.body;

        if (!url) {
            return res.status(400).send("URL is required");
        }

        const links = await loadLinks();

        const finalShortCode =
            shortCode?.trim() || crypto.randomBytes(4).toString("hex");

        if (links[finalShortCode]) {
            return res
                .status(400)
                .send("Short code already exists. Choose another.");
        }

        links[finalShortCode] = url;

        await saveLinks(links);

        res.redirect("/");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error!");
    }
});

// Redirect
router.get("/:shortCode", async (req, res) => {
    try {
        const links = await loadLinks();

        const url = links[req.params.shortCode];

        if (!url) {
            return res.status(404).send("404 - Short URL Not Found");
        }

        res.redirect(url);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error....!");
    }
})
// default export
// export default router

// named export 
export const shortenedRoutes = router