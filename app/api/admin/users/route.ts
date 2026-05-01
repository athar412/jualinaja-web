import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

function requireAdmin(session: { user?: { role?: string } } | null) {
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

// GET /api/admin/users
export async function GET(request: NextRequest) {
  const session = await auth();
  const denied = requireAdmin(session);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const status = searchParams.get("status") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;

  const where = {
    role: "USER" as const,
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" as const } },
        { email: { contains: q, mode: "insensitive" as const } },
      ],
    }),
    ...(status && { status: status as "ACTIVE" | "SUSPENDED" | "BANNED" }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        _count: { select: { ads: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ users, total });
}

// PATCH /api/admin/users — update user status
export async function PATCH(request: NextRequest) {
  const session = await auth();
  const denied = requireAdmin(session);
  if (denied) return denied;

  const { id, status } = await request.json();
  if (!id || !status) {
    return NextResponse.json({ error: "id and status required" }, { status: 400 });
  }

  // Prevent admin from suspending themselves
  if (id === session!.user.id) {
    return NextResponse.json({ error: "Cannot modify own account" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { status },
    select: { id: true, name: true, email: true, status: true },
  });

  return NextResponse.json(user);
}
