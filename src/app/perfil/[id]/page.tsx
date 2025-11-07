'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

// Define the PublicProfile type and related types
interface PublicProfile {
  id: string;
  name: string;
  verified: boolean;
  phone: string;
  zone: string;
  profilePhotoUrl: string | null;
  bio?: string;
  offers: {
    trade: string;
    yearsExperience: number;
    workPhotoUrl?: string | null;
  }[];
  stats: {
    totalCompleted: number;
    averageRating: number;
    recentReviews: {
      raterName: string;
      trade: string;
      rating: number;
      date: string;
      comment?: string;
    }[];
  };
}

export default function PublicProfileComponent() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [bioEdit, setBioEdit] = useState("");
  const [bioLoading, setBioLoading] = useState(false);
  const [bioSuccess, setBioSuccess] = useState<string | null>(null);
  const [bioError, setBioError] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/profile/public/${id}`);
      if (!res.ok) throw new Error("No encontrado");
      const data = await res.json();
      setProfile(data);
    } catch (error) {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile && session?.user?.id === profile.id) {
      setBioEdit(profile.bio || "");
    }
  }, [profile, session]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-center py-12 text-lg font-semibold text-blue-600 animate-pulse">Cargando perfil...</p>
    </div>
  );
  
  if (!profile) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-center py-12 text-xl font-bold text-red-600">
        Perfil no encontrado (ID: {id})
      </p>
    </div>
  );

  const stars = (rating: number) => {
    const fullStars = "★".repeat(Math.round(rating));
    const emptyStars = "☆".repeat(5 - Math.round(rating));
    return fullStars + emptyStars;
  };
  
  // Función de utilidad para manejar la ruta de la imagen
  const getImageUrl = (url: string | null, fallbackText: string) => {
    return url || `https://placehold.co/400x400/edf2f7/4a5568?text=${fallbackText.replace(/ /g, '+')}`;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 font-sans">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 text-center border-t-4 border-blue-500">
          <div className="flex justify-center mb-4">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-200">
              {/* Reemplazado Image de next/image con <img> estándar */}
              <img
                src={getImageUrl(profile.profilePhotoUrl, profile.name.substring(0, 2).toUpperCase())}
                alt={profile.name}
                width={112}
                height={112}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = 'https://placehold.co/112x112/4c51bf/ffffff?text=MR'; }}
              />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-black mt-2 flex items-center justify-center gap-2">
            {profile.name}
            {profile.verified && (
                <span className="text-blue-500" title="Perfil Verificado">
                    {/* SVG Icon for Verification */}
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                </span>
            )}
          </h1>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-3 text-base text-gray-700">
            <span className="font-semibold">📞 {profile.phone}</span>
            <span className="hidden sm:inline text-gray-300">•</span>
            <span className="text-gray-800">📍 {profile.zone}</span>
          </div>

          {/* ESTADÍSTICAS DE CONFIANZA */}
          <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-5">
            <div className="bg-green-50 rounded-xl p-4 shadow-inner">
              <p className="text-4xl font-extrabold text-green-700">{profile.stats.totalCompleted}</p>
              <p className="text-sm text-green-600 font-medium">Trabajos completados</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 shadow-inner">
              <p className="text-4xl font-extrabold text-yellow-600">{profile.stats.averageRating.toFixed(1)}/5</p>
              <p className="text-sm text-yellow-700 flex items-center justify-center gap-1 font-medium">
                <span className="text-xl">{stars(profile.stats.averageRating)}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-black border-b pb-2 mb-3">Sobre mí</h2>
            <p className="text-gray-900 leading-relaxed text-base">{profile.bio}</p>
            {/* Formulario de edición solo si es el dueño del perfil */}
            {session?.user?.id === profile.id && (
              <form
                className="mt-4 space-y-2"
                onSubmit={async e => {
                  e.preventDefault();
                  setBioLoading(true);
                  setBioSuccess(null);
                  setBioError(null);
                  try {
                    const res = await fetch("/api/profile/bio", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ bio: bioEdit }),
                    });
                    if (!res.ok) throw new Error("Error al guardar");
                    setBioSuccess("¡Bio actualizada!");
                    setProfile(p => p ? { ...p, bio: bioEdit } : p);
                  } catch {
                    setBioError("No se pudo actualizar la bio");
                  } finally {
                    setBioLoading(false);
                  }
                }}
              >
                <textarea
                  className="w-full border rounded-lg p-2 text-black"
                  rows={3}
                  maxLength={300}
                  value={bioEdit}
                  onChange={e => setBioEdit(e.target.value)}
                  disabled={bioLoading}
                />
                <div className="flex gap-2 items-center">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-1 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                    disabled={bioLoading || bioEdit === (profile.bio || "")}
                  >
                    Guardar
                  </button>
                  {bioLoading && <span className="text-blue-500 animate-pulse">Guardando...</span>}
                  {bioSuccess && <span className="text-green-600">{bioSuccess}</span>}
                  {bioError && <span className="text-red-600">{bioError}</span>}
                </div>
              </form>
            )}
          </div>
        )}

        {/* Servicios Ofrecidos */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-black border-b pb-2 mb-4">Servicios que ofrece</h2>
          {profile.offers.length === 0 ? (
            <p className="text-gray-500 italic">No tiene servicios publicados aún.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {profile.offers.map((offer, i) => (
                <div key={i} className="border border-blue-100 rounded-xl p-4 shadow-sm bg-blue-50/50 hover:bg-blue-100 transition duration-200">
                  <p className="font-extrabold text-lg text-blue-700">{offer.trade}</p>
                  <p className="text-sm text-gray-800 font-medium">{offer.yearsExperience} años de experiencia</p>
                  {offer.workPhotoUrl && (
                    <img 
                      src={getImageUrl(offer.workPhotoUrl, offer.trade)} 
                      alt={`Trabajo de ${offer.trade}`} 
                      className="mt-4 w-full h-40 object-cover rounded-lg shadow-md" 
                      onError={(e) => { e.currentTarget.src = `https://placehold.co/400x200/a0aec0/4a5568?text=FOTO+DE+${offer.trade.toUpperCase()}`; }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Reseñas Recientes */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-black border-b pb-2 mb-4">Últimas reseñas ({profile.stats.recentReviews.length})</h2>
          {profile.stats.recentReviews.length === 0 ? (
            <p className="text-gray-500 italic">Aún no hay reseñas para este perfil.</p>
          ) : (
            <div className="space-y-6">
              {profile.stats.recentReviews.map((review, i) => (
                <div key={i} className="border-l-4 border-yellow-400 pl-4 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-800 text-lg">{review.raterName}</p>
                      <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full inline-block mt-1">
                        {review.trade}
                      </span>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="text-3xl text-yellow-500">{stars(review.rating)}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(review.date).toLocaleDateString('es-ES')}</p>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-900 mt-3 italic leading-relaxed">"{review.comment}"</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}