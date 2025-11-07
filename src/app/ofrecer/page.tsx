"use client";
import React, { useState } from "react";
import { XCircle, CheckCircle, UploadCloud, Briefcase, Loader2, Award } from 'lucide-react';

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

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Los trades se obtendrán del backend

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

// --- Componente Principal de Ofrecimiento de Servicio ---
export default function OfrecerPage() {
    // Navbar o botón regresar
    const router = useRouter();
    const handleBack = () => {
        router.push("/");
    };
    const { data: session, status } = useSession();
    // Estado del formulario
    const [trade, setTrade] = useState("");
    const [years, setYears] = useState("");
    const [photo, setPhoto] = useState<File | null>(null);
    // Estado de la UI
    const [loading, setLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState<"success" | "error">();
    // Estado para los trades
    const [trades, setTrades] = useState<string[]>([]);

    useEffect(() => {
        // Llama a un endpoint que devuelva los trades válidos
        fetch("/api/trades")
            .then(res => res.json())
            .then(data => setTrades(data.trades || []));
    }, []);
    
    // Función para manejar el Toast (sustituye a alert())
    const showToast = (message: React.SetStateAction<string>, type: "success" | "error") => {
        setToastMessage(message);
        setToastType(type);
        setTimeout(() => setToastMessage(""), 5000); // Ocultar después de 5 segundos
    };

    // Función de envío real
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!trade || !years || !photo || !session?.user?.id) {
            showToast("Debes completar el Oficio, Años de Experiencia y subir una Foto de tu trabajo.", "error");
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("trade", trade);
            formData.append("years", years);
            formData.append("photo", photo);
            const res = await fetch("/api/offer", {
                method: "POST",
                body: formData,
            });
            if (res.ok) {
                showToast("🎉 ¡Felicidades! Tu servicio ha sido publicado y está visible.", "success");
                setTrade(""); setYears(""); setPhoto(null);
            } else {
                const data = await res.json().catch(() => ({}));
                showToast(data.error || "❌ Error al publicar el servicio. Intenta de nuevo.", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("❌ Error al publicar el servicio. Intenta de nuevo.", "error");
        } finally {
            setLoading(false);
        }
    };

    // --- Renderizado del Formulario Principal ---
    return (
        <>

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
                <h1 className="text-2xl sm:text-3xl font-extrabold mb-8 text-center" style={{ color: C.headingLink }}>
                    <Briefcase className="inline-block w-6 h-6 mr-2 mb-1" />
                    Regístrate como Profesional
                </h1>
            <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* OFICIO / CATEGORÍA */}
                <div className="form-group text-black">
                    <label className="block text-black font-semibold mb-2">Tu Oficio Principal*</label>
                    <select
                        value={trade}
                        onChange={(e) => setTrade(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-opacity-50 transition text-base sm:text-lg"
                        style={{ borderColor: C.softBg }}
                        required
                    >
                        <option value="" disabled >Selecciona tu especialidad...</option>
                        {trades.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                {/* AÑOS DE EXPERIENCIA */}
                <div className="form-group text-black">
                    <label className="block text-gray-700 font-semibold mb-2">Años de Experiencia*</label>
                    <div className="relative">
                        <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="number"
                            placeholder="Ej. 5"
                            value={years}
                            onChange={(e) => setYears(e.target.value)}
                            className="w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-opacity-50 transition text-base sm:text-lg"
                            style={{ borderColor: C.softBg }}
                            min="0"
                            required
                        />
                    </div>
                </div>

                {/* SUBIR FOTO DE PORTAFOLIO */}
                <div className="form-group">
                    <label className="block text-gray-700 font-semibold mb-2">Sube una Foto de tu Trabajo*</label>
                    <label 
                        htmlFor="photo-upload" 
                        className="flex items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer transition hover:border-gray-400 text-base sm:text-lg"
                        style={{ borderColor: C.softBg, color: photo ? C.secondaryBtn : C.headingLink }}
                    >
                        <UploadCloud className="w-5 h-5 mr-2" />
                        {photo ? photo.name : "Muestra tu mejor trabajo (Requerido)"}
                        <input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                            className="hidden"
                            required
                        />
                    </label>
                    {photo && (
                        <p className="mt-2 text-sm" style={{ color: C.primaryCta }}>
                            Foto seleccionada: {photo.name}
                        </p>
                    )}
                </div>

                {/* BOTÓN DE ENVÍO */}
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center w-full p-4 rounded-full font-bold text-lg sm:text-xl transition-all shadow-lg hover:brightness-110 disabled:opacity-60 disabled:shadow-none"
                    style={{ 
                        backgroundColor: C.secondaryBtn, // Usando el color Marrón/Secundario
                        color: 'white',
                        opacity: loading ? 0.7 : 1,
                        boxShadow: `0 4px 15px -3px ${C.secondaryBtn}80`
                    }}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Registrando Ofrecimiento...
                        </>
                    ) : (
                        "Ofrecer Mi Servicio"
                    )}
                </button>
            </form>
            {/* Componente de Toast */}
            <ToastMessage 
                message={toastMessage} 
                type={toastType || "success"} 
                onClose={() => setToastMessage("")} 
            />
            </div>
        </div>
    </>);
}
