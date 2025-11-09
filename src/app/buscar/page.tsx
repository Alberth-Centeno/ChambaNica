"use client";
import React, { useState } from "react";
import { XCircle, CheckCircle, UploadCloud, Loader2, DollarSign } from 'lucide-react';

// --- MOCK Data y Paleta de Colores de ChambaNica ---
const C = {
  bgGeneral: '#FAF9F6', 
  headingLink: '#3A6EA5', // Azul
  primaryCta: '#4A7C59', // Verde (Main CTA)
  secondaryBtn: '#6B4226', // Marrón
  accentHover: '#F4C95D', // Amarillo (Destacados, hover)
  actionUrgent: '#B94E48', // Rojo (Alerta/Error)
  softBg: '#E0E0E0', 
};

// MOCK: Enum de Oficios (Trade)
const trades = [
    "PLOMERO", "ELECTRICISTA", "CARPINTERO", "MECANICO", "PINTOR", "SOLDADOR", "ALBANIL", "TECNICO", "CHOFER"
];

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// --- Componente Toast para Notificaciones ---
type ToastMessageProps = {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
};
const ToastMessage: React.FC<ToastMessageProps> = ({ message, type, onClose }) => {
    if (!message) return null;

    const isSuccess = type === 'success';
    const bgColor = isSuccess ? C.primaryCta : C.actionUrgent;
    const Icon = isSuccess ? CheckCircle : XCircle;

    return (
        <div 
            className="fixed bottom-6 right-6 p-4 rounded-lg shadow-xl flex items-center space-x-3 transition-opacity duration-300 z-50"
            style={{ backgroundColor: bgColor, color: C.bgGeneral }}
        >
            <Icon className="w-6 h-6" />
            <p className="font-semibold">{message}</p>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition">
                <XCircle className="w-5 h-5" />
            </button>
        </div>
    );
};

// --- Componente Principal de Solicitud de Servicio ---
export default function RequestServiceForm() {
    const { data: session, status } = useSession();
    const router = useRouter();
    
    // Estado del formulario
    const [trade, setTrade] = useState("");
    const [description, setDescription] = useState("");
    const [zone, setZone] = useState("");
    const [photo, setPhoto] = useState<File | null>(null);
    
    // Estado de la UI
    const [loading, setLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState<'success' | 'error'>("success");
    
    // Función para manejar el Toast (sustituye a alert())
    interface ShowToastFn {
      (message: string, type: 'success' | 'error'): void;
    }

    const showToast: ShowToastFn = (message, type) => {
      setToastMessage(message);
      setToastType(type);
      setTimeout(() => setToastMessage(""), 5000); // Ocultar después de 5 segundos
    };

    // Función de envío real
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!trade || !description || !zone || !session?.user?.id) {
            showToast("Debes completar todos los campos obligatorios.", "error");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("trade", trade);
            formData.append("description", description);
            formData.append("zone", zone);
            if (photo) formData.append("photo", photo);

            const res = await fetch("/api/requests/public", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                showToast("✅ ¡Solicitud publicada! Pronto recibirás ofertas.", "success");
                setTrade(""); setDescription(""); setZone(""); setPhoto(null);
            } else {
                const data = await res.json().catch(() => ({}));
                showToast(data.error || "❌ Error al publicar la solicitud. Intenta de nuevo.", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("❌ Error al publicar la solicitud. Intenta de nuevo.", "error");
        } finally {
            setLoading(false);
        }
    };

    // --- Renderizado Condicional ---
    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: C.headingLink }} />
                <p className="ml-3 text-lg text-gray-700">Cargando perfil...</p>
            </div>
        );
    }
    
    if (!session?.user?.verified) {
        return (
            <div className="p-8 max-w-lg mx-auto bg-white rounded-xl shadow-lg m-10 border-l-4" style={{ borderColor: C.actionUrgent }}>
                <div className="text-center">
                    <XCircle className="w-12 h-12 mx-auto mb-4" style={{ color: C.actionUrgent }}/>
                    <h2 className="text-2xl font-bold mb-3 text-gray-800">Perfil en Revisión</h2>
                    <p className="text-gray-600">
                        Gracias por unirte a ChambaNica. Tu perfil está siendo revisado por nuestro equipo. 
                        Una vez verificado, podrás publicar tus solicitudes de servicio. ¡Pronto recibirás noticias!
                    </p>
                </div>
            </div>
        );
    }

    // --- Renderizado del Formulario Principal ---
    return (

        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF9F6] px-2 py-6 sm:px-6 md:px-8 lg:px-0">
            <nav className="w-full max-w-lg bg-white shadow-md py-3 px-6 flex items-center justify-between mb-8 rounded-xl">
                <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center gap-2 text-sky-700 font-bold hover:text-sky-900 transition"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" /></svg>
                    Regresar
                </button>
                <span className="mx-auto text-xl font-extrabold text-sky-800" style={{ letterSpacing: 1 }}>ChambaNica</span>
                <div style={{ width: 80 }}></div>
            </nav>
            <div className="w-full max-w-lg bg-white p-4 sm:p-8 rounded-xl shadow-2xl border border-gray-100 mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* OFICIO / CATEGORÍA */}
                <div className="form-group text-black">
                    <label className="block text-gray-700 font-semibold mb-2">¿Qué tipo de ayuda necesitas?*</label>
                    <select
                        value={trade}
                        onChange={(e) => setTrade(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-opacity-50 transition"
                        style={{ borderColor: C.softBg }}
                        required
                    >
                        <option value="" disabled>Selecciona el oficio...</option>
                        {trades.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                {/* DESCRIPCIÓN */}
                <div className="form-group text-black">
                    <label className="block text-gray-700 font-semibold mb-2">Describe el trabajo a realizar*</label>
                    <textarea
                        placeholder="Ej. 'Necesito que reparen una fuga de agua en el baño principal. Es de fácil acceso y tengo la pieza de repuesto.'"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-3 border rounded-lg h-32 resize-none focus:ring-2 focus:ring-opacity-50 transition"
                        style={{ borderColor: C.softBg }}
                        required
                    />
                </div>

                {/* ZONA / UBICACIÓN */}
                <div className="form-group text-black">
                    <label className="block text-gray-700 font-semibold mb-2">Zona/Sector del trabajo*</label>
                    <select
                        value={zone}
                        onChange={(e) => setZone(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-opacity-50 transition"
                        style={{ borderColor: C.softBg }}
                        required
                    >
                        <option value="" disabled>Selecciona tu zona...</option>
                        {Array.from({ length: 8 }, (_, i) => `ZONA${i + 1}`).map((z) => (
                            <option key={z} value={z}>{z.replace('ZONA', 'ZONA ')} </option>
                        ))}
                    </select>
                </div>

                {/* SUBIR FOTO */}
                <div className="form-group">
                    <label className="block text-gray-700 font-semibold mb-2">Foto (Opcional)</label>
                    <label 
                        htmlFor="photo-upload" 
                        className="flex items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer transition hover:border-gray-400"
                        style={{ borderColor: C.softBg, color: photo ? C.primaryCta : C.headingLink }}
                    >
                        <UploadCloud className="w-5 h-5 mr-2" />
                        {photo ? photo.name : "Click para subir una foto del problema"}
                        <input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                            className="hidden"
                        />
                    </label>
                </div>

                {/* BOTÓN DE ENVÍO */}
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center w-full p-4 rounded-full font-bold text-xl transition-all shadow-lg disabled:opacity-60 disabled:shadow-none"
                    style={{ 
                        backgroundColor: C.primaryCta, 
                        color: 'white',
                        opacity: loading ? 0.7 : 1,
                        boxShadow: `0 4px 15px -3px ${C.primaryCta}80`
                    }}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Publicando Chamba...
                        </>
                    ) : (
                        "Publicar Solicitud"
                    )}
                </button>
            </form>
            
            {/* Componente de Toast */}
            <ToastMessage 
                message={toastMessage} 
                type={toastType} 
                onClose={() => setToastMessage("")} 
            />
            </div>
        </div>
    );
}


