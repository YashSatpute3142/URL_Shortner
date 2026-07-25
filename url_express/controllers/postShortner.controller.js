import crypto from "crypto";
import { loadLinks, saveLinks } from "../models/shortner.model.js";


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

export const postUrlShortner =  async(req, res) => {
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

}

export const redirectTOShortLink = async (req, res) => {
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
}