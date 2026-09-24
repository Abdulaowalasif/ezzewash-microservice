import nodemailer from "nodemailer";

const mailer = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
    },
});

export async function sendEmail(
    to: string,
    subject: string,
    text: string
): Promise<void> {
    const from = process.env.MAIL_FROM;

    if (!from) {
        throw new Error("MAIL_FROM is not defined");
    }

    await mailer.sendMail({
        from,
        to,
        subject,
        text,
    });
}