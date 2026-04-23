"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, MapPin, Phone, Globe, Clock, Sparkles, Check, 
  Users, Calendar, ChevronRight, ArrowLeft, ShieldCheck,
  Wifi, Car, Sun, Waves, Coffee, Utensils, RotateCcw
} from "lucide-react";
import { Restaurant } from "@/data/restaurants";

interface RestaurantDetailsProps {
  restaurant: Restaurant;
  distance?: string;
  onClose: () => void;
  onConfirmBooking?: (restaurant: Restaurant, details: any) => void;
}

type DetailsView = "details" | "booking" | "confirmation";

const FacilityIcon = ({ name }: { name: string }) => {
  const n = name.toLowerCase();
  if (n.includes("wifi")) return <Wifi size={18} />;
  if (n.includes("parking") || n.includes("voiturier")) return <Car size={18} />;
  if (n.includes("terrasse") || n.includes("jardin")) return <Sun size={18} />;
  if (n.includes("vue") || n.includes("bord")) return <Waves size={18} />;
  if (n.includes("bar") || n.includes("salon")) return <Coffee size={18} />;
  return <Utensils size={18} />;
};

/**
 * Composant de vue détaillée et de tunnel de réservation.
 * Présente l'intégralité des informations d'un établissement et gère le flux de réservation
 * en trois étapes : Détails -> Tunnel de réservation -> Confirmation.
 * 
 * @param {Restaurant} restaurant L'établissement sélectionné
 * @param {string} distance Distance formatée
 * @param {Function} onClose Callback de fermeture
 * @param {Function} onConfirmBooking Callback déclenché après succès de réservation
 */
export default function RestaurantDetails({ 
  restaurant, 
  distance,
  onClose, 
  onConfirmBooking 
}: RestaurantDetailsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<DetailsView>("details");
  const [showManualGuests, setShowManualGuests] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: "20:00",
    guests: 2,
    name: "",
    email: "",
    phone: "",
    requests: ""
  });

  // Remonter en haut de la modal lors du changement de vue
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [view]);

  /**
   * Finalise la réservation et notifie le composant parent.
   */
  const handleFinalConfirm = () => {
    if (onConfirmBooking) {
      onConfirmBooking(restaurant, bookingData);
    } else {
      // Fallback si aucun callback n'est fourni
      onClose();
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await fetch("/api/user/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          date: bookingData.date,
        }),
      });
    } catch (err) {
      console.error("Failed to save reservation:", err);
    }

    setView("confirmation");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-white flex flex-col md:flex-row overflow-hidden"
    >
      {/* 1. PROGRESS BAR (For Booking) */}
      {view !== "details" && (
        <div className="absolute top-0 left-0 w-full h-1 z-[110] bg-gray-50">
          <motion.div 
            className="h-full bg-michelin-red"
            initial={{ width: "0%" }}
            animate={{ width: view === "booking" ? "50%" : "100%" }}
          />
        </div>
      )}

      {/* LEFT: Visual Hero / Gallery */}
      <div className="relative w-full md:w-5/12 h-[35vh] md:h-full bg-michelin-black">
        <motion.img 
          key={restaurant.id}
          initial={{ scale: 1.1, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          src={restaurant.image} 
          alt={restaurant.name}
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-michelin-black/80 via-transparent to-transparent" />
        
        <button 
          onClick={() => {
            if (view === "details") onClose();
            else setView("details");
          }}
          className="absolute top-6 left-6 p-4 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white hover:text-michelin-red transition-all shadow-2xl z-50 border border-white/20"
        >
          {view === "details" ? <X size={24} /> : <ArrowLeft size={24} />}
        </button>

        <div className="absolute bottom-12 left-12 space-y-6">
          <div className="flex gap-2">
            {Array.from({ length: restaurant.stars }).map((_, i) => (
              <motion.div 
                key={i}
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(230,0,40,0.3)] border-2 border-michelin-red/10"
              >
                <Sparkles size={28} className="text-michelin-red fill-michelin-red" />
              </motion.div>
            ))}
          </div>
          {/* Masquer le nom/catégorie lors de la confirmation pour éviter les superpositions sur mobile */}
          {view !== "confirmation" && (
            <div className="space-y-1">
              <h2 className="text-white font-serif text-4xl md:text-5xl leading-none">{restaurant.name}</h2>
              <p className="text-white/60 font-bold uppercase tracking-[0.3em] text-[10px]">{restaurant.category} • {restaurant.location.city}</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Scrollable Content Areas */}
      <div 
        ref={scrollRef}
        className="flex-1 bg-white overflow-y-auto custom-scrollbar relative"
      >
        <AnimatePresence mode="wait">
          {view === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="p-8 md:p-20 space-y-20 max-w-4xl"
            >
              {/* Expert Review */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="px-4 py-1.5 bg-michelin-red/5 border border-michelin-red/10 rounded-full text-michelin-red text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={14} /> L'avis du Guide Michelin
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute -top-10 -left-6 text-[120px] font-serif text-gray-50 z-0 select-none">“</span>
                  <p className="text-2xl md:text-3xl font-serif text-michelin-black leading-snug relative z-10 italic">
                    {restaurant.expertReview || restaurant.description}
                  </p>
                </div>
              </section>

              <div className="grid md:grid-cols-2 gap-16 border-t border-gray-100 pt-16">
                {/* Practical Info */}
                <section className="space-y-10">
                  <h3 className="text-xs font-black text-michelin-gray uppercase tracking-[0.3em]">Informations Pratiques</h3>
                  <div className="space-y-8">
                    <div className="flex items-start gap-5 group">
                      <div className="p-3 bg-gray-50 rounded-xl text-michelin-gray group-hover:text-michelin-red transition-colors">
                        <MapPin size={20} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-michelin-black">{restaurant.location.address}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] font-bold text-michelin-gray uppercase tracking-widest">{restaurant.location.city}</p>
                          {distance && (
                            <>
                              <div className="w-1 h-1 rounded-full bg-gray-200" />
                              <p className="text-[10px] font-bold text-michelin-red uppercase tracking-widest">{distance}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-5">
                      <div className="p-3 bg-gray-50 rounded-xl text-michelin-gray">
                        <Clock size={20} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-michelin-black">{restaurant.hours || "Vérifier sur le site"}</p>
                        <p className="text-[10px] font-bold text-michelin-gray uppercase tracking-widest">Horaires d'ouverture</p>
                      </div>
                    </div>

                    {/* Website Button in Practical Info */}
                    <a 
                      href={restaurant.website || "#"} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-start gap-5 group"
                    >
                      <div className="p-3 bg-michelin-red/5 rounded-xl text-michelin-red group-hover:bg-michelin-red group-hover:text-white transition-all">
                        <Globe size={20} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-michelin-black decoration-michelin-red/20 group-hover:decoration-michelin-red underline underline-offset-4 transition-all">Consulter le site</p>
                        <p className="text-[10px] font-bold text-michelin-gray uppercase tracking-widest">Site officiel</p>
                      </div>
                    </a>
                  </div>
                </section>

                {/* Facilities */}
                <section className="space-y-10">
                  <h3 className="text-xs font-black text-michelin-gray uppercase tracking-[0.3em]">Services & Équipements</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {(restaurant.facilities || ["Wifi", "Terrasse", "Climatisation"]).map((f, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                        <div className="text-michelin-red">
                          <FacilityIcon name={f} />
                        </div>
                        <span className="text-[11px] font-bold text-michelin-black uppercase tracking-tight">{f}</span>
                      </div>
                    ))}
                  </div>
                </section>

              </div>
              
              {/* Localisation Section */}
              <section className="space-y-8 pb-12 border-t border-gray-50 pt-16">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-michelin-gray uppercase tracking-[0.3em]">Localisation & Map</h3>
                </div>
                <div className="w-full h-[350px] md:h-[600px] rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-2xl relative">
                  <iframe 
                    title="Restaurant Map"
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    loading="lazy" 
                    allowFullScreen 
                    src={`https://maps.google.com/maps?q=${restaurant.location.lat},${restaurant.location.lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    className="w-full h-full grayscale-[0.2] contrast-[1.1]"
                  ></iframe>
                </div>
              </section>

              {/* Action Bar (Sticky Mobile) */}
              <div className="pt-10 flex gap-4">
                <button 
                  onClick={() => setView("booking")}
                  className="flex-1 bg-michelin-red text-white py-6 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-michelin-red-dark transition-all flex items-center justify-center gap-3 group"
                >
                  Démarrer la réservation <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {view === "booking" && (
            <motion.div
              key="booking"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="p-8 md:p-20 space-y-16 max-w-2xl"
            >
              <div className="space-y-4">
                <h2 className="text-4xl font-serif text-michelin-black">Votre Réservation</h2>
                <p className="text-michelin-gray font-medium">Sélectionnez vos critères pour {restaurant.name}.</p>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-10">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Guests */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-michelin-gray flex items-center gap-2">
                       <Users size={14} /> Nombre de convives
                    </label>
                    <div className="space-y-4">
                      {!showManualGuests ? (
                        <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                          {[1, 2, 3, 4, 5, 6].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setBookingData({ ...bookingData, guests: n })}
                              className={`flex-1 min-w-[40px] py-3 rounded-xl font-bold transition-all ${bookingData.guests === n ? 'bg-white text-michelin-red shadow-sm' : 'text-michelin-gray hover:text-michelin-black'}`}
                            >
                              {n}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => setShowManualGuests(true)}
                            className="flex-1 min-w-[40px] py-3 rounded-xl font-bold text-michelin-gray hover:text-michelin-red transition-all"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <input 
                            type="number"
                            min="1"
                            value={bookingData.guests}
                            onChange={(e) => setBookingData({ ...bookingData, guests: parseInt(e.target.value) || 1 })}
                            className="flex-1 bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-michelin-black outline-none focus:border-michelin-red transition-all"
                            placeholder="Nb de personnes"
                          />
                          <button 
                            type="button"
                            onClick={() => setShowManualGuests(false)}
                            className="px-4 py-4 bg-gray-100 text-michelin-gray rounded-2xl hover:text-michelin-black transition-all"
                          >
                            <RotateCcw size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Date */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-michelin-gray flex items-center gap-2">
                       <Calendar size={14} /> Date souhaitée
                    </label>
                    <input 
                      type="date" 
                      required
                      value={bookingData.date}
                      onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-michelin-black outline-none focus:border-michelin-red transition-all"
                    />
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-6 pt-10 border-t border-gray-100">
                  <h3 className="text-xs font-black text-michelin-black uppercase tracking-widest">Coordonnées de contact</h3>
                  <div className="grid gap-4">
                    <input 
                      placeholder="Nom complet" 
                      required
                      className="w-full bg-gray-50 border border-gray-100 p-5 rounded-2xl font-medium text-michelin-black outline-none focus:border-michelin-red transition-all"
                      value={bookingData.name}
                      onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                    />
                    <input 
                      type="email" 
                      placeholder="Adresse e-mail" 
                      required
                      className="w-full bg-gray-50 border border-gray-100 p-5 rounded-2xl font-medium text-michelin-black outline-none focus:border-michelin-red transition-all"
                      value={bookingData.email}
                      onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-michelin-red text-white py-6 rounded-2xl font-black text-sm uppercase tracking-[0.3em] shadow-xl hover:bg-michelin-red-dark transition-all"
                >
                  Finaliser ma demande
                </button>
              </form>
            </motion.div>
          )}

          {view === "confirmation" && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 md:p-20 h-full flex flex-col items-center justify-center text-center space-y-6 md:space-y-10"
            >
              <div className="w-16 h-16 md:w-24 md:h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-emerald-500/30">
                <Check size={32} className="md:size-[48px]" strokeWidth={3} />
              </div>
              <div className="space-y-2 md:space-y-4">
                <h2 className="text-3xl md:text-4xl font-serif text-michelin-black tracking-tight">C'est réservé !</h2>
                <p className="text-michelin-gray text-xs md:text-sm font-medium max-w-xs mx-auto leading-relaxed">
                  Merci {bookingData.name}. Un e-mail de confirmation vient d'être envoyé pour votre table de {bookingData.guests} convives.
                </p>
              </div>
              <div className="p-5 md:p-6 bg-gray-50 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 w-full max-w-sm space-y-3 md:space-y-4">
                <div className="flex justify-between text-[10px] md:text-xs font-black uppercase tracking-widest">
                  <span className="text-michelin-gray">Établissement</span>
                  <span className="text-michelin-black">{restaurant.name}</span>
                </div>
                <div className="flex justify-between text-[10px] md:text-xs font-black uppercase tracking-widest">
                  <span className="text-michelin-gray">Date & Heure</span>
                  <span className="text-michelin-black">{bookingData.date} • {bookingData.time}</span>
                </div>
              </div>
              <button 
                onClick={handleFinalConfirm}
                className="w-full md:w-auto px-10 py-5 michelin-gradient text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-michelin-red/20 hover:scale-105 active:scale-95 transition-all"
              >
                Retour à l'accueil
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
