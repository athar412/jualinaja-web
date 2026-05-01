import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

// GET /api/ads/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const ad = await prisma.ad.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: "asc" } },
      category: true,
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          phone: true,
          createdAt: true,
        },
      },
      _count: { select: { wishlists: true } },
    },
  });

  if (!ad) {
    return NextResponse.json({ error: "Ad not found" }, { status: 404 });
  }

  // Increment view count (fire-and-forget)
  prisma.ad.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  return NextResponse.json(ad);
}

const updateSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().min(10).optional(),
  price: z.number().min(0).optional(),
  condition: z.enum(["NEW", "USED"]).optional(),
  location: z.string().min(2).optional(),
  contactPhone: z.string().min(8).optional(),
  categoryId: z.string().optional(),
  status: z.enum(["SOLD"]).optional(), // user can only mark as sold
});

// PATCH /api/ads/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const ad = await prisma.ad.findUnique({ where: { id } });
  if (!ad) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (ad.authorId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const validated = updateSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: validated.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.ad.update({
    where: { id },
    data: validated.data,
  });

  return NextResponse.json(updated);
}

// DELETE /api/ads/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const ad = await prisma.ad.findUnique({ where: { id } });
  if (!ad) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (ad.authorId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.ad.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
