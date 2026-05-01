import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/mail";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = registerSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: "Input tidak valid" }, { status: 400 });
    }

    const { email, password } = validated.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      if (existingUser.emailVerified) {
        return NextResponse.json({ error: "Email sudah terdaftar dan terverifikasi" }, { status: 409 });
      }
      // If user exists but not verified, we can resend OTP. We will update the user instead of failing.
    }

    const hashed = await bcrypt.hash(password, 12);
    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    if (existingUser) {
      await prisma.user.update({
        where: { email },
        data: { password: hashed, otp, otpExpiry },
      });
    } else {
      await prisma.user.create({
        data: {
          email,
          password: hashed,
          otp,
          otpExpiry,
          // Extract name from email as fallback
          name: email.split("@")[0],
        },
      });
    }

    // Send email
    await sendVerificationEmail(email, otp);

    return NextResponse.json({ message: "OTP sent to email" }, { status: 200 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
