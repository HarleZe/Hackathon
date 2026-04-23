import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json([], { status: 200 }); // Return empty if not logged in
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: (session.user as any).id },
    select: { restaurantId: true },
  });

  return NextResponse.json(favorites.map(f => f.restaurantId));
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { restaurantId } = await request.json();

    const favorite = await prisma.favorite.upsert({
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

    return NextResponse.json(favorite);
  } catch (error) {
    return NextResponse.json({ error: "Error updating favorites" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { restaurantId } = await request.json();

    await prisma.favorite.delete({
      where: {
        userId_restaurantId: {
          userId: (session.user as any).id,
          restaurantId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error removing from favorites" }, { status: 500 });
  }
}
