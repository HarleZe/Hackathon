"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, User, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue");
      }

      // Auto login after registration
      await signIn("credentials", {
        email,
        password,
        callbackUrl: "/",
      });
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: '450px', width: '100%' }}
        className="bg-white rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 shadow-2xl border border-gray-100"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-michelin-red rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-michelin-red/20">
            <User className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-black text-michelin-black tracking-tight uppercase mb-2">Création</h1>
          <p className="text-michelin-gray font-medium">Rejoignez l'élite gastronomique</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-michelin-gray ml-2">Nom Complet</label>
            <div className="relative">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-michelin-gray/40" size={20} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ paddingLeft: '60px' }}
                className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl pr-4 font-bold text-michelin-black focus:border-michelin-red focus:ring-1 focus:ring-michelin-red/20 transition-all outline-none"
                placeholder="Auguste Escoffier"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-michelin-gray ml-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-michelin-gray/40" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: '60px' }}
                className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl pr-4 font-bold text-michelin-black focus:border-michelin-red focus:ring-1 focus:ring-michelin-red/20 transition-all outline-none"
                placeholder="chef@michelin.fr"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-michelin-gray ml-2">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-michelin-gray/40" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: '60px' }}
                className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl pr-4 font-bold text-michelin-black focus:border-michelin-red focus:ring-1 focus:ring-michelin-red/20 transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-16 bg-michelin-red text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-michelin-red/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-70 pt-1"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Créer mon compte"}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-gray-100 text-center">
          <p className="text-michelin-gray text-sm font-medium">
            Déjà un compte ?{" "}
            <Link href="/login" className="text-michelin-red font-black hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </motion.div>

      <Link
        href="/"
        className="mt-8 flex items-center gap-2 text-michelin-gray hover:text-michelin-black transition-all font-black text-xs uppercase tracking-widest"
      >
        <ArrowLeft size={16} />
        Retour à l'accueil
      </Link>
    </div>
  );
}
