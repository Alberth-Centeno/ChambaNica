'use client';

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Phone, MapPin, Camera, X, CheckCircle, AlertTriangle } from 'lucide-react';


// --- Paleta de Colores de ChambaNica ---
const C = {
  bgGeneral: '#FAF9F6', 
  headingLink: '#3A6EA5', // Azul
  primaryCta: '#4A7C59', // Verde (Botones principales)
  secondaryBtn: '#6B4226', // Marrón
  accentHover: '#F4C95D', // Amarillo (Destacados, hover)
  actionUrgent: '#B94E48', // Rojo (Alerta/Error)
  softBg: '#E0E0E0', 
};

// --- Componente de Alerta/Modal Personalizado (Reemplazo de alert()) ---
interface CustomAlertProps {
  message: string;
  type: string;
  onClose: () => void;
}

const CustomAlert = ({ message, type, onClose }: CustomAlertProps) => {
  if (!message) return null;

  let bgColor, icon;
  
  switch (type) {
    case 'success':
      bgColor = 'bg-green-100 border-green-400 text-green-700';
      icon = <CheckCircle className="w-5 h-5" />;
      break;
    case 'error':
      bgColor = 'bg-red-100 border-red-400 text-red-700';
      icon = <AlertTriangle className="w-5 h-5" />;
      break;
    default:
      bgColor = 'bg-blue-100 border-blue-400 text-blue-700';
      icon = <AlertTriangle className="w-5 h-5" />;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
      <div className={`max-w-sm w-full p-4 border rounded-xl shadow-2xl flex items-center justify-between ${bgColor}`}>
        <div className="flex items-center space-x-3">
          {icon}
          <p className="font-medium text-sm">{message}</p>
        </div>
        <button onClick={onClose} className={`p-1 rounded-full hover:opacity-75 transition-opacity`}>
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// --- Componente del Input con Icono ---
interface IconInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const IconInput = ({ icon: Icon, ...props }: IconInputProps) => (
  <div className="relative">
    <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
    <input
      {...props}
      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:border-[var(--primaryCta)] focus:ring-1 focus:ring-[var(--primaryCta)] transition-colors"
      style={{ '--primaryCta': C.primaryCta } as React.CSSProperties & Record<string, string>}
    />
  </div>
);

// --- Componente Principal ---
export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter(); 
  
  const [alertState, setAlertState] = useState({ message: '', type: '' });

  const showAlert = (message: string, type = 'error') => {
    setAlertState({ message, type });
  };
  
  const closeAlert = () => {
    setAlertState({ message: '', type: '' });
  };


  const handleSubmit = async (e: { preventDefault: () => void; currentTarget: HTMLFormElement | undefined; }) => { // e: React.FormEvent<HTMLFormElement>
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    setLoading(true);
    closeAlert(); 
    
    // Extracción de credenciales para el proceso
    const email = formData.get("email");
    const password = formData.get("password");

    if (isRegister) {
      // REGISTRO
      try {
        // En tu entorno real, esta llamada fetch es crucial
        const res = await fetch("/api/auth/register", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          // Registro exitoso, procede a iniciar sesión automáticamente
          const loginRes = await signIn("credentials", {
            email: email, 
            password: password, 
            redirect: false,
          });

          if (loginRes?.ok) {
            showAlert("¡Registro exitoso! Redirigiendo a tu dashboard...", 'success');
            router.push("/dashboard");
          } else {
             // Esto captura errores si el registro fue OK pero el auto-login falló.
             showAlert("Registro completado, pero no se pudo iniciar sesión automáticamente. Intenta manualmente.", 'error');
          }
        } else {
          const data = await res.json();
          // Usamos el modal en lugar de alert()
          showAlert(data.error || "Error al registrarse. Inténtalo de nuevo.", 'error');
        }
      } catch (error) {
         showAlert("Ocurrió un error de red o servidor.", 'error');
      }

    } else {
      // LOGIN
      try {
        const res = await signIn("credentials", {
          email: email,
          password: password,
          redirect: false,
        });
        if (res?.ok) {
          showAlert("Inicio de sesión exitoso. Redirigiendo...", 'success');
          router.push("/dashboard");
        } else {
          showAlert(res?.error || "Credenciales incorrectas. Verifica tu email y contraseña.", 'error');
        }
      } catch (error) {
        if (error && typeof error === "object" && "message" in error) {
          showAlert((error as { message: string }).message, 'error');
        } else {
          showAlert("Ocurrió un error inesperado.", 'error');
        }
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" 
        style={{ backgroundColor: C.softBg, fontFamily: 'Inter, sans-serif' }}>
      
      {/* Muestra el modal de alerta */}
      <CustomAlert message={alertState.message} type={alertState.type} onClose={closeAlert} />

      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 sm:p-10 border-t-8"
           style={{ borderColor: C.primaryCta }}>
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold mb-2" style={{ color: C.headingLink }}>
            {isRegister ? "Crear Cuenta" : "¡Bienvenido a ChambaNica!"}
          </h1>
          <p className="text-gray-500">
            {isRegister ? "Únete a la comunidad laboral" : "Accede a tu cuenta para buscar empleo."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-black">
          {isRegister && (
            <>
              <IconInput icon={User} name="name" type="text" placeholder="Nombre completo" required />
              
              <IconInput icon={Phone} name="phone" type="tel" placeholder="Teléfono (8 dígitos)" required pattern="[0-9]{8}" />
              
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select name="zone" required 
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl appearance-none bg-white focus:border-[var(--primaryCta)] focus:ring-1 focus:ring-[var(--primaryCta)] transition-colors"
                  style={{ '--primaryCta': C.primaryCta } as React.CSSProperties & Record<string, string>}>
                  <option value="">Selecciona tu zona</option>
                  <option value="ZONA1">Zona 1</option>
                  <option value="ZONA2">Zona 2</option>
                  <option value="ZONA3">Zona 3</option>
                  <option value="ZONA4">Zona 4</option>
                  <option value="ZONA5">Zona 5</option>
                  <option value="ZONA6">Zona 6</option>
                  <option value="ZONA7">Zona 7</option>
                  <option value="ZONA8">Zona 8</option>
                </select>
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">▼</span>
              </div>
              
              <div className="pt-2">
                <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-gray-600"/>
                  Foto de cédula (Verificación)
                </label>
                <input
                  name="idPhoto"
                  type="file"
                  accept="image/*"
                  required
                  className="w-full p-2 border border-dashed border-gray-400 rounded-lg text-sm file:mr-4 file:py-2 file:px-4
                             file:rounded-full file:border-0 file:text-sm file:font-semibold
                             file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                />
              </div>
            </>
          )}

          <IconInput icon={Mail} name="email" type="email" placeholder="Correo electrónico" required />
          
          <IconInput icon={Lock} name="password" type="password" placeholder="Contraseña" required minLength={8} />

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 mt-6 rounded-full font-bold text-white transition-all duration-300 shadow-md
                       bg-[var(--primaryCta)] hover:bg-[var(--accentHover)] hover:text-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ '--primaryCta': C.primaryCta, '--accentHover': C.accentHover } as React.CSSProperties}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </>
            ) : isRegister ? "Registrarse en ChambaNica" : "Iniciar Sesión"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          {isRegister ? "¿Ya tienes cuenta? " : "¿No tienes cuenta? "}
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="font-semibold transition-colors hover:underline"
            style={{ color: C.headingLink }}
          >
            {isRegister ? "Inicia sesión aquí" : "Crea una cuenta"}
          </button>
        </p>
      </div>
    </div>
  );
}