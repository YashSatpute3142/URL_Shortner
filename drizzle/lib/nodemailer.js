import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // SSL
    auth: {
        user: "elnora.hessel0@ethereal.email",
        pass: "6gVaZAbyDt6wH9jKJz",
    },
    tls: {
        rejectUnauthorized: false,
    },
});


export const sendEmail = async ({ to, subject, html }) => {
    try {
        const info = await transporter.sendMail({
            from: `"URL SHORTENER" <elnora.hessel0@ethereal.email>`,
            to,
            subject,
            html,
        });

        console.log("Email sent");
        console.log(
            "Preview URL:",
            nodemailer.getTestMessageUrl(info)
        );

    } catch (error) {
        console.log("Email Failed");
        console.log(error);
    }
};