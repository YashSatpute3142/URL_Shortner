import crypto from "crypto";
import { loadLinks, saveLinks,getLinkByShortCode } from "../models/shortner.model.js";


export const getShortenerPage = async (req, res) => {
    try {
        //const file = await readFile(path.join("views", "index.html"), "utf-8");
        const links = await loadLinks();

        return res.render("index", {links, host: req.headers.host })

        
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error!");
    }
}

export const postUrlShortner = async (req, res) => {
    try {
        const { url, shortCode } = req.body;

        if (!url) {
            return res.status(400).send("URL is required");
        }

        const finalShortCode =
            shortCode?.trim() || crypto.randomBytes(4).toString("hex");

        const existingLink = await getLinkByShortCode(finalShortCode);

        if (existingLink) {
            return res.status(400).send("Short code already exists.");
        }

        await saveLinks({
            url,
            shortCode: finalShortCode,
        });

        res.redirect("/");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error!");
    }
};

export const redirectTOShortLink = async (req, res) => {
    try {
        const shortCode = req.params.shortCode;

        const link = await getLinkByShortCode(shortCode);

        if (!link) {
            return res.status(404).send("404 - Short URL Not Found");
        }

        res.redirect(link.url);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error!");
    }
};