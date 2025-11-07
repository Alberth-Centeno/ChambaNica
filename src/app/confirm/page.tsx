import Link from "next/link";

export default function ConfirmPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">
          ¡Registro exitoso!
        </h1>
        <p className="text-gray-700 mb-6">
          <strong>¡Registro exitoso!</strong><br />
          Tu perfil está en revisión.<br />
          <strong>Podrás publicar cuando el admin verifique tu cédula.</strong>
        </p>
        <Link href="/dashboard" className="bg-blue-600 text-white px-6 py-3 rounded-lg">
          Ir al Dashboard
        </Link>
      </div>
    </div>
  );
}