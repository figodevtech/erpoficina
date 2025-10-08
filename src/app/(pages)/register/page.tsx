'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';


export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [error, setError] = useState<string | null>(null);

  // const handleRegister = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   const { data, error: signUpError } = await supabaseAdmin.auth.signUp({
  //     email,
  //     password,
  //   });

  //   if (signUpError) {
  //     setError(signUpError.message);
  //     return;
  //   }

  //   if (data.user) {
  //     const { error: insertError } = await supabaseAdmin.from('Usuario').insert({
  //       id: data.user.id,
  //       email,
  //       nome,
  //     });

  //     if (insertError) {
  //       setError(insertError.message);
  //       return;
  //     }

  //     router.push('/login');
  //   }
  // };

  return (
    <div>
      <h1>Registro</h1>
      {error && <p>{error}</p>}
      <form onSubmit={()=>{ /*handleRegister*/ }}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" required />
        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome" required />
        <button type="submit">Registrar</button>
      </form>
    </div>
  );
}