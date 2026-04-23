import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json([], { status: 200 });
  }

  const visited = await prisma.visited.findMany({
    where: { userId: (session.user as any).id },
    select: { restaurantId: true },
  });

  return NextResponse.json(visited.map(v => v.restaurantId));
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { restaurantId } = await request.json();

    const visited = await prisma.visited.upsert({
      where: {
        userId_restaurantId: {
          userId: (session.user as any).id,
          restaurantId,
        },
      },
      update: {},
      create: {
        userId: (session.user as any).id,
        restaurantId,
      },
    });

    return NextResponse.json(visited);
  } catch (error) {
    return NextResponse.json({ error: "Error updating visited status" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { restaurantId } = await request.json();

    await prisma.visited.delete({
      where: {
        userId_restaurantId: {
          userId: (session.user as any).id,
          restaurantId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error removing from visited" }, { status: 500 });
  }
}
