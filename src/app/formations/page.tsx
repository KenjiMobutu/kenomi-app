import { Metadata } from 'next';
import { Header } from '@/components/page-client-components'; // Client Component
import { Footer } from '@/components/page-server-components'; // Server Component
import { B2BContactForm } from '@/components/B2BContactForm'; // Nouveau Client Component
import { Briefcase, Users, Smile } from 'lucide-react';


// Métadonnées pour le SEO de cette page
export const metadata: Metadata = {
  title: 'Formations Cybersécurité B2B - Kenomi ASBL',
  description:
    "Renforcez la sécurité de votre PME ou ASBL avec nos formations en cybersécurité, RGPD et hygiène numérique. Financez un impact social local.",
};

// --- Données des formations (normalement dans /lib/data.ts, copiées ici pour l'exemple) ---
// Ces données sont extraites de votre fichier page-client-components.tsx
const trainingData = [
  {
    id: "pro",
    icon: Briefcase,
    iconColor: "text-teal-600",
    targetAudience: "PME & ASBL",
    title: "Cybersécurité en Milieu Professionnel",
    shortDesc: "Une formation intensive de 10-12h pour donner à vos équipes les réflexes indispensables contre les menaces actuelles.",
    fullContent: (
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li>Identification des Menaces (Phishing, Ransomwares).</li>
          <li>Hygiène Numérique (Mots de passe, 2FA, Mises à jour).</li>
          <li>Sécurité en Télétravail (VPN, Wi-Fi, fuites de données).</li>
          <li>Le cadre légal (RGPD) et la gestion d&apos;incident.</li>
        </ul>
    )
  },
  {
    id: "seniors",
    icon: Users,
    iconColor: "text-blue-600",
    targetAudience: "Seniors & Grand Public",
    title: "Naviguer sur Internet en Toute Sérénité",
    shortDesc: "Un cycle d'ateliers en 4 sessions pour démystifier Internet et déjouer les pièges courants, dans une ambiance bienveillante.",
     fullContent: (
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li>Démystifier Internet & Gérer ses Emails (Reconnaître un spam).</li>
          <li>Le Détecteur d&apos;Arnaques (Faux sites bancaires, fausses alertes).</li>
          <li>Le Coffre-Fort des Mots de Passe.</li>
          <li>Partager en Sécurité (Réseaux sociaux, achats en ligne).</li>
        </ul>
    )
  },
  {
    id: "kids",
    icon: Smile,
    iconColor: "text-yellow-600",
    targetAudience: "Enfants (8-12 ans)",
    title: "Deviens un Agent Secret d'Internet",
    shortDesc: "Un stage ludique et interactif pour apprendre les bons réflexes de sécurité en s'amusant à travers des jeux et des missions.",
     fullContent: (
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li>Identifier les &quot;Méchants du Web&quot; (Phishing, fausses pubs).</li>
          <li>Le Tri des Secrets (Jeu sur les données publiques vs. privées).</li>
          <li>Le Mur des Choix (Simulation sur le cyber-harcèlement).</li>
        </ul>
    )
  }
];

// Type pour les props du formulaire
type TrainingOption = {
  id: string;
  title: string;
};
// --- Fin des données ---


export default function FormationsPage() {
  const b2bTrainings: TrainingOption[] = trainingData
    .filter(t => t.id === 'pro') // Ne montrer que les formations B2B dans le formulaire
    .map(t => ({ id: t.id, title: t.title }));

  return (
    <main className="bg-white min-h-screen flex flex-col antialiased">
      <Header />

      {/* Section 1: Héros */}
      <section className="py-24 bg-gray-50 text-center px-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
          Formations B2B & Services Entreprises
        </h1>
        <p className="mt-4 text-xl text-gray-700 max-w-3xl mx-auto">
          Protégez votre organisation contre les cybermenaces tout en
          générant un impact social direct en Belgique.
        </p>
      </section>

      {/* Section 2: Nos Offres (Statiques pour le SEO) */}
      <section id="offres" className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Nos Programmes de Formation
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trainingData.map((training) => (
            <div
              key={training.id}
              className="bg-gray-50 rounded-2xl border border-gray-200 p-8 flex flex-col shadow-lg"
            >
              <div className={`p-3 rounded-lg inline-block mb-4 self-start ${training.iconColor.replace("text-", "bg-").replace("600", "100")}`}>
                <training.icon className={`h-8 w-8 ${training.iconColor}`} />
              </div>
              <span className="text-sm font-semibold text-indigo-600">{training.targetAudience}</span>
              <h3 className="text-xl font-semibold text-gray-900 mt-2">{training.title}</h3>
              <p className="mt-2 text-sm text-gray-600 flex-grow text-justify">{training.shortDesc}</p>
              <div className="mt-6 text-gray-700 space-y-2">
                <h4 className="font-semibold">Modules clés :</h4>
                {training.fullContent}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Formulaire de Contact (Client Component) */}
      <section id="contact-form" className="py-20 bg-gray-100 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center">
            Demander un devis ou un renseignement
          </h2>
          <p className="mt-3 text-lg text-gray-600 text-center mb-10">
            Remplissez ce formulaire et notre équipe vous recontactera dans les 24 heures.
          </p>

          {/* Le formulaire est un composant client pour l'interactivité */}
          <B2BContactForm trainingOptions={b2bTrainings} />
        </div>
      </section>

      <Footer />
    </main>
  );
}
