import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET /api/user/profile
 * Récupère les données complètes de l'utilisateur connecté :
 * - Informations de base (nom, email)
 * - Liste des favoris
 * - Liste des restaurants visités
 * - Historique des réservations (trié par date décroissante)
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  console.log("Profile API Session:", session);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        favorites: {
          include: { restaurant: true }
        },
        visited: {
          include: { restaurant: true }
        },
        reservations: {
          orderBy: { date: 'desc' },
          include: { restaurant: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        image: user.image
      },
      favorites: user.favorites.map(f => f.restaurant),
      visited: user.visited.map(v => v.restaurant),
      reservations: user.reservations,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
