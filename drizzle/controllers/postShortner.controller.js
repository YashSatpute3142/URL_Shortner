import crypto from "crypto";
// import { loadLinks, saveLinks } from "../models/shortner.model.js";
import { deleteShortCodeById, findShortLinkById, getAllShortLinks, getShortLinkByShortCode, insertShortLink, updateShortCode } from "../services/shortener.services.js";
import { shortenerShema } from "../validators/shortener-validator.js";
import z from "zod";


export const getShortenerPage = async (req, res) => {
    try {
        //const file = await readFile(path.join("views", "index.html"), "utf-8");
        // const links = await loadLinks();
        if(!req.user) return res.redirect("/login");
        const links = await getAllShortLinks(req.user.id);

        // let isLoggedIn = req.headers.cookie;
        // isLoggedIn = Boolean(isLoggedIn?.split("=")[1])
        // console.log("~ getShortenerPage ~ isLoggedIn:", isLoggedIn);
        // let isLoggedIn = req.cookies.isLoggedIn;
        

        return res.render("index", {links, host: req.headers.host,errors: req.flash('errors') })

        
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error!");
    }
}

export const postUrlShortner = async (req, res) => {
    try {

        if (!req.user) {
            return res.redirect("/login");
        }

        const result = shortenerShema.safeParse(req.body);

        if (!result.success) {
            result.error.issues.forEach((issue) => {
                req.flash("errors", issue.message);
            });

            return res.redirect("/");
        }

        // Get validated data
        const { url, shortCode } = result.data;

        const finalShortCode =
            shortCode?.trim() || crypto.randomBytes(4).toString("hex");

        const link = await getShortLinkByShortCode(finalShortCode);

        if (link) {
            req.flash(
                "errors",
                "URL with that short code already exists. Please choose another."
            );

            return res.redirect("/");
        }

        await insertShortLink({
            url,
            finalShortCode,
            userId: req.user.id,
        });

        return res.redirect("/");

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error!");
    }
};

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

export const getShortenerEditPage = async(req,res) => {
    if(!req.user) return res.redirect("/login")
    const {data: id, error} = z.coerce.number().int().safeParse(req.params.id); 
    if(error) return res.redirect("/404")
    try {
       const shortLink = await findShortLinkById(id)
       if(!shortLink) return res.redirect("/404")

        res.render("edit-shortLink", {
            id: shortLink.id,
            url:shortLink.url,
            shortCode:shortLink.shortCode,
            errors: req.flash("errors"),
        })

        
    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal server error.. :(")
        
    }

}

export const postShortenerEditPage = async (req, res) => {
  if (!req.user) return res.redirect("/login");
  // const id = req.params;
  const { data: id, error } = z.coerce.number().int().safeParse(req.params.id);
  if (error) return res.redirect("/404");

  try {
    const { url, shortCode } = req.body;
    const newUpdateShortCode = await updateShortCode({ id, url, shortCode });
    if (!newUpdateShortCode) return res.redirect("/404");

    res.redirect("/");
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      req.flash("errors", "Shortcode already exists, please choose another");
      return res.redirect(`/edit/${id}`);
    }

    console.error(err);
    return res.status(500).send("Internal server error");
  }
}

export const deleteShoertCode = async(req,res) => {
    
    try {
        const { data: id, error } = z.coerce.number().int().safeParse(req.params.id);
        if (error) return res.redirect("/404");

        await deleteShortCodeById(id);
        return res.redirect("/")
        
    } catch (error) {
        console.error(err);
        return res.status(500).send("Internal server error");
        
    }
}