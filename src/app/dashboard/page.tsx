'use client';

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { LogOut, Briefcase, Search, User, Zap, Star, LayoutDashboard, ShieldCheck, Info } from 'lucide-react';


// Paleta de colores de ChambaNica
const C = {
  bgGeneral: '#FAF9F6', 
  headingLink: '#3A6EA5', // Azul
  primaryCta: '#4A7C59', // Verde (Botones principales)
  secondaryBtn: '#6B4226', // Marrón
  accentHover: '#F4C95D', // Amarillo (Destacados, hover)
  actionUrgent: '#B94E48', // Rojo (Alerta/Error)
  softBg: '#E0E0E0', 
};

// Componente para los enlaces del Dashboard
type DashboardLinkProps = {
  href: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  colorClass?: string;
  linkStyle?: React.CSSProperties;
};
const DashboardLink = ({ href, title, subtitle, icon: Icon, colorClass, linkStyle }: DashboardLinkProps) => (
  <Link href={href} className={`flex flex-col items-center justify-center p-6 rounded-2xl transition-transform transform hover:scale-[1.03] shadow-md ${colorClass ?? ''} text-gray-800 h-32`}
    style={linkStyle}>
    <Icon className="w-8 h-8 mb-2" />
    <h3 className="text-lg font-bold text-center">{title}</h3>
    {subtitle && <p className="text-xs text-gray-600 mt-1 hidden sm:block">{subtitle}</p>}
  </Link>
);

// --- Componente de la Cabecera (Header) ---
type HeaderProps = { session: any };
const Header = ({ session }: HeaderProps) => (
  <header className="w-full py-3 px-4 sm:px-8 flex justify-between items-center sticky top-0 left-0 bg-white shadow-md z-10">
    <div className="flex items-center space-x-2">
      <img src="/logo.png" alt="Logo ChambaNica" className="w-8 h-8 object-contain" />
      <h1 className="text-xl font-extrabold text-[#3A6EA5] tracking-wider">
        ChambaNica
      </h1>
    </div>
    <div className="flex items-center space-x-3">
      <p className="hidden sm:block text-sm text-gray-600">
        {session.user.name?.split(' ')[0]}
      </p>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex items-center gap-1 bg-[#B94E48] text-white text-sm font-semibold px-3 py-1 rounded-lg transition-colors hover:bg-red-700"
      >
        <LogOut className="w-4 h-4" />
        Salir
      </button>
    </div>
  </header>
);


// --- Componente del Pie de Página (Footer) ---
const Footer = () => (
  <footer className="w-full py-6 px-4 text-center text-sm text-gray-600 border-t mt-auto" style={{ backgroundColor: C.bgGeneral }}>
    &copy; {new Date().getFullYear()} ChambaNica. Conectando talento nica.
  </footer>
);



// Tipos para los datos del dashboard
type Stats = {
  requests: number;
  offersReceived: number;
  accepted: number;
  completed: number;
};
type Offer = {
  id: string;
  trade: string;
  yearsExperience: number;
  workPhotoUrl?: string;
};
type JobRequest = {
  id: string;
  trade: string;
  description: string;
  zone: string;
  createdAt: string;
};
type CompletedJob = {
  id: string;
  clientName: string;
  trade: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [myOffers, setMyOffers] = React.useState<Offer[]>([]);
  const [myRequests, setMyRequests] = React.useState<JobRequest[]>([]);
  const [completedJobs, setCompletedJobs] = React.useState<CompletedJob[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (session?.user?.id) {
      fetchAllData();
    }
    // eslint-disable-next-line
  }, [session]);

  const fetchAllData = async () => {
    setLoading(true);
    const [statsRes, offersRes, completedRes, reqRes] = await Promise.all([
      fetch("/api/profile/stats"),
      fetch("/api/profile/offers"),
      fetch("/api/profile/completed-jobs"),
      fetch("/api/my-requests"),
    ]);
    if (statsRes.ok) setStats(await statsRes.json());
    if (offersRes.ok) setMyOffers(await offersRes.json());
    if (completedRes.ok) setCompletedJobs(await completedRes.json());
    if (reqRes.ok) setMyRequests(await reqRes.json());
    setLoading(false);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: C.bgGeneral }}>
        <svg className="animate-spin h-8 w-8 text-[#4A7C59]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!session) return null;

  const isAdmin = session?.user?.email === "admin@chambanica.com";
  const user = session.user as { name?: string | null; email?: string | null; image?: string | null; profilePhotoUrl?: string | null; verified?: boolean };
  const photoUrl = user.profilePhotoUrl || user.image || "/default-avatar.png";

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: C.bgGeneral, fontFamily: 'Inter, sans-serif' }}>
      <Header session={session} />
      <main className="flex-1 p-4 sm:p-6">
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 flex items-center border-l-4 border-r-4"
              style={{ borderColor: C.headingLink }}>
              <img 
                  src={photoUrl ?? undefined} 
                  alt={user.name ?? undefined} 
                  className="w-16 h-16 rounded-full border-4 mr-4" 
                  style={{ borderColor: C.primaryCta }}
              />
              <div>
                  <h1 className="text-xl font-bold text-[#3A6EA5]">
                      Hola, {user.name}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {isAdmin ? 'Administrador' : 'Estado: Activo'}
                  </p>
              </div>
          </div>

          {/* Banner de Verificación de Perfil (Solo si no está verificado) */}
          {!user.verified && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6 rounded-lg shadow-sm">
              <p className="font-bold text-yellow-700 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" /> Perfil en Revisión
              </p>
              <p className="text-yellow-600 text-sm mt-1">
                Tu cédula está siendo verificada por el admin. Podrás usar todas las funciones al ser aprobado.
              </p>
            </div>
          )}

          {/* Panel de Admin (Solo si es admin) */}
          {isAdmin && (
            <Link href="/admin/verify" className="block mb-6">
              <div className="bg-purple-600 text-white p-5 rounded-2xl text-center hover:bg-purple-700 transition-colors shadow-lg">
                  <h3 className="text-xl font-extrabold flex items-center justify-center gap-2">
                      <LayoutDashboard className="w-6 h-6" /> Panel de Administración
                  </h3>
                  <p className="text-sm opacity-90 mt-1">Revisa y aprueba solicitudes de cédulas pendientes.</p>
              </div>
            </Link>
          )}

          {/* Módulos de Acceso Rápido (Grid) */}
          <h2 className="text-xl font-bold text-[#3A6EA5] mb-4 mt-6">
              Acciones Rápidas
          </h2>
          <div className="grid grid-cols-2 gap-4"> 
              <DashboardLink 
                  href="/ofrecer" 
                  title="Ofrecer Servicio" 
                  subtitle="Publica tu talento"
                  icon={Briefcase} 
                  colorClass="bg-blue-100"
                  linkStyle={{ color: '#3A6EA5' }}
              />
              <DashboardLink 
                  href="/buscar" 
                  title="Buscar Servicio" 
                  subtitle="Encuentra al profesional ideal"
                  icon={Search} 
                  colorClass="bg-green-100"
                  linkStyle={{ color: '#4A7C59' }}
              />
              <DashboardLink 
                  href="/perfil" 
                  title="Mi Perfil" 
                  subtitle="Edita tu información y foto"
                  icon={User} 
                  colorClass="bg-purple-100"
                  linkStyle={{ color: 'rgb(128, 0, 128)' }}
              />
              <DashboardLink 
                  href="/trabajos" 
                  title="Mis Trabajos" 
                  subtitle="Historial y evaluaciones"
                  icon={Star} 
                  colorClass="bg-orange-100"
                  linkStyle={{ color: 'rgb(255, 140, 0)' }}
              />
              <DashboardLink 
                  href="/navegar" 
                  title="Navegar" 
                  subtitle="Ver todas las ofertas disponibles"
                  icon={Zap} 
                  colorClass="bg-indigo-100"
                  linkStyle={{ color: 'rgb(75, 0, 130)' }}
              />
               <DashboardLink 
                  href="/about" 
                  title="Sobre ChambaNica" 
                  subtitle="Conoce nuestra misión"
                  icon={Info} 
                  colorClass="bg-gray-200"
                  linkStyle={{ color: 'rgb(55, 65, 81)' }}
              />
          </div>

          {/* Estadísticas rápidas */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-8">
              {[
                { value: stats.requests, label: "Solicitudes", color: "blue" },
                { value: stats.offersReceived, label: "Ofertas Recibidas", color: "green" },
                { value: stats.accepted, label: "Aceptadas", color: "purple" },
                { value: stats.completed, label: "Completadas", color: "orange" },
              ].map((stat, i) => (
                <div key={i} className={`bg-white p-4 rounded-xl shadow-sm text-center text-${stat.color}-600`}>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Mis Servicios */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-2">Mis Servicios Ofrecidos</h2>
            {myOffers.length === 0 ? (
              <p className="text-gray-500">No has ofrecido servicios. <Link href="/ofrecer" className="text-blue-600 underline">Ofrecer ahora</Link></p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {myOffers.map((offer) => (
                  <div key={offer.id} className="bg-white p-4 rounded-lg shadow-sm border">
                    <p className="font-bold text-lg">{offer.trade}</p>
                    <p className="text-sm text-gray-600">{offer.yearsExperience} años</p>
                    {offer.workPhotoUrl && <img src={offer.workPhotoUrl} alt="Trabajo" className="mt-3 w-full h-40 object-cover rounded-lg" />}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Mis Solicitudes */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-2">Mis Solicitudes</h2>
            {myRequests.length === 0 ? (
              <p className="text-gray-500">No has publicado solicitudes.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {myRequests.map((req) => (
                  <div key={req.id} className="bg-white p-4 rounded-lg shadow-sm border">
                    <p className="font-medium">{req.trade} - {req.zone}</p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{req.description}</p>
                    <p className="text-xs text-gray-500 mt-2">{new Date(req.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Trabajos Completados */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-2">Trabajos Completados</h2>
            {completedJobs.length === 0 ? (
              <p className="text-gray-500">No has completado trabajos.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {completedJobs.map((job) => (
                  <div key={job.id} className="bg-white p-4 rounded-lg shadow-sm border">
                    <p className="font-bold text-lg">{job.trade}</p>
                    <p className="text-sm text-gray-600">Cliente: {job.clientName}</p>
                    <p className="text-sm text-gray-600">Calificación: {job.rating}/5</p>
                    {job.comment && <p className="text-sm italic text-gray-500 mt-1">"{job.comment}"</p>}
                    <p className="text-xs text-gray-400 mt-2">{new Date(job.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}