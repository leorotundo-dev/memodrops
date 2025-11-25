import { PLANS } from '@/lib/plans';

export default function HomePage() {
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1>MemoDrops Web – v0.1</h1>
      <p>Esqueleto inicial do frontend web.</p>

      <h2 style={{ marginTop: 24 }}>Planos</h2>
      <ul>
        {PLANS.map(plan => (
          <li key={plan.id}>
            <strong>{plan.name}</strong> – R$ {(plan.priceCents / 100).toFixed(2).replace('.', ',')}
          </li>
        ))}
      </ul>
    </main>
  );
}
