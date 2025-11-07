'use client';

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";

// Type definitions remain the same
type ServiceRequest = {
  id: string;
  trade: string;
  description: string;
  zone: string;
  createdAt: string;
  photoUrl?: string | null;
  user: {
    id: string;
    name: string;
    phone: string;
    profilePhotoUrl: string | null;
  };
};

// Notification State Type
type NotificationState = {
  message: string;
  type: 'success' | 'error' | null;
};

export default function Navegar() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Custom Notification State
  const [notification, setNotification] = useState<NotificationState>({
    message: '',
    type: null,
  });

  // Function to show custom notification and hide it after a delay
  const showNotification = useCallback((message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: null });
    }, 4000); // Notification lasts for 4 seconds
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/requests/public");
      if (!res.ok) throw new Error("Error al cargar solicitudes");
      const data = await res.json();
      setRequests(data);
      showNotification("Solicitudes cargadas correctamente.", 'success');
    } catch (e) {
      console.error("Error al cargar solicitudes:", e);
      showNotification("Error al cargar solicitudes.", 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const openOfferModal = (req: ServiceRequest) => {
    if (!session?.user?.id) {
      showNotification("Debes iniciar sesión para ofrecer servicios", 'error');
      return;
    }
    setSelectedRequest(req);
    setShowOfferModal(true);
  };

  const handleOfferSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedRequest || !session?.user?.id) return;

    setSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      formData.append("requestId", selectedRequest.id);
      // El backend espera: requestId, trade, yearsExperience, workPhoto
      if (formData.has("years")) {
        formData.set("yearsExperience", formData.get("years") as string);
        formData.delete("years");
      }
      if (formData.has("photo")) {
        const file = formData.get("photo");
        if (file) {
          formData.set("workPhoto", file as File);
        }
        formData.delete("photo");
      }
      const res = await fetch("/api/offer/create", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        showNotification("¡Oferta enviada con éxito!", 'success');
        setShowOfferModal(false);
        setSelectedRequest(null);
        fetchRequests();
      } else {
        const data = await res.json().catch(() => ({}));
        showNotification(data.error || "Error al enviar oferta.", 'error');
      }
    } catch (error) {
      console.error("Submission network error:", error);
      showNotification("Error de conexión al enviar la oferta.", 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Custom Notification Component (Inline)
  const NotificationToast = () => {
    if (!notification.type) return null;

    const isSuccess = notification.type === 'success';
    const bgColor = isSuccess ? 'bg-green-500' : 'bg-red-500';

    return (
      <div
        className={`fixed bottom-5 right-5 p-4 rounded-xl shadow-xl transition-opacity duration-300 ease-in-out z-[100] ${bgColor} text-white`}
        role="alert"
      >
        <div className="flex items-center">
          {/* Lucide Check/X Icons (inline SVG fallback) */}
          {isSuccess ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 w-5 h-5">
                <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 w-5 h-5">
                <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
            </svg>
          )}
          <p className="font-medium text-sm sm:text-base">{notification.message}</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <p className="text-lg text-gray-600">Cargando servicios...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 font-sans">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-extrabold text-black tracking-tight">
              Oportunidades de Servicio
            </h1>
        </div>


        {requests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-100 mx-auto max-w-lg">
            <p className="text-gray-500 text-xl font-semibold mb-2">
              ¡Misión cumplida!
            </p>
            <p className="text-gray-500 text-lg">
              No hay solicitudes disponibles en este momento.
            </p>
            <p className="text-sm text-gray-400 mt-3">
              Puedes ser el primero en ver la próxima.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl shadow-lg border-t-4 border-blue-500 flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
                onClick={() => window.location.href = `/perfil/${req.user.id}`}
              >
                {/* REQUEST PHOTO (for click preview/detail) */}
                <div className="w-full h-40 overflow-hidden bg-gray-100">
                  <img
                    src={req.photoUrl || "https://placehold.co/600x400/edf2f7/4a5568?text=FOTO+DEL+TRABAJO"}
                    alt={req.trade}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = "https://placehold.co/600x400/edf2f7/4a5568?text=FOTO+DEL+TRABAJO";
                    }}
                  />
                </div>

                {/* CONTENT AREA */}
                <div className="p-5 flex flex-col flex-grow">
                  
                  {/* REQUEST TITLE AND DESCRIPTION */}
                  <h2 className="font-bold text-xl text-blue-700 mb-1 leading-snug truncate">
                    {req.trade}
                  </h2>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-grow">
                    {req.description}
                  </p>

                  {/* USER INFO & LOCATION - Reemplazado Link por <a> */}
                  <a
                    href={`/perfil/${req.user.id}`}
                    className="flex items-center gap-3 mb-4 p-2 -mx-2 rounded-lg hover:bg-gray-50 transition"
                    onClick={e => e.stopPropagation()}
                  >
                    {/* Photo de perfil */}
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                      <img
                        src={req.user.profilePhotoUrl || "https://placehold.co/40x40/cbd5e0/4a5568?text=U"}
                        alt={req.user.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                           e.currentTarget.src = "https://placehold.co/40x40/cbd5e0/4a5568?text=U";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {req.user.name}
                      </p>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {req.zone}
                      </span>
                    </div>
                  </a>

                  {/* BOTTOM BUTTON */}
                  <div>
                    <button
                      onClick={() => openOfferModal(req)}
                      className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/50 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!session?.user?.id} // Deshabilita si no hay sesión
                    >
                      {session?.user?.id ? 'Ofrecer Servicio' : 'Inicia sesión para ofrecer'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL OFRECER SERVICIO */}
      {showOfferModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 transition-opacity duration-300" onClick={() => setShowOfferModal(false)}>
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto transform transition-transform duration-300 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 border-b pb-3">
              <h2 className="text-2xl font-extrabold text-gray-800">Ofrecer Servicio</h2>
              <button
                onClick={() => setShowOfferModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 rounded-xl p-4 mb-6">
              <p className="text-sm font-semibold text-blue-800 mb-1">Solicitud:</p>
              <p className="font-bold text-xl text-blue-900">{selectedRequest.trade}</p>
              <p className="text-sm text-gray-700 mt-2 italic line-clamp-2">"{selectedRequest.description}"</p>
            </div>

            <form onSubmit={handleOfferSubmit} className="space-y-5">
              <div>
                <label htmlFor="trade" className="block text-sm font-bold text-gray-700 mb-1">
                  Tu oficio
                </label>
                {/* Opciones del enum Trade de Prisma */}
                <select
                  id="trade"
                  name="trade"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-inner focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                  defaultValue=""
                >
                  <option value="" disabled>Selecciona tu oficio</option>
                  {[
                    "PLOMERO", "ELECTRICISTA", "CARPINTERO", "MECANICO", "PINTOR",
                    "SOLDADOR", "ALBANIL", "TECNICO", "CHOFER",
                  ].map((trade) => (
                    <option key={trade} value={trade}>{trade}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="years" className="block text-sm font-bold text-gray-700 mb-1">
                  Años de experiencia
                </label>
                <input
                  id="years"
                  type="number"
                  name="years"
                  required
                  min="0"
                  max="50"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-inner focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                  placeholder="Ej: 5"
                />
              </div>

              <div>
                <label htmlFor="photo" className="block text-sm font-bold text-gray-700 mb-2">
                  Foto de ejemplo de tu trabajo (opcional)
                </label>
                <input
                  id="photo"
                  type="file"
                  name="photo"
                  accept="image/*"
                  className="w-full text-sm text-gray-600 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition duration-150 cursor-pointer"
                />
              </div>

              <div className="flex gap-3 pt-5">
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition font-semibold"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md shadow-blue-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Enviando..." : "Enviar Oferta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Notification Toast */}
      <NotificationToast />

    </div>
  );
}