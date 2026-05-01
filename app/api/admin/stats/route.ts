import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET /api/admin/stats
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [totalAds, liveAds, pendingAds, totalUsers] = await Promise.all([
    prisma.ad.count(),
    prisma.ad.count({ where: { status: "LIVE" } }),
    prisma.ad.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.user.count({ where: { role: "USER" } }),
  ]);

  return NextResponse.json({ totalAds, liveAds, pendingAds, totalUsers });
}
