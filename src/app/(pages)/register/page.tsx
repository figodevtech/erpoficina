'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase'; // Use admin para insert após signUp

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [role, setRole] = useState('TECNICO');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error: signUpError } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: { data: { nome, role } }, // Metadados opcionais
    });

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.user) {
      const { error: insertError } = await supabaseAdmin.from('Usuario').insert({
        id: data.user.id,
        email,
        nome,
        role,
      });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      router.push('/login');
    }
  };

  return (
    <div>
      <h1>Registro</h1>
      {error && <p>{error}</p>}
      <form onSubmit={handleRegister}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" required />
        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome" required />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="ADMIN">ADMIN</option>
          <option value="RECEPCAO">RECEPCAO</option>
          <option value="FINANCEIRO">FINANCEIRO</option>
          <option value="TECNICO">TECNICO</option>
        </select>
        <button type="submit">Registrar</button>
      </form>
    </div>
  );
}