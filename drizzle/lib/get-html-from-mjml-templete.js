import fs from "fs/promises"
import mjml2html from "mjml";
import path from "path"
import ejs from "ejs"

export const getHtmlFromMjmlTemplete = async(template, data) => {
    const mjmlTemplate = await fs.readFile(path.join(import.meta.dirname, "..", "emails",`${template}.mjml`), "utf-8")

    const filledTemplate = ejs.render(mjmlTemplate, data);

    return (await mjml2html(filledTemplate)).html;
}