import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendVerificationEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: `"JualinAja" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: "Kode Verifikasi JualinAja",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaec; border-radius: 8px;">
        <h2 style="color: #333; text-align: center;">Verifikasi Email Anda</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.5;">
          Terima kasih telah mendaftar di <strong>JualinAja</strong>. Silakan gunakan kode OTP berikut untuk menyelesaikan pendaftaran Anda. Kode ini berlaku selama 10 menit.
        </p>
        <div style="background-color: #f4f4f5; padding: 16px; text-align: center; border-radius: 8px; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #18181b;">${otp}</span>
        </div>
        <p style="color: #777; font-size: 14px; text-align: center;">
          Jika Anda tidak merasa melakukan pendaftaran, abaikan email ini.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email: ", error);
    throw new Error("Gagal mengirim email verifikasi");
  }
};
