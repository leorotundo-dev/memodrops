"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "../../../lib/api";
import { PrimaryButton } from "../../../components/ui/PrimaryButton";

export default function LoginPage() {
  const [email, setEmail] = useState("teste@memodrops.com");
  const [password, setPassword] = useState("Teste123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const data = await apiPost("/auth/login", { email, password });
      if (data?.token) {
        localStorage.setItem("memodrops_token", data.token);
        localStorage.setItem("memodrops_user", JSON.stringify(data.user));
        router.push("/admin/dashboard");
      } else {
        throw new Error("Token não recebido");
      }
    } catch (err: any) {
      console.error("Erro de login:", err);
      setError("Não foi possível fazer login. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900/80 p-8 shadow-xl border border-zinc-800">
        <h1 className="text-2xl font-semibold mb-6 text-center">
          Login MemoDrops Admin
        </h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-sm text-zinc-300">E-mail</label>
            <input
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-indigo-500"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-zinc-300">Senha</label>
            <input
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-indigo-500"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && (
            <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <PrimaryButton
            type="submit"
            className="w-full justify-center"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
}
