import 'dotenv/config';
import { sendVerificationEmail } from './lib/mail';

async function main() {
  try {
    await sendVerificationEmail('atharadzradara@gmail.com', '123456');
    console.log("Email sent successfully!");
  } catch (err: any) {
    console.error("Email send failed:", err.message);
  }
}

main();
