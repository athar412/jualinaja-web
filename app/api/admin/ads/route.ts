import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

function requireAdmin(session: { user?: { role?: string } } | null) {
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

// GET /api/admin/ads — list ads for moderation
export async function GET(request: NextRequest) {
  const session = await auth();
  const denied = requireAdmin(session);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "PENDING_REVIEW";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const [ads, total] = await Promise.all([
    prisma.ad.findMany({
      where: { status: status as any },
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        category: true,
        author: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.ad.count({ where: { status: status as any } }),
  ]);

  return NextResponse.json({ ads, total });
}

// PATCH /api/admin/ads — approve or reject
export async function PATCH(request: NextRequest) {
  const session = await auth();
  const denied = requireAdmin(session);
  if (denied) return denied;

  const { id, action, rejectReason } = await request.json();
  if (!id || !action) {
    return NextResponse.json({ error: "id and action required" }, { status: 400 });
  }

  const status = action === "approve" ? "AWAITING_PAYMENT" : "REJECTED";

  const ad = await prisma.ad.update({
    where: { id },
    data: {
      status,
      rejectReason: action === "reject" ? rejectReason : null,
    },
  });

  return NextResponse.json(ad);
}
