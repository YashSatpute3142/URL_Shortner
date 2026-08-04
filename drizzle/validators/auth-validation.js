import z from "zod";
export const loginUserScema =z.object ({
  
    email: z
    .string()
    .trim()
    .email(3, {message: "Please enter a valid email address"})
    .max(100,{message: "Email must no more than 100 characters."}),

    password: z
    .string()
    .trim()
    .min(6, {message: "Password must be at least 6 character long."})
    .max(100,{message: "Password must no more than 100 characters."})
})

export const registerUserSchema = loginUserScema.extend({
    name: z
    .string()
    .trim()
    .min(3, {message: "Name must be at least 3 character long."})
    .max(100,{message: "Name must no more than 100 characters."}),


})

