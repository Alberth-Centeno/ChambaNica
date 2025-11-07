"use client";
import React from 'react';
// Usamos iconos de lucide-react para un diseño limpio
import { Briefcase, LogIn, ArrowRight } from 'lucide-react';

// Definición de la paleta de colores proporcionada, usando variables CSS para mantener la estética
const COLOR_PALETTE = {
  bgGeneral: '#FAF9F6', // Fondo general
  headingLink: '#3A6EA5', // Tipografía, enlaces, encabezados (Azul)
  primaryCta: '#4A7C59', // Botones principales y iconos (Verde)
  secondaryBtn: '#6B4226', // Botones secundarios (Marrón)
  accentHover: '#F4C95D', // Destacados, hover (Amarillo)
  softBg: '#E0E0E0', // Fondos suaves, separadores
  actionUrgent: '#B94E48', // Llamados a la acción, urgencias
};

// Componente de la Cabecera (Header)
type HeaderProps = {
  platformName: string;
  logoUrl?: string;
};

const Header = ({ platformName, logoUrl }: HeaderProps) => {
  const router = useRouter();
  return (
    <header className="w-full py-4 px-4 sm:px-8 flex justify-between items-center fixed top-0 left-0 bg-[var(--bgGeneral)]/95 backdrop-blur-sm shadow-md z-10"
      style={{ '--bgGeneral': COLOR_PALETTE.bgGeneral } as React.CSSProperties & Record<string, string>}>
      {/* Logotipo y Nombre */}
      <div className="flex items-center space-x-2">
        {logoUrl ? (
          <img src={logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
        ) : (
          <Briefcase className="w-6 h-6 text-[var(--primaryCta)]" style={{ '--primaryCta': COLOR_PALETTE.primaryCta } as React.CSSProperties} />
        )}
        <h1 className="text-2xl font-extrabold text-[var(--headingLink)] tracking-wider rounded-md px-1" 
          style={{ '--headingLink': COLOR_PALETTE.headingLink } as React.CSSProperties & Record<string, string>}>
          {platformName}
        </h1>
      </div>
      {/* Botón de Inicio de Sesión */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          router.push('/login');
        }}
        className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-full 
                   bg-[var(--primaryCta)] text-white transition-all duration-300 shadow-lg
                   hover:bg-[var(--accentHover)] hover:text-gray-800"
        style={{ '--primaryCta': COLOR_PALETTE.primaryCta, '--accentHover': COLOR_PALETTE.accentHover } as React.CSSProperties & Record<string, string>}
      >
        <LogIn className="w-4 h-4" />
        Inicia Sesión
      </a>
    </header>
  );
};

// Componente de la Sección Principal (Hero)
import { useRouter } from 'next/navigation';

const HeroSection = () => {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center text-center max-w-5xl px-4 sm:px-8 pt-16">
    {/* Etiqueta de Destacado */}
    <span 
      className="mb-4 text-sm font-bold uppercase tracking-widest px-3 py-1 rounded-full text-gray-900 bg-[var(--accentHover)]"
      style={{ '--accentHover': COLOR_PALETTE.accentHover } as React.CSSProperties & Record<string, string>}
    >
      Conectando talento con éxito
    </span>
    
    {/* Título Principal */}
    <h2 
      className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight text-[var(--headingLink)]"
      style={{ '--headingLink': COLOR_PALETTE.headingLink } as React.CSSProperties & Record<string, string>}
    >
      Tu Próxima Oportunidad <span className="text-[var(--primaryCta)]" style={{ '--primaryCta': COLOR_PALETTE.primaryCta } as React.CSSProperties & Record<string, string>}>Te Espera</span>.
    </h2>
    
    {/* Subtítulo */}
    <p className="text-lg md:text-xl max-w-3xl mb-12 text-gray-700">
      <span className="font-bold">ChambaNica:</span> Conéctate con la comunidad laboral más vibrante del país. Encuentra empleos de calidad y haz crecer tu carrera.
    </p>

    {/* Botones de Acción */}
    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
      {/* Botón Principal - Explora Ofertas */}
      <button
        onClick={() => router.push('/login')}
        className="flex h-14 w-full sm:w-60 items-center justify-center gap-3 rounded-full px-8 font-bold text-white transition-all duration-300 shadow-xl
                   bg-[var(--primaryCta)] hover:bg-[var(--accentHover)] hover:text-gray-800 focus:outline-none focus:ring-4 focus:ring-[var(--primaryCta)]/50"
        style={{ '--primaryCta': COLOR_PALETTE.primaryCta, '--accentHover': COLOR_PALETTE.accentHover } as React.CSSProperties & Record<string, string>}
      >
        Explora Ofertas
        <ArrowRight className="w-5 h-5" />
      </button>

      {/* Botón Secundario - Crea tu Perfil */}
      <button
        onClick={() => router.push('/login')}
        className="flex h-14 w-full sm:w-60 items-center justify-center gap-3 rounded-full px-8 font-bold transition-all duration-300 border-2 
                   border-[var(--secondaryBtn)] text-[var(--secondaryBtn)] hover:bg-[var(--secondaryBtn)] hover:text-white focus:outline-none focus:ring-4 focus:ring-[var(--secondaryBtn)]/50"
        style={{ '--secondaryBtn': COLOR_PALETTE.secondaryBtn } as React.CSSProperties & Record<string, string>}
      >
        Crea tu Perfil
      </button>
    </div>
    </div>
  );
};

// Componente del Pie de Página (Footer)
const Footer = () => (
  <footer className="w-full py-6 px-4 text-center text-sm text-gray-600 border-t border-[var(--softBg)] mt-auto" 
    style={{ '--softBg': COLOR_PALETTE.softBg } as React.CSSProperties & Record<string, string>}>
    &copy; {new Date().getFullYear()} ©ChambaNica. Creado por Alberth Centeno y la comunidad.
  </footer>
);

// Componente principal de la aplicación
const App = () => {
  return (
    <div 
      className="min-h-screen flex flex-col items-center pt-20 pb-8 transition-colors duration-300" 
      style={{ 
        // @ts-ignore
        '--bgGeneral': COLOR_PALETTE.bgGeneral, 
        backgroundColor: COLOR_PALETTE.bgGeneral, 
        fontFamily: 'Inter, sans-serif' 
      }}
    >
  <Header platformName="ChambaNica" logoUrl="/logo.png" />
      
      <main className="flex flex-1 w-full items-center justify-center p-4">
        <HeroSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default App;