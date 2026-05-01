import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET /api/wishlist — list user's wishlist
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const wishlist = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    include: {
      ad: {
        include: {
          images: { orderBy: { order: "asc" }, take: 1 },
          category: true,
          author: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(wishlist);
}

// POST /api/wishlist — toggle wishlist (add/remove)
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { adId } = await request.json();
  if (!adId) {
    return NextResponse.json({ error: "adId required" }, { status: 400 });
  }

  const existing = await prisma.wishlist.findUnique({
    where: { userId_adId: { userId: session.user.id, adId } },
  });

  if (existing) {
    await prisma.wishlist.delete({ where: { id: existing.id } });
    return NextResponse.json({ action: "removed" });
  } else {
    await prisma.wishlist.create({
      data: { userId: session.user.id, adId },
    });
    return NextResponse.json({ action: "added" });
  }
}
