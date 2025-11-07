"use client";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";


const App = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  type User = {
    id: string;
    name: string;
    email: string;
    phone: string;
    zone: string;
    verified: boolean;
    photoUrl: string;
    bio?: string;
    // agrega otros campos si es necesario
  };
  const [user, setUser] = useState<User | null>(null);
  type Stats = {
    requests: number;
    offersReceived: number;
    accepted: number;
    completed: number;
  };
  const [stats, setStats] = useState<Stats | null>(null);
  const [bio, setBio] = useState("");
  
  // Estados de la UI
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState("");
  const [uploading, setUploading] = useState(false);
  type Offer = {
    id: string;
    trade: string;
    yearsExperience: number;
    workPhotoUrl?: string;
    // agrega otros campos si es necesario
  };
  const [myOffers, setMyOffers] = useState<Offer[]>([]);
  type Request = {
    id: string;
    trade: string;
    zone: string;
    description: string;
    createdAt: string;
    // agrega otros campos si es necesario
  };
  const [myRequests, setMyRequests] = useState<Request[]>([]);
  type OfferReceived = {
    id: string;
    offerUser: {
      name: string;
      phone: string;
    };
    trade: string;
    status: "PENDING" | "ACCEPTED" | "REJECTED";
    // agrega otros campos si es necesario
  };
  const [offersReceived, setOffersReceived] = useState<OfferReceived[]>([]);
  type AcceptedOffer = {
    id: string;
    trade: string;
    clientName: string;
    clientPhone: string;
    status: "ACCEPTED" | "COMPLETED";
    // agrega otros campos si es necesario
  };
  const [acceptedOffers, setAcceptedOffers] = useState<AcceptedOffer[]>([]);
  type CompletedJob = {
    id: string;
    trade: string;
    clientName: string;
    rating: number;
    comment?: string;
    createdAt: string;
  };
  const [completedJobs, setCompletedJobs] = useState<CompletedJob[]>([]);

  // Estados para el Modal de Calificación (simulados)
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingModalMatchId, setRatingModalMatchId] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const [showEditOffers, setShowEditOffers] = useState(false);



  // --- Funciones reales ---
  useEffect(() => {
    if (!session?.user?.id) return;
    // Cargar perfil y stats
    fetch(`/api/profile/${session.user.id}`)
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        setBio(data.user.bio || "");
        setTempBio(data.user.bio || "");
        setStats(data.stats);
      });
    // Cargar servicios ofrecidos
    fetch(`/api/profile/${session.user.id}/offers`).then(res => res.json()).then(data => setMyOffers(data.offers || []));
    // Cargar solicitudes publicadas
    fetch(`/api/profile/${session.user.id}/requests`).then(res => res.json()).then(data => setMyRequests(data.requests || []));
    // Cargar ofertas recibidas
    fetch(`/api/profile/${session.user.id}/offers-received`).then(res => res.json()).then(data => setOffersReceived(data.offers || []));
    // Cargar trabajos aceptados
    fetch(`/api/profile/${session.user.id}/accepted-offers`).then(res => res.json()).then(data => setAcceptedOffers(data.offers || []));
    // Cargar trabajos completados
    if (session && session.user && session.user.id) {
      fetch(`/api/profile/${session.user.id}/completed-jobs`)
        .then(res => res.json())
        .then(data => setCompletedJobs(data.jobs || []));
    }
  }, [session?.user?.id]);

  const uploadProfilePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    if (!session || !session.user || !session.user.id) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("photo", e.target.files[0]);
    const res = await fetch(`/api/profile/${session.user.id}/photo`, {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      setUser((u) => u ? { ...u, photoUrl: data.photoUrl } : u);
    }
    setUploading(false);
  };

  const saveBio = async () => {
    if (!session || !session.user || !session.user.id) return;
    const res = await fetch(`/api/profile/${session.user.id}/bio`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio: tempBio }),
    });
    if (res.ok) {
      setBio(tempBio);
      setEditingBio(false);
    }
  };

  const handleAction = async (offerId: any, action: string) => {
    if (!session || !session.user || !session.user.id) return;
    await fetch(`/api/profile/${session.user.id}/offers-received`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offerId, action }),
    });
    // Refrescar ofertas recibidas
    fetch(`/api/profile/${session.user.id}/offers-received`).then(res => res.json()).then(data => setOffersReceived(data.offers || []));
  };

  const markComplete = async (offerId: string) => {
    if (!session || !session.user || !session.user.id) return;
    await fetch(`/api/profile/${session.user.id}/accepted-offers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offerId, action: "COMPLETE" }),
    });
    fetch(`/api/profile/${session.user.id}/accepted-offers`).then(res => res.json()).then(data => setAcceptedOffers(data.offers || []));
    setRatingModalMatchId(offerId);
    setShowRatingModal(true);
  };

  const handleRatingSubmit = async () => {
    await fetch(`/api/rating/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId: ratingModalMatchId, score: selectedRating, comment: ratingComment }),
    });
    if (session && session.user && session.user.id) {
      fetch(`/api/profile/${session.user.id}/completed-jobs`)
        .then(res => res.json())
        .then(data => setCompletedJobs(data.jobs || []));
    }
    setShowRatingModal(false);
    setRatingModalMatchId(null);
    setSelectedRating(5);
    setRatingComment("");
  };


  // --- Renderizado del Layout ---

  if (status === "loading" || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-lg text-gray-700">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <>
      {/* Navbar */}
      <nav className="w-full bg-white shadow-md py-3 px-6 flex items-center justify-between mb-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-sky-700 font-bold hover:text-sky-900 transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" /></svg>
          Home
        </button>
        <span className="text-lg font-semibold text-sky-800">Mi Perfil</span>
        <div></div>
      </nav>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 font-sans">
        <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="bg-sky-100 rounded-2xl shadow-xl p-6 mb-6 text-center border-t-4 border-sky-500">
          <div className="relative inline-block">
            <button
              onClick={() => setShowPhotoModal(true)}
              className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-2xl transition transform hover:scale-105"
            >
              {user.photoUrl ? (
                <Image
                  src={user.photoUrl}
                  alt="Foto de Perfil"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 text-5xl">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4a8 8 0 100 16 8 8 0 000-16zm0 4a4 4 0 110 8 4 4 0 010-8z" /></svg>
                </div>
              )}
            </button>
            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition duration-300">
              {uploading ? (
                <div className="w-5 h-5 border-2 border-white border-t-blue-300 rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
              <input type="file" accept="image/*" onChange={uploadProfilePhoto} disabled={uploading} className="hidden" />
            </label>
          </div>
          <h1 className="text-3xl font-extrabold mt-4 text-sky-800">{user.name}</h1>
          <p className="text-gray-600 font-medium">{user.email}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-2 mt-3 text-sm text-gray-700">
            <span><span className="font-semibold">Tel:</span> {user.phone}</span>
            <span className="hidden sm:inline text-sky-400">•</span>
            <span><span className="font-semibold">Zona:</span> {user.zone}</span>
          </div>
          <div className="mt-4">
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-md ${user.verified ? "bg-green-500 text-white" : "bg-yellow-500 text-white"}`}>
              {user.verified ? "Cuenta Verificada" : "En Revisión"}
            </span>
          </div>
        </div>

        {/* Biografía */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold text-gray-800">Biografía</h2>
            <button 
              onClick={() => { 
                if (editingBio) {
                    setEditingBio(false);
                    setTempBio(bio);
                } else {
                    setEditingBio(true); 
                    setTempBio(bio);
                }
              }} 
              className="text-blue-600 text-sm font-medium hover:text-blue-800 transition"
            >
              {editingBio ? "Cancelar" : "Editar"}
            </button>
          </div>
          {editingBio ? (
            <div className="space-y-3">
              <textarea
                value={tempBio}
                onChange={(e) => setTempBio(e.target.value)}
                placeholder="Cuéntanos sobre ti..."
                className="w-full p-4 border border-gray-300 rounded-xl resize-none h-32 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                maxLength={300}
              />
              <div className="flex justify-between items-center">
                <span className={`text-xs ${tempBio.length > 250 ? 'text-red-500' : 'text-gray-500'}`}>{tempBio.length}/300</span>
                <button onClick={saveBio} className="bg-blue-600 text-white px-5 py-2 rounded-xl font-semibold shadow-md hover:bg-blue-700 transition">
                  Guardar
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 leading-relaxed min-h-[50px]">
              {bio || <span className="text-gray-400 italic">Sin biografía — ¡Edita para presentarte!</span>}
            </p>
          )}
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { value: stats.requests, label: "Solicitudes Publicadas", color: "sky", icon: "M15 13a3 3 0 11-6 0 3 3 0 016 0z" },
              { value: stats.offersReceived, label: "Ofertas Recibidas", color: "green", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
              { value: stats.accepted, label: "Contratos Aceptados", color: "indigo", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
              { value: stats.completed, label: "Trabajos Completados", color: "orange", icon: "M5 13l4 4L19 7" },
            ].map((stat, i) => (
              <div key={i} className={`bg-white p-5 rounded-2xl shadow-lg border-t-4 border-${stat.color}-400 text-center`}>
                <p className={`text-3xl font-extrabold text-${stat.color}-600`}>{stat.value}</p>
                <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Mis Ofertas y Solicitudes */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Mis Ofertas */}
            <section className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center text-sky-700">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.55 23.55 0 0112 15c-3.185 0-5.917-1.29-8-3.245m13.255 1.954A24.576 24.576 0 0112 17c-3.185 0-5.917-1.29-8-3.245"></path></svg>
                    Mis Servicios Ofrecidos
                </h2>
                {myOffers.length === 0 ? (
                    <p className="text-gray-500 italic">
                        No has ofrecido servicios. 
                        <a href="#" onClick={(e) => {e.preventDefault(); alert("Navegando a Ofertar");}} className="text-blue-600 hover:underline ml-1 font-medium">Ofrecer ahora</a>
                    </p>
                ) : (
                    <div className="space-y-3">
                        {myOffers.map(offer => (
                            <div key={offer.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-sm transition hover:shadow-md">
                                <p className="font-bold text-lg text-gray-800">{offer.trade}</p>
                                <p className="text-sm text-gray-600">Experiencia: {offer.yearsExperience} años</p>
                                {/* Simular imagen de trabajo */}
                                {offer.workPhotoUrl && 
                                    <img 
                                        src={offer.workPhotoUrl} 
                                        alt={`Trabajo de ${offer.trade}`} 
                                        className="mt-2 w-full h-24 object-cover rounded-lg border border-gray-100" 
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} // Ocultar si la simulación falla
                                    />
                                }
                            </div>
                        ))}
                        <button onClick={() => setShowEditOffers(true)} className="w-full bg-indigo-500 text-white px-4 py-2 mt-2 rounded-xl font-semibold hover:bg-indigo-600 transition shadow-lg">
                             Administrar Especialidades
                        </button>
                    </div>
                )}
            </section>

            {/* Mis Solicitudes */}
            <section className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center text-sky-700">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                    Mis Solicitudes Publicadas
                </h2>
                {myRequests.length === 0 ? (
                    <p className="text-gray-500 italic">No has publicado solicitudes.</p>
                ) : (
                    <div className="space-y-3">
                        {myRequests.map(req => (
                            <div key={req.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200 transition hover:bg-gray-100">
                                <p className="font-bold text-base text-indigo-600">{req.trade} - <span className="text-gray-700">{req.zone}</span></p>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{req.description}</p>
                                <p className="text-xs text-gray-400 mt-2">Publicada el: {new Date(req.createdAt).toLocaleDateString('es-ES')}</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
        
        {/* Ofertas Recibidas */}
        <section className="mb-8 bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center text-green-700">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5.257A2 2 0 0114 4.873v16.254a2 2 0 01-2.243 1.873H7A2 2 0 015 20V5a2 2 0 012-2zm0 0h10a2 2 0 012 2v2M7 7h10M7 7v10M17 7v10M7 13h10M7 17h10M7 3h10a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"></path></svg>
                Ofertas Recibidas
            </h2>
            {offersReceived.length === 0 ? (
                <p className="text-gray-500 italic">No has recibido ofertas para tus solicitudes.</p>
            ) : (
                <div className="space-y-4">
                    {offersReceived.map(offer => (
                        <div key={offer.id} className="bg-gray-50 p-4 rounded-xl shadow-sm border-l-4 border-yellow-400">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-gray-800">{offer.offerUser.name}</p>
                                    <p className="text-sm text-gray-600">Oficio: <span className="font-medium">{offer.trade}</span></p>
                                    <p className="text-sm text-gray-600">Tel: {offer.offerUser.phone}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                                    offer.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                                    offer.status === "ACCEPTED" ? "bg-green-100 text-green-700" :
                                    "bg-red-100 text-red-700"
                                }`}>
                                    {offer.status === "PENDING" ? "Pendiente" : offer.status === "ACCEPTED" ? "Aceptada" : "Rechazada"}
                                </span>
                            </div>
                            {offer.status === "PENDING" && (
                                <div className="flex gap-3 mt-4">
                                    <button onClick={() => handleAction(offer.id, "ACCEPT")} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition shadow">
                                        Aceptar
                                    </button>
                                    <button onClick={() => handleAction(offer.id, "REJECT")} className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition shadow">
                                        Rechazar
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>


        {/* Trabajos En Curso / Completados por ti */}
        <section className="mb-8 bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center text-orange-700">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                Tus Trabajos Aceptados (En Curso)
            </h2>
            {acceptedOffers.length === 0 ? (
                <p className="text-gray-500 italic">Aún no tienes contratos aceptados.</p>
            ) : (
                <div className="space-y-4">
                    {acceptedOffers.map(offer => {
                        const isCompleted = offer.status === "COMPLETED";
                        const canMark = offer.status === "ACCEPTED"; // Solo si fue aceptada y no completada

                        return (
                            <div key={offer.id} className={`bg-gray-50 p-4 rounded-xl shadow-sm border-l-4 ${isCompleted ? 'border-green-400' : 'border-indigo-400'}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-bold text-base text-gray-800">{offer.trade}</p>
                                        <p className="text-sm text-gray-600">
                                            Cliente: <span className="font-medium">{offer.clientName}</span>
                                        </p>
                                        <p className="text-sm text-gray-600">Tel: {offer.clientPhone}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${isCompleted ? "bg-green-100 text-green-700" : "bg-indigo-100 text-indigo-700"}`}>
                                        {isCompleted ? "Completado" : "En Curso"}
                                    </span>
                                </div>
                                {canMark && (
                                    <button onClick={() => markComplete(offer.id)} className="w-full bg-orange-600 text-white py-2 mt-2 rounded-lg font-semibold hover:bg-orange-700 transition shadow-md">
                                        Marcar como Completado
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </section>

        {/* Trabajos Completados con Calificación */}
        <section className="mb-8 bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center text-purple-700">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.689l-4.298 8.846L2 12l4.75 3.315L5.752 22 12 18.315l6.248 3.685-1.098-6.685L22 12l-4.75-1.098-4.298-8.846-1.805 3.685z"></path></svg>
                Historial de Trabajos (Calificados)
            </h2>
            {completedJobs.length === 0 ? (
                <p className="text-gray-500 italic">Aún no hay trabajos en el historial completado.</p>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {completedJobs.map(job => (
                        <div key={job.id} className="bg-gray-50 p-4 rounded-xl shadow-sm border-l-4 border-purple-400">
                            <p className="font-bold text-lg text-gray-800">{job.trade}</p>
                            <p className="text-sm text-gray-600">Cliente: {job.clientName}</p>
                            <div className="flex items-center mt-1">
                                <span className="text-yellow-500 font-bold mr-1">{job.rating}</span>
                                <span className="text-yellow-500">
                                    {'★'.repeat(job.rating)}
                                    {'☆'.repeat(5 - job.rating)}
                                </span>
                            </div>
                            {job.comment && <p className="text-sm italic text-gray-500 mt-2">"{job.comment}"</p>}
                            <p className="text-xs text-gray-400 mt-2">Finalizado el: {new Date(job.createdAt).toLocaleDateString('es-ES')}</p>
                        </div>
                    ))}
                </div>
            )}
        </section>


        {/* Modal Foto */}
        {showPhotoModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 transition duration-300" onClick={() => setShowPhotoModal(false)}>
            <div className="relative max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setShowPhotoModal(false)} className="absolute -top-10 right-0 bg-white text-gray-800 p-2 rounded-full shadow-lg hover:bg-gray-100 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              {user.photoUrl ? (
                <Image src={user.photoUrl} alt="Foto completa" width={512} height={512} className="w-full h-auto rounded-xl shadow-2xl border-4 border-white" />
              ) : (
                <div className="w-full h-64 flex items-center justify-center bg-gray-200 text-gray-400 text-5xl rounded-xl border-4 border-white shadow-2xl">
                  <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4a8 8 0 100 16 8 8 0 000-16zm0 4a4 4 0 110 8 4 4 0 010-8z" /></svg>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL DE CALIFICACIÓN (Simulado) */}
        {showRatingModal && ratingModalMatchId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all duration-300 scale-100" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-extrabold text-blue-600 text-center mb-6">¡Trabajo Completado!</h2>
              
              <div className="text-center mb-6">
                <p className="text-lg font-medium text-gray-700">Califica la experiencia con tu cliente:</p>
              </div>

              {/* ESTRELLAS */}
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setSelectedRating(star)}
                    className="transition transform hover:scale-110"
                  >
                    <span className={`text-5xl ${star <= selectedRating ? "text-yellow-400" : "text-gray-300"}`}>
                      {star <= selectedRating ? "★" : "☆"}
                    </span>
                  </button>
                ))}
              </div>

              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Opcional: ¿Qué tal fue trabajar con este cliente? (200 caracteres máx)"
                className="w-full p-4 border border-gray-300 rounded-xl resize-none h-24 mb-4 focus:ring-2 focus:ring-blue-500"
                maxLength={200}
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRatingModal(false);
                    setRatingModalMatchId(null);
                    setSelectedRating(5);
                    setRatingComment("");
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRatingSubmit}
                  disabled={selectedRating === 0}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg disabled:opacity-50"
                >
                  Enviar Calificación
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* MODAL EDITAR OFERTAS (Simulado) */}
        {showEditOffers && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all duration-300 scale-100">
                    <h2 className="text-2xl font-extrabold text-indigo-600 text-center mb-6">Administrar Especialidades</h2>
                    <p className='text-gray-600 mb-4'>Aquí podrías agregar, editar o eliminar los servicios que ofreces (ej. Fontanería, Albañilería, etc.).</p>
                    <ul className='space-y-3 mb-6'>
                        {myOffers.map(offer => (
                            <li key={offer.id} className='flex justify-between items-center p-3 border-b'>
                                <span className='font-medium'>{offer.trade}</span>
                                <button className='text-red-500 hover:text-red-700'>Eliminar</button>
                            </li>
                        ))}
                    </ul>
                    <button onClick={() => setShowEditOffers(false)} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg">
                        Cerrar (Simulación)
                    </button>
                </div>
            </div>
        )}


      </div>
    </div>
    </>
  );
};

export default App;