import React from "react";
import Link from "next/link";
import { Briefcase, LogIn, ArrowRight, DollarSign, Zap, Users, Info } from 'lucide-react';

const C = {
  bgGeneral: '#FAF9F6', 
  headingLink: '#3A6EA5', // Azul
  primaryCta: '#4A7C59', // Verde (Botones principales)
  secondaryBtn: '#6B4226', // Marrón
  accentHover: '#F4C95D', // Amarillo (Destacados, hover)
  actionUrgent: '#B94E48', // Rojo (Alerta/Error)
  softBg: '#E0E0E0', 
};

// --- Componente de la Cabecera (Header) con Logo ---
const Header = () => (
  <header className="w-full py-3 px-4 sm:px-8 flex justify-between items-center sticky top-0 left-0 bg-white shadow-lg z-10">
    <div className="flex items-center space-x-2">
      <img src="/logo.png" alt="Logo ChambaNica" className="w-8 h-8 object-contain" />
      <h1 className="text-2xl font-extrabold text-[var(--headingLink)] tracking-wider" 
        style={{ '--headingLink': C.headingLink } as any}>
        ChambaNica
      </h1>
    </div>
    <Link
      href="/"
      className="flex items-center gap-1 bg-[var(--headingLink)] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors hover:bg-blue-700"
      style={{ '--headingLink': C.headingLink } as any}
    >
      <LogIn className="w-4 h-4" />
      Acceder
    </Link>
  </header>
);

// --- Componente del Pie de Página (Footer) ---
const Footer = () => (
  <footer className="w-full py-12 px-6 bg-gray-900 text-white">
    <div className="max-w-6xl mx-auto text-center">
        <h3 className="text-3xl font-bold mb-4">ChambaNica</h3>
        <p className="text-gray-400 mb-6">
            &copy; {new Date().getFullYear()} ChambaNica. Conectando talento nica. Creado por Alberth Centeno y la comunidad.
        </p>
        <p className="text-xl font-medium text-[var(--accentHover)]" style={{'--accentHover': C.accentHover} as any}>
            ¡Porque el trabajo digno no debería ser un lujo!
        </p>
    </div>
  </footer>
);


// --- Componente Principal de la Página About/QuienesSomos ---
export default function AboutPage() {
    
    // Función de utilería para reemplazar el componente <Image> con <img> y un placeholder
    type PlaceholderImageProps = {
        src?: string;
        alt?: string;
        width?: number;
        height?: number;
        className?: string;
    };

  const PlaceholderImage: React.FC<PlaceholderImageProps> = ({ src, alt, width, height, className }) => {
    // Mapeo de src a placeholders (usamos colores de la paleta)
    let placeholderUrl = `https://placehold.co/${width || 800}x${height || 500}/3A6EA5/ffffff?text=ChambaNica+Hero`;
    if (src && src.includes('creador')) {
      placeholderUrl = `https://placehold.co/128x128/${C.secondaryBtn.substring(1)}/ffffff?text=AC`;
    }
    return (
      <img
        src={placeholderUrl}
        alt={alt}
        width={width}
        height={height}
        className={`w-full h-full object-cover ${className}`}
      />
    );
  };


  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      <Header />
      
      <main className="flex-1">
        
        {/* HERO */}
        <section className="relative overflow-hidden py-20 px-6 bg-gradient-to-b from-blue-50 to-white">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-black mb-6">
              ChambaNica
              <span className="block text-4xl md:text-5xl mt-2 text-[var(--headingLink)]" style={{ '--headingLink': C.headingLink } as React.CSSProperties & Record<string, any>}>
                Trabajo digno para Nicaragua
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Somos una plataforma 100% nicaragüense que conecta a quienes 
              <span className="font-bold text-[var(--headingLink)]" style={{ '--headingLink': C.headingLink } as React.CSSProperties & Record<string, any>}> necesitan un trabajo</span> con quienes 
              <span className="font-bold text-[var(--primaryCta)]" style={{ '--primaryCta': C.primaryCta } as React.CSSProperties & Record<string, any>}> lo ofrecen con calidad y confianza</span>.
            </p>
          </div>

          {/* Imagen hero (Reemplazo con Placeholder) */}
          <div className="mt-12 flex justify-center">
            <div className="relative">
              <div className="bg-blue-100 rounded-3xl p-4 shadow-2xl">
                <img
                  src="/hero-chambanica.png"
                  alt="Trabajadores nicaragüenses orgullosos"
                  width={800}
                  height={500}
                  className="rounded-2xl shadow-xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* NUESTRA MISIÓN */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-black mb-4">Nuestra Misión</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Que <span className="font-bold text-[var(--headingLink)]" style={{ '--headingLink': C.headingLink } as any}>todo nicaragüense</span> pueda encontrar 
                trabajo digno, bien pagado y con respeto, sin tener que salir del país.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              <div className="text-center">
                <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <DollarSign className="w-10 h-10 text-[var(--headingLink)]" style={{ '--headingLink': C.headingLink } as React.CSSProperties & Record<string, any>}/>
                </div>
                <h3 className="text-2xl font-bold mb-3">Pago Justo</h3>
                <p className="text-gray-600">El trabajador decide su precio. Nunca más "regateo" injusto.</p>
              </div>
    


              <div className="text-center">
                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-10 h-10 text-[var(--primaryCta)]" style={{ '--primaryCta': C.primaryCta } as React.CSSProperties & Record<string, any>} />
                </div>
                <h3 className="text-2xl font-bold mb-3">Confianza Real</h3>
                <p className="text-gray-600">Calificaciones, fotos de trabajos, reseñas verificadas. Solo gente seria.</p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-10 h-10 text-purple-600"/>
                </div>
                <h3 className="text-2xl font-bold mb-3">Comunidad Nica</h3>
                <p className="text-gray-600">Aquí mandan los nicaragüenses. Creado por y para nosotros.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CREADOR */}
        <section className="py-20 px-6 bg-gradient-to-r from-[var(--headingLink)] to-blue-800"
          style={{ '--headingLink': C.headingLink } as React.CSSProperties & Record<string, any>}>
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="mb-10">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-2xl">
                <img
                  src="/creador.jpg"
                  alt="Creador de ChambaNica"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
            <h2 className="text-4xl font-bold mb-6">
              Un sueño hecho en Managua
            </h2>
            <p className="text-xl leading-relaxed max-w-3xl mx-auto mb-8">
              "Vi a mi mamá buscando trabajo de casa en casa, y a mi primo electricista perdiendo días sin clientes. Pensé: ¿por qué no existe una app que los conecte directamente? Así nació ChambaNica."
            </p>
            <p className="text-2xl font-bold">
              — Alberth Centeno, desarrollador de ChambaNica
            </p>
          </div>
        </section>

        {/* VALORES */}
        <section className="py-20 px-6" style={{ backgroundColor: C.bgGeneral }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16 text-[var(--headingLink)]" style={{ '--headingLink': C.headingLink } as React.CSSProperties & Record<string, any>}>Nuestros Valores</h2>
            <div className="grid md:grid-cols-2 gap-12">
              {/* Utilizo el color secundario (marrón) para el texto NICA */}
              <div className="flex gap-6">
                <div className="text-6xl font-extrabold" style={{ color: C.secondaryBtn }}>NICA</div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-black">Respeto al Trabajo Nica</h3>
                  <p className="text-gray-600">Aquí el plomero, la doméstica, el albañil y el electricista son profesionales. Punto.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="text-6xl font-extrabold" style={{ color: C.secondaryBtn }}>NICA</div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-black">Transparencia Total</h3>
                  <p className="text-gray-600">Sin comisiones ocultas. El 100% del pago va al trabajador.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="text-6xl font-extrabold" style={{ color: C.secondaryBtn }}>NICA</div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-black">Familia Primero</h3>
                  <p className="text-gray-600">Porque cada trabajo que se cierra, es comida en una mesa nicaragüense.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="text-6xl font-extrabold" style={{ color: C.secondaryBtn }}>NICA</div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-black">Orgullo Pinolero</h3>
                  <p className="text-gray-600">Hecho con amor en Nueva Guinea, para todo Nicaragua.</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
              <Link
                href="/navegar"
                className="bg-white text-[var(--headingLink)] px-10 py-5 rounded-full font-bold text-xl hover:bg-gray-100 transition shadow-xl"
                style={{ '--headingLink': C.headingLink } as React.CSSProperties & Record<string, any>}
              >
                Buscar Trabajo Ahora
              </Link>
              <Link
                href="/ofrecer"
                className="bg-[var(--primaryCta)] text-white px-10 py-5 rounded-full font-bold text-xl hover:opacity-90 transition shadow-xl"
                style={{ '--primaryCta': C.primaryCta } as React.CSSProperties & Record<string, any>}
              >
                Ofrecer Mis Servicios
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}