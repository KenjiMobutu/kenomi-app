'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PhishingLandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const rid = searchParams.get('rid');
    if (rid) {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rid }),
      }).catch(() => {});
    }
  }, [searchParams]);

  const handleContinue = () => {
    setVisible(false);
    setTimeout(() => router.push('/formation'), 400);
  };

  return (
    <div className={`page ${visible ? 'fade-in' : 'fade-out'}`}>
      <div className="card">
        <header className="header">
          <div className="icon">⚠️</div>
          <h1>Exercice de Sensibilisation</h1>
          <p className="subtitle">Simulation de Phishing</p>
        </header>

        <main className="content">
          <section className="alert">
            <h2>Information importante</h2>
            <p>
              L’email concernant le <strong>« certificat de formation »</strong> faisait partie
              d’un test de sensibilisation à la cybersécurité.
            </p>
          </section>

          <section>
            <h3>Analyse de la simulation</h3>
            <div className="grid">
              <div className="card-mini">
                <h4>Contexte exploité</h4>
                <p>Formation légitime en cours</p>
              </div>
              <div className="card-mini">
                <h4>Urgence artificielle</h4>
                <p>Action rapide requise</p>
              </div>
              <div className="card-mini">
                <h4>Action demandée</h4>
                <p>Clic immédiat sur un lien</p>
              </div>
              <div className="card-mini">
                <h4>Apparence crédible</h4>
                <p>Email professionnel et bien présenté</p>
              </div>
            </div>
          </section>

          <section className="lesson">
            <h3>Leçon clé</h3>
            <p>
              Les cybercriminels s’appuient sur des <strong>contextes familiers</strong>
              (RH, IT, formation) pour renforcer la crédibilité de leurs attaques.
              La vigilance reste votre meilleure défense.
            </p>
          </section>

          <section>
            <h3>Bonnes pratiques</h3>
            <ul className="list">
              <li><span>1.</span> Vérifiez toujours l’expéditeur par un canal indépendant</li>
              <li><span>2.</span> Ne cédez pas à un sentiment d’urgence</li>
              <li><span>3.</span> Survolez les liens pour vérifier leur adresse réelle</li>
            </ul>
          </section>
        </main>

        <footer className="footer">
          <p>Merci de votre participation à cet exercice de cybersécurité.</p>
          <button onClick={handleContinue}>Continuer la formation</button>
        </footer>
      </div>

      <style jsx>{`
        body {
          margin: 0;
          font-family: 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #0f172a, #1e293b);
          color: #f1f5f9;
        }

        .page {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 20px;
          transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .fade-in {
          opacity: 1;
          transform: translateY(0);
        }

        .fade-out {
          opacity: 0;
          transform: translateY(-20px);
        }

        .card {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 16px;
          max-width: 750px;
          width: 100%;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .header {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          text-align: center;
          padding: 50px 20px 40px;
          color: #fff;
          position: relative;
        }

        .icon {
          font-size: 60px;
          margin-bottom: 10px;
        }

        .header h1 {
          font-size: 2rem;
          margin: 0;
          font-weight: 700;
        }

        .subtitle {
          opacity: 0.9;
          margin-top: 8px;
          font-size: 1rem;
          letter-spacing: 0.5px;
        }

        .content {
          padding: 40px 30px;
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        section h3 {
          margin-bottom: 10px;
          color: #93c5fd;
          font-size: 1.3rem;
        }

        .alert {
          background: rgba(250, 204, 21, 0.1);
          border-left: 4px solid #facc15;
          padding: 15px 20px;
          border-radius: 10px;
        }

        .alert h2 {
          color: #facc15;
          margin: 0 0 8px;
        }

        .alert p {
          margin: 0;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 15px;
        }

        .card-mini {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 10px;
          padding: 15px;
          transition: all 0.3s ease;
        }

        .card-mini:hover {
          border-color: #3b82f6;
          transform: translateY(-4px);
        }

        .card-mini h4 {
          margin: 0 0 6px;
          color: #e2e8f0;
          font-size: 1rem;
        }

        .card-mini p {
          margin: 0;
          color: #cbd5e1;
          font-size: 0.9rem;
        }

        .lesson {
          background: rgba(34, 197, 94, 0.1);
          border-left: 4px solid #22c55e;
          padding: 15px 20px;
          border-radius: 10px;
        }

        .lesson h3 {
          color: #86efac;
          margin-bottom: 8px;
        }

        .lesson p {
          margin: 0;
          color: #d1fae5;
        }

        .list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .list li {
          background: rgba(59, 130, 246, 0.1);
          border-radius: 8px;
          padding: 10px 15px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.95rem;
        }

        .list span {
          background: #3b82f6;
          color: #fff;
          font-weight: bold;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .footer {
          background: rgba(255, 255, 255, 0.05);
          text-align: center;
          padding: 25px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer p {
          color: #94a3b8;
          margin: 0 0 15px;
          font-size: 0.95rem;
          font-style: italic;
        }

        .footer button {
          background: linear-gradient(135deg, #16a34a, #22c55e);
          border: none;
          color: white;
          padding: 12px 30px;
          border-radius: 40px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 5px 15px rgba(34, 197, 94, 0.3);
        }

        .footer button:hover {
          background: linear-gradient(135deg, #22c55e, #4ade80);
          transform: translateY(-2px);
        }

        @media (max-width: 600px) {
          .content {
            padding: 25px 20px;
          }

          .header h1 {
            font-size: 1.6rem;
          }

          .icon {
            font-size: 48px;
          }
        }
      `}</style>
    </div>
  );
}
