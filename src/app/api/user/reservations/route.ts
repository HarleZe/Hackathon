import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { restaurantId, date } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const reservation = await prisma.reservation.create({
      data: {
        userId: user.id,
        restaurantId: restaurantId,
        date: date ? new Date(date) : new Date(),
        status: "confirmed"
      },
      include: {
        restaurant: true
      }
    });

    return NextResponse.json(reservation);
  } catch (error) {
    console.error("Error creating reservation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
