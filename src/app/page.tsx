// SUPPRIMÉ: 'use client';
import {
  Hero,
  About,
  ActionPoles,
  DonationImpact,
  Newsletter,
  Header,
  TrainingPreviews,
  Impact,
  Mission,
  StickyButtons,
} from "@/components/page-client-components";
import {
  TransparentSection,
  Footer,
} from "@/components/page-server-components";

// --- Main Page Component ---
// Ceci est maintenant un Composant Serveur (Server Component)
export default function Home() {
  // SUPPRIMÉ: Les hooks (useUser, useScrollSpy) ont été déplacés
  // dans le composant Header ('page-client-components.tsx')

  return (
    <main className="bg-white min-h-screen flex flex-col antialiased">
      <Header />
      <Hero />
      <About />
      <ActionPoles />
      <TrainingPreviews />
      <Impact />
      <Mission />
      <TransparentSection />
      <DonationImpact />
      <Newsletter />
      <Footer />
      <StickyButtons />
    </main>
  );
}
