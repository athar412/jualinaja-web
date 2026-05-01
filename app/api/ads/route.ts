import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const adSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  price: z.number().min(0),
  condition: z.enum(["NEW", "USED"]),
  location: z.string().min(2),
  contactPhone: z.string().min(8),
  categoryId: z.string().cuid(),
  imageUrls: z.array(z.string()).min(1).max(8),
});

// GET /api/ads — list approved ads with filters
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const condition = searchParams.get("condition") || "";
  const location = searchParams.get("location") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const skip = (page - 1) * limit;

  const where = {
    status: "LIVE" as const,
    ...(query && {
      OR: [
        { title: { contains: query, mode: "insensitive" as const } },
        { description: { contains: query, mode: "insensitive" as const } },
      ],
    }),
    ...(category && { category: { slug: category } }),
    ...(condition && { condition: condition as "NEW" | "USED" }),
    ...(location && { location: { contains: location, mode: "insensitive" as const } }),
  };

  const [ads, total] = await Promise.all([
    prisma.ad.findMany({
      where,
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        category: true,
        author: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.ad.count({ where }),
  ]);

  return NextResponse.json({
    ads,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

// POST /api/ads — create a new ad
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validated = adSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { imageUrls, ...adData } = validated.data;

    const ad = await prisma.ad.create({
      data: {
        ...adData,
        price: adData.price,
        authorId: session.user.id,
        images: {
          create: imageUrls.map((url, index) => ({ url, order: index })),
        },
      },
      include: {
        images: true,
        category: true,
        author: { select: { id: true, name: true } },
      },
    });


    return NextResponse.json(ad, { status: 201 });
  } catch (error) {
    console.error("Create ad error:", error);
    return NextResponse.json({ error: "Failed to create ad" }, { status: 500 });
  }
}

