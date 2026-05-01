import 'dotenv/config';
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function main() {
  console.log("Using Email:", process.env.SMTP_EMAIL);
  console.log("Using Password:", process.env.SMTP_PASSWORD ? "***" : "MISSING");
  
  try {
    await transporter.verify();
    console.log("SMTP Connection successful!");
  } catch (err: any) {
    console.error("SMTP Connection failed:", err.message);
  }
}

main();
