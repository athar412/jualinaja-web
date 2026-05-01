import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ads = await prisma.ad.findMany({
    where: { authorId: session.user.id },
    include: {
      images: { orderBy: { order: "asc" }, take: 1 },
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(ads);
}
