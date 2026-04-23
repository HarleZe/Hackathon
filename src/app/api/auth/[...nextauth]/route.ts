import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * API Route pour NextAuth.js
 * Gère toutes les requêtes d'authentification (GET pour la session, POST pour login/register/callback)
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
