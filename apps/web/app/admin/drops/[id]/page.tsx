"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet } from "../../../../lib/api";

interface DropDetail {
  id: string;
  title: string;
  description?: string;
  disciplina?: string;
  topicCode?: string;
  difficulty?: number;
  createdAt?: string;
  updatedAt?: string;
  content?: string;
  questions?: Array<{
    id: string;
    text: string;
    type: string;
    options?: string[];
    correctAnswer?: string;
  }>;
  reviews?: Array<{
    id: string;
    userId: string;
    rating: number;
    comment?: string;
    createdAt?: string;
  }>;
  metadata?: Record<string, any>;
}

export default function DropDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dropId = params.id as string;

  const [drop, setDrop] = useState<DropDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGet(`/drops/${dropId}`);
        setDrop(data);
      } catch (e) {
        console.error("Erro ao buscar drop:", e);
        setError("Erro ao carregar detalhes do drop");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [dropId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          ← Voltar
        </button>
        <p className="text-sm text-zinc-400">Carregando...</p>
      </div>
    );
  }

  if (error || !drop) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          ← Voltar
        </button>
        <div className="rounded-lg border border-red-900 bg-red-950/40 p-4">
          <p className="text-sm text-red-400">{error || "Drop não encontrado"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="text-sm text-blue-400 hover:text-blue-300 mb-4"
        >
          ← Voltar
        </button>
        <h1 className="text-3xl font-bold text-white mb-2">{drop.title}</h1>
        <p className="text-sm text-zinc-400">{drop.description}</p>
      </div>

      {/* Informações Básicas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {drop.difficulty && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500 mb-1">Dificuldade</p>
            <p className="text-2xl font-bold text-white">{drop.difficulty}</p>
          </div>
        )}
        {drop.disciplina && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500 mb-1">Disciplina</p>
            <p className="text-sm font-medium text-zinc-300 truncate">
              {drop.disciplina}
            </p>
          </div>
        )}
        {drop.topicCode && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500 mb-1">Tópico</p>
            <p className="text-sm font-medium text-zinc-300 truncate">
              {drop.topicCode}
            </p>
          </div>
        )}
        {drop.createdAt && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500 mb-1">Criado em</p>
            <p className="text-sm font-medium text-zinc-300">
              {new Date(drop.createdAt).toLocaleDateString("pt-BR")}
            </p>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      {drop.content && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-lg font-semibold mb-4">Conteúdo</h2>
          <div className="prose prose-invert max-w-none text-zinc-300">
            {drop.content}
          </div>
        </div>
      )}

      {/* Questões */}
      {drop.questions && drop.questions.length > 0 && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-lg font-semibold mb-4">
            Questões ({drop.questions.length})
          </h2>
          <div className="space-y-4">
            {drop.questions.map((q, idx) => (
              <div
                key={q.id}
                className="rounded-lg border border-zinc-700 bg-zinc-800/40 p-4"
              >
                <p className="text-sm font-medium text-white mb-2">
                  {idx + 1}. {q.text}
                </p>
                <p className="text-xs text-zinc-500 mb-2">Tipo: {q.type}</p>
                {q.options && q.options.length > 0 && (
                  <div className="space-y-2 mb-2">
                    {q.options.map((opt, optIdx) => (
                      <p
                        key={optIdx}
                        className={`text-xs p-2 rounded ${
                          opt === q.correctAnswer
                            ? "bg-green-900/40 text-green-400"
                            : "bg-zinc-700/40 text-zinc-400"
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}) {opt}
                      </p>
                    ))}
                  </div>
                )}
                {q.correctAnswer && (
                  <p className="text-xs text-green-400">
                    ✓ Resposta correta: {q.correctAnswer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      {drop.reviews && drop.reviews.length > 0 && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-lg font-semibold mb-4">
            Reviews ({drop.reviews.length})
          </h2>
          <div className="space-y-3">
            {drop.reviews.map(review => (
              <div
                key={review.id}
                className="rounded-lg border border-zinc-700 bg-zinc-800/40 p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-zinc-500">
                    Usuário: {review.userId.substring(0, 8)}...
                  </p>
                  <p className="text-sm font-medium text-yellow-400">
                    ★ {review.rating}
                  </p>
                </div>
                {review.comment && (
                  <p className="text-sm text-zinc-300 mb-2">{review.comment}</p>
                )}
                {review.createdAt && (
                  <p className="text-xs text-zinc-600">
                    {new Date(review.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      {drop.metadata && Object.keys(drop.metadata).length > 0 && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-lg font-semibold mb-4">Metadados</h2>
          <pre className="text-xs text-zinc-400 overflow-auto max-h-64 bg-zinc-900/40 p-4 rounded">
            {JSON.stringify(drop.metadata, null, 2)}
          </pre>
        </div>
      )}

      {/* ID */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
        <p className="text-xs text-zinc-500 mb-1">ID</p>
        <p className="text-xs text-zinc-400 font-mono break-all">{drop.id}</p>
      </div>
    </div>
  );
}
