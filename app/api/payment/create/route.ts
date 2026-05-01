import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { adId } = await request.json();
    if (!adId) {
      return NextResponse.json({ error: "adId is required" }, { status: 400 });
    }

    const ad = await prisma.ad.findUnique({
      where: { id: adId },
      include: { author: true },
    });

    if (!ad) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    if (ad.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (ad.status !== "AWAITING_PAYMENT") {
      return NextResponse.json({ error: "Ad is not awaiting payment" }, { status: 400 });
    }

    const merchantCode = process.env.DUITKU_MERCHANT_CODE!;
    const apiKey = process.env.DUITKU_API_KEY!;
    const paymentAmount = 10000;
    const merchantOrderId = `AD-${ad.id}-${Date.now()}`;
    const productDetails = `Payment for Ad: ${ad.title}`;
    const email = session.user.email!;
    const phoneNumber = ad.contactPhone;
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/callback`;
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/my-ads`;
    const expiryPeriod = 1440; // 24 hours

    // signature = md5(merchantCode + merchantOrderId + paymentAmount + apiKey)
    const signature = crypto
      .createHash("md5")
      .update(merchantCode + merchantOrderId + paymentAmount + apiKey)
      .digest("hex");

    const payload = {
      merchantCode,
      paymentAmount,
      paymentMethod: "SP", // QRIS ShopeePay / Generic QRIS in Sandbox
      merchantOrderId,
      productDetails,
      email,
      phoneNumber,
      additionalParam: ad.id,
      callbackUrl,
      returnUrl,
      signature,
      expiryPeriod,
    };

    console.log("Duitku Payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(
      process.env.DUITKU_ENV === "sandbox"
        ? "https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry"
        : "https://passport.duitku.com/webapi/api/merchant/v2/inquiry",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    console.log("Duitku Response:", data);

    if (data.paymentUrl) {
      // Update ad with merchantOrderId
      await prisma.ad.update({
        where: { id: ad.id },
        data: { merchantOrderId },
      });
      return NextResponse.json({ paymentUrl: data.paymentUrl });
    } else {
      console.error("Duitku Error:", data);
      return NextResponse.json({ error: data.message || "Failed to create payment" }, { status: 500 });
    }
  } catch (error) {
    console.error("Payment create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
