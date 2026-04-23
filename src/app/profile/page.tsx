"use client";

/**
 * Page de Profil Utilisateur (Espace Gastronomique).
 * Affiche les statistiques, les favoris, les restaurants visités et les réservations.
 * Sécurisée via NextAuth (redirection vers /login si non connecté).
 */
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Heart, 
  CheckCircle, 
  Calendar, 
  Star, 
  MapPin, 
  User as UserIcon, 
  LogOut,
  ChevronRight,
  Clock,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { Restaurant } from "@/data/restaurants";
import { cn } from "@/lib/utils";

interface Reservation {
  id: string;
  restaurant: Restaurant;
  date: string;
  status: string;
}

interface ProfileData {
  user: { name: string; email: string };
  favorites: Restaurant[];
  visited: Restaurant[];
  reservations: Reservation[];
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"reservations" | "favorites" | "visited">("reservations");

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetch("/api/user/profile")
        .then(async res => {
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || "Erreur de chargement");
          return json;
        })
        .then(setData)
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-serif text-michelin-black mb-4">Mince !</h2>
        <p className="text-michelin-gray mb-8">{error}</p>
        <Link href="/" className="text-michelin-red font-black uppercase tracking-widest text-xs">Retour à l'accueil</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-michelin-red border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const futureReservations = data?.reservations?.filter(r => new Date(r.date) >= new Date()) || [];
  const pastReservations = data?.reservations?.filter(r => new Date(r.date) < new Date()) || [];

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      {/* Header Premium */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-michelin-gray hover:text-michelin-black transition-all">
            <ArrowLeft size={20} />
            <span className="font-black text-[10px] uppercase tracking-widest">Retour</span>
          </Link>
          <h1 className="text-xl font-serif text-michelin-black italic">Mon Espace Gastronomique</h1>
          <div className="w-10 h-10 rounded-full bg-michelin-red/10 flex items-center justify-center text-michelin-red">
            <UserIcon size={20} />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        {/* User Info Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-black/5 border border-gray-100 flex flex-col md:flex-row items-center gap-8"
        >
          <div className="w-24 h-24 rounded-3xl bg-michelin-red flex items-center justify-center text-white shadow-xl shadow-michelin-red/20">
            <UserIcon size={40} />
          </div>
          <div className="flex-1 text-center md:text-left space-y-1">
            <h2 className="text-3xl font-black text-michelin-black tracking-tight">{data?.user.name}</h2>
            <p className="text-michelin-gray font-medium">{data?.user.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
              <Badge icon={Heart} label={`${data?.favorites.length} Favoris`} />
              <Badge icon={CheckCircle} label={`${data?.visited.length} Visités`} />
              <Badge icon={Calendar} label={`${data?.reservations.length} Réservations`} />
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 p-1.5 bg-white rounded-2xl shadow-sm border border-gray-100 w-fit mx-auto md:mx-0">
          <TabButton 
            active={activeTab === "reservations"} 
            onClick={() => setActiveTab("reservations")}
            label="Réservations"
            icon={Calendar}
          />
          <TabButton 
            active={activeTab === "favorites"} 
            onClick={() => setActiveTab("favorites")}
            label="Favoris"
            icon={Heart}
          />
          <TabButton 
            active={activeTab === "visited"} 
            onClick={() => setActiveTab("visited")}
            label="Visités"
            icon={CheckCircle}
          />
        </div>

        {/* Content Section */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-6"
          >
            {activeTab === "reservations" && (
              <div className="space-y-10">
                {futureReservations.length > 0 && (
                  <section className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-michelin-red ml-4">À Venir</h3>
                    <div className="grid gap-4">
                      {futureReservations.map(res => (
                        <ReservationCard key={res.id} reservation={res} />
                      ))}
                    </div>
                  </section>
                )}
                
                <section className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-michelin-gray ml-4">Historique des Réservations</h3>
                  {pastReservations.length > 0 ? (
                    <div className="grid gap-4">
                      {pastReservations.map(res => (
                        <ReservationCard key={res.id} reservation={res} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState message="Aucune réservation passée" />
                  )}
                </section>
              </div>
            )}

            {activeTab === "favorites" && (
              <div className="grid md:grid-cols-2 gap-6">
                {data?.favorites.length ? (
                  data.favorites.map(restaurant => (
                    <MiniRestaurantCard key={restaurant.id} restaurant={restaurant} />
                  ))
                ) : (
                  <div className="md:col-span-2"><EmptyState message="Aucun favori pour le moment" /></div>
                )}
              </div>
            )}

            {activeTab === "visited" && (
              <div className="grid md:grid-cols-2 gap-6">
                {data?.visited.length ? (
                  data.visited.map(restaurant => (
                    <MiniRestaurantCard key={restaurant.id} restaurant={restaurant} />
                  ))
                ) : (
                  <div className="md:col-span-2"><EmptyState message="Vous n'avez pas encore marqué de restaurants comme visités" /></div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function Badge({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-black uppercase tracking-wider text-michelin-black">
      <Icon size={12} className="text-michelin-red" />
      {label}
    </div>
  );
}

function TabButton({ active, onClick, label, icon: Icon }: { active: boolean, onClick: () => void, label: string, icon: any }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all",
        active 
          ? "bg-michelin-red text-white shadow-lg shadow-michelin-red/20" 
          : "text-michelin-gray hover:text-michelin-black hover:bg-gray-50"
      )}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

function ReservationCard({ reservation }: { reservation: Reservation }) {
  const date = new Date(reservation.date);
  return (
    <div className="bg-white rounded-[1.5rem] p-3.5 md:p-5 border border-gray-100 flex items-center gap-4 md:gap-6 shadow-sm hover:shadow-md transition-all group overflow-hidden">
      <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl overflow-hidden shrink-0">
        <img src={reservation.restaurant.image} className="w-full h-full object-cover" alt="" />
      </div>
      <div className="flex-1 min-w-0 space-y-0.5 md:space-y-1">
        <h4 className="font-serif text-sm md:text-lg text-michelin-black truncate leading-tight">{reservation.restaurant.name}</h4>
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-[8px] md:text-[10px] font-bold text-michelin-gray uppercase tracking-widest">
          <div className="flex items-center gap-1 text-michelin-red whitespace-nowrap">
            <Clock size={10} />
            {date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
          </div>
          <div className="flex items-center gap-1 truncate">
            <MapPin size={10} />
            {reservation.restaurant.city}
          </div>
        </div>
      </div>
      <div className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl bg-gray-50 border border-gray-100 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-michelin-black group-hover:bg-michelin-red group-hover:text-white group-hover:border-michelin-red transition-all cursor-pointer shrink-0">
        Détails
      </div>
    </div>
  );
}

function MiniRestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <div className="bg-white rounded-[1.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group">
      <div className="h-32 relative">
        <img src={restaurant.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
          <Star size={10} className="fill-michelin-red text-michelin-red" />
          <span className="text-[9px] font-black text-michelin-black">{restaurant.stars}</span>
        </div>
      </div>
      <div className="p-5 space-y-1">
        <h4 className="font-serif text-lg text-michelin-black">{restaurant.name}</h4>
        <p className="text-[9px] font-bold text-michelin-gray uppercase tracking-[0.2em]">{restaurant.category} • {restaurant.location?.city || restaurant.city}</p>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-300">
        <Sparkles size={30} />
      </div>
      <p className="text-michelin-gray font-medium">{message}</p>
    </div>
  );
}
