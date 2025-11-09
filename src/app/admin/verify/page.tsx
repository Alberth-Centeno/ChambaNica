'use client';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  zone: string;
  idPhotoUrl: string | null;
  verified: boolean;
};

export default function AdminVerify() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (session?.user?.email !== "admin@chambanica.com") {
      router.push("/dashboard");
      return;
    }

    fetchUsers();
  }, [status, session, router]);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/unverified");
      if (!res.ok) throw new Error("Error al cargar usuarios");
      const data = await res.json();
      setUsers(data.users);
    } catch (err) {
      setError("No se pudieron cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  const verifyUser = async (userId: string) => {
    setVerifying(userId);
    setError("");
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al verificar");
      }

      setUsers(users.filter(u => u.id !== userId));
      alert("Usuario verificado exitosamente");
    } catch (err: any) {
      setError(err.message);
      alert("Error: " + err.message);
    } finally {
      setVerifying(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-black">Panel de Admin</h1>
          <button
            onClick={fetchUsers}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* No users */}
        {users.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center border">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-20 h-20 mx-auto mb-4"></div>
            <p className="text-lg text-gray-500">No hay usuarios pendientes de verificación.</p>
          </div>
        ) : (
          /* Users Grid */
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {users.map(user => (
              <div
                key={user.id}
                className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow"
              >
                {/* User Info */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-black">{user.name}</h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {user.email}
                      </p>
                      <p className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {user.phone}
                      </p>
                      <p className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {user.zone}
                      </p>
                    </div>
                  </div>

                  {/* Verify Button */}
                  <button
                    onClick={() => verifyUser(user.id)}
                    disabled={verifying === user.id}
                    className={`w-full sm:w-auto px-5 py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                      verifying === user.id
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700 active:scale-95"
                    }`}
                  >
                    {verifying === user.id ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verificando...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Verificar
                      </>
                    )}
                  </button>
                </div>

                {/* ID Photo */}
                {user.idPhotoUrl ? (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Foto de cédula:</p>
                    <div className="relative overflow-hidden rounded-lg border shadow-sm">
                      <img
                        src={user.idPhotoUrl}
                        alt="Cédula de identidad"
                        className="w-full h-auto max-h-96 object-contain bg-gray-50"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic mt-3">Sin foto de cédula</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}