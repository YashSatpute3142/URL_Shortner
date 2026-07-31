import crypto from "crypto";
// import { loadLinks, saveLinks } from "../models/shortner.model.js";
import { getAllShortLinks, getShortLinkByShortCode, insertShortLink } from "../services/shortener.services.js";


export const getShortenerPage = async (req, res) => {
    try {
        //const file = await readFile(path.join("views", "index.html"), "utf-8");
        // const links = await loadLinks();
        const links = await getAllShortLinks()

        let isLoggedIn = req.headers.cookie;
        isLoggedIn = Boolean(isLoggedIn?.split("=")[1])
        console.log("~ getShortenerPage ~ isLoggedIn:", isLoggedIn);
        

        return res.render("index", {links, host: req.headers.host, isLoggedIn })

        
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

        // const links = await loadLinks();
       

        const finalShortCode =
            shortCode?.trim() || crypto.randomBytes(4).toString("hex");

        const links = await getShortLinkByShortCode(finalShortCode)    

        if (links) {
            return res
                .status(400)
                .send("Short code already exists. Choose another.");
        }

        //links[finalShortCode] = url;

        // await saveLinks(links);
        await insertShortLink({url,finalShortCode})

        res.redirect("/");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error!");
    }

}

export const redirectTOShortLink = async (req, res) => {
    try {
        const { shortCode } = req.params;

        const link = await getShortLinkByShortCode(shortCode);

        if (!link) {
            return res.status(404).send("404 - Short URL Not Found");
        }

        res.redirect(link.url);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error....!");
    }
}