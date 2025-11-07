'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zone } from '@prisma/client';

async function registerUser(body: globalThis.FormData): Promise<{ success: boolean; message?: string; [key: string]: any }> {
  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      body,
    });

    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      return { success: true, ...json };
    }
    return { success: false, message: json?.message || 'Error' };
  } catch (err) {
    return { success: false, message: (err as Error).message || 'Network error' };
  }
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  phone: z.string().min(1),
  role: z.enum(['TRABAJADOR', 'CLIENTE']),
  zone: z.enum(Object.values(Zone) as [string, ...string[]]),
  idPhoto: z.any(), // File es manejado manualmente
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('name', data.name);
    formData.append('phone', data.phone);
    formData.append('role', data.role);
    formData.append('zone', data.zone);
    formData.append('idPhoto', data.idPhoto[0]); // FileList

    const result = await registerUser(formData);
    if (result.success) {
      alert('Registro exitoso, espera verificación.');
    } else {
      alert('Error en el registro.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4 max-w-md mx-auto">
      <div>
        <label>Email</label>
        <input {...register('email')} className="border p-2 w-full" />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}
      </div>
      <div>
        <label>Contraseña</label>
        <input type="password" {...register('password')} className="border p-2 w-full" />
        {errors.password && <p className="text-red-500">{errors.password.message}</p>}
      </div>
      <div>
        <label>Nombre</label>
        <input {...register('name')} className="border p-2 w-full" />
        {errors.name && <p className="text-red-500">{errors.name.message}</p>}
      </div>
      <div>
        <label>Teléfono</label>
        <input {...register('phone')} className="border p-2 w-full" />
        {errors.phone && <p className="text-red-500">{errors.phone.message}</p>}
      </div>
      <div>
        <label>Rol</label>
        <select {...register('role')} className="border p-2 w-full">
          <option value="TRABAJADOR">Trabajador</option>
          <option value="CLIENTE">Cliente</option>
        </select>
        {errors.role && <p className="text-red-500">{errors.role.message}</p>}
      </div>
      <div>
        <label>Zona</label>
        <select {...register('zone')} className="border p-2 w-full">
          {Object.values(Zone).map((zone) => (
            <option key={zone as string} value={zone as string}>{zone as string}</option>
          ))}
        </select>
        {errors.zone && <p className="text-red-500">{errors.zone.message}</p>}
      </div>
      <div>
        <label>Foto de Cédula</label>
        <input type="file" {...register('idPhoto')} accept="image/*" />
        {errors.idPhoto && (
          <p className="text-red-500">{String((errors.idPhoto as any)?.message ?? errors.idPhoto)}</p>
        )}
      </div>
      <button type="submit" className="bg-blue-500 text-white p-2 mt-4">Registrar</button>
    </form>
  );
}