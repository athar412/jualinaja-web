import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const merchantCode = formData.get("merchantCode")?.toString();
    const amount = formData.get("amount")?.toString();
    const merchantOrderId = formData.get("merchantOrderId")?.toString();
    const productDetail = formData.get("productDetail")?.toString();
    const additionalParam = formData.get("additionalParam")?.toString();
    const paymentCode = formData.get("paymentCode")?.toString();
    const resultCode = formData.get("resultCode")?.toString();
    const merchantUserId = formData.get("merchantUserId")?.toString();
    const reference = formData.get("reference")?.toString();
    const signature = formData.get("signature")?.toString();

    if (!merchantCode || !amount || !merchantOrderId || !signature) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const apiKey = process.env.DUITKU_API_KEY!;
    
    // signature = md5(merchantCode + amount + merchantOrderId + apiKey)
    const calcSignature = crypto
      .createHash("md5")
      .update(merchantCode + amount + merchantOrderId + apiKey)
      .digest("hex");

    if (signature !== calcSignature) {
      console.error("Signature mismatch", { signature, calcSignature });
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    if (resultCode === "00") {
      const adId = additionalParam;
      if (adId) {
        await prisma.ad.update({
          where: { id: adId },
          data: {
            status: "LIVE",
            paymentStatus: "PAID",
          },
        });
        console.log(`Ad ${adId} is now LIVE after payment.`);
      }
    } else {
      console.log(`Payment failed for Order ID: ${merchantOrderId}, Result Code: ${resultCode}`);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
