import z, { positive } from "zod"

export const shortenerShema = z.object({
    url: z
    .string({required_error:"URL is required."})
    .trim()
    .url({message:"Please enter a valid URL."})
    .max(1024,{message:"URL cannot be longer than 1024 characters."}),

    shortCode: z
    .string({required_error:"Short code is required."})
    .trim()
    .min(2, {message: "Short code must be at least 2 character long."})
    .max(10, {message: "Short code cannot be longer than 10 character." })

}) 

export const shoertenerSearchParamsSchema = z.object({
    page: z.coerce
    .number()
    .int()
    .positive()
    .min(1)
    .optional()
    .default(1)
    .catch(1)
})