import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const verifySchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = verifySchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: "Input tidak valid" }, { status: 400 });
    }

    const { email, otp } = validated.data;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: "Email sudah terverifikasi" }, { status: 400 });
    }

    if (!user.otp || user.otp !== otp) {
      return NextResponse.json({ error: "OTP salah" }, { status: 400 });
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return NextResponse.json({ error: "OTP sudah kadaluarsa" }, { status: 400 });
    }

    // Success, verify email
    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
        otp: null,
        otpExpiry: null,
      },
    });

    return NextResponse.json({ message: "Email berhasil diverifikasi" }, { status: 200 });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
