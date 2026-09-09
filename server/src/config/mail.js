import nodemailer from "nodemailer";

const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpPassword = (process.env.SMTP_PASS || "").replace(/\s+/g, "");
const resendApiKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.RESEND_FROM || process.env.SMTP_FROM || "onboarding@resend.dev";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: smtpPort,
    family: 4,
    secure: smtpPort === 465,
    requireTLS: smtpPort === 587,
    auth: {
        user: process.env.SMTP_USER || "",
        pass: smtpPassword
    }
});

export const verifyMailTransport = async () => {
    if (resendApiKey) {
        console.log("Resend email provider configured");
        return true;
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn("SMTP is not configured. OTPs will be printed to the server console.");
        return false;
    }

    await transporter.verify();
    console.log(`SMTP connection verified for ${process.env.SMTP_USER}`);
    return true;
};

export const sendOtpEmail = async ({ email, otp }) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #f8fafc;">
            <h2 style="margin-bottom: 12px; color: #0f172a;">DocuMind AI</h2>
            <p style="color: #475569;">Your verification code is:</p>
            <div style="padding: 18px 20px; border-radius: 10px; background: #111827; color: white; font-size: 32px; letter-spacing: 8px; text-align: center; font-weight: 700; margin: 16px 0;">${otp}</div>
            <p style="color: #475569; margin: 0;">This code expires in 5 minutes.</p>
        </div>
    `;

    if (resendApiKey) {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${resendApiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: resendFrom,
                to: [email],
                subject: "Your DocuMind OTP",
                html
            })
        });

        if (!response.ok) {
            const details = await response.text();
            throw new Error(`Resend email failed (${response.status}): ${details}`);
        }

        return { provider: "resend" };
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log(`OTP for ${email}: ${otp}`);
        return { preview: true };
    }

    await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: "Your DocuMind OTP",
        html
    });
};

export default transporter;
