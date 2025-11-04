'use client';

import Image from "next/image";
import Link from "next/link";
import { motion, useAnimation, useInView, AnimatePresence, animate } from "framer-motion";
// AJOUT: Import de 'memo' pour la refactorisation
import { useEffect, useState, useRef, ReactNode, memo } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
// AJOUT: Icônes pour les nouvelles cartes de formation
import { Briefcase, School, ShieldCheck, Users2, Heart, ArrowUp, Menu, X , Package, Handshake, Users, Smile } from 'lucide-react';

// --- Types ---
// AJOUT: Type pour les données de formation
type Training = {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  targetAudience: string;
  title: string;
  shortDesc: string;
  fullContent: ReactNode;
};

// --- Data ---
const navLinks = [
  { href: "#about", label: "Notre Modèle" },
  // MODIFIÉ: Séparation de Solutions
  { href: "#action-poles", label: "Nos Actions" },
  // AJOUT: Lien de navigation pour la nouvelle section
  { href: "#previews", label: "Formations" },
  { href: "#impact", label: "Notre Impact" },
  { href: "#mission", label: "La Mission" },
  { href: "#contact", label: "Contact" },
];

const statsData = [
  { label: "Professionnels formés en Belgique", value: 320, color: "text-teal-500" },
  { label: "Kits d'autonomie distribués", value: 75, color: "text-blue-500" },
  { label: "Heures de formation citoyenne", value: 400, color: "text-yellow-500" },
  { label: "Partenaires sociaux actifs", value: 12, color: "text-red-500" },
];

const solutionsData = [
    // MODIFIÉ: "Entreprises" -> "PME"
    { icon: Briefcase, title: "Formations pour PME & ASBL", desc: "Protégez vos données et renforcez vos équipes avec nos formations en cybersécurité, RGPD et hygiène numérique.", color: "teal" },
    { icon: Users2, title: "Ateliers pour Tous les Publics", desc: "Nous rendons le numérique plus sûr pour les seniors, les parents et les chercheurs d'emploi via des ateliers pratiques.", color: "yellow" },
    { icon: Package, title: "Le Programme \"Tremplin Numérique\"", desc: "Nous équipons des jeunes défavorisés avec un kit complet : ordinateur, logiciels et formation pour garantir leur autonomie.", color: "blue" },
    { icon: Handshake, title: "Votre Investissement Social Direct", desc: "Chaque formation achetée finance directement notre programme social. Un impact concret et visible sur votre territoire.", color: "red" }
  ];

// AJOUT: Données détaillées pour la section "Aperçu des Formations"
// J'ai utilisé l'historique de nos conversations pour remplir le contenu.
const trainingData: Training[] = [
  {
    id: "pro",
    icon: Briefcase,
    iconColor: "text-teal-600",
    // MODIFIÉ: "Entreprises" -> "PME"
    targetAudience: "PME & ASBL",
    title: "Cybersécurité en Milieu Professionnel",
    shortDesc: "Une formation intensive de 10-12h pour donner à vos équipes les réflexes indispensables contre les menaces actuelles.",
    fullContent: (
      // MODIFIÉ: Alignement justifié
      <div className="space-y-4 text-gray-700 text-justify">
        <p className="font-semibold text-lg">Objectif : Transformer chaque employé en un maillon fort de votre sécurité.</p>
        {/* MODIFIÉ: "entreprise" -> "PME" */}
        <p>Ce programme complet (10-12h) couvre tous les aspects essentiels de la sécurité numérique en PME, du phishing à la protection des données (RGPD).</p>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li><strong>Module 1 :</strong> Introduction & Enjeux (Coûts d'une attaque, risques légaux).</li>
          <li><strong>Module 2 :</strong> Identification des Menaces (Phishing, Ransomwares, Ingénierie Sociale).</li>
          <li><strong>Module 3 :</strong> Hygiène Numérique (Mots de passe, 2FA, Mises à jour).</li>
          <li><strong>Module 4 :</strong> Sécurité en Télétravail (VPN, Wi-Fi, fuites de données).</li>
          <li><strong>Module 5 :</strong> Ateliers Pratiques & Simulation d'attaque.</li>
          <li><strong>Module 6 :</strong> Le cadre légal (RGPD) et la gestion d'incident.</li>
        </ul>
        <p className="mt-4 font-semibold">Inclus : Support de cours, fiches réflexes, et certificat de réussite.</p>
      </div>
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
      // MODIFIÉ: Alignement justifié
      <div className="space-y-4 text-gray-700 text-justify">
        <p className="font-semibold text-lg">Objectif : Donner confiance et autonomie aux seniors face au numérique.</p>
        <p>Ce programme est conçu sans jargon, axé sur la pratique et les situations réelles que les seniors rencontrent au quotidien.</p>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li><strong>Atelier 1 :</strong> Démystifier Internet & Gérer ses Emails (Reconnaître un spam).</li>
          <li><strong>Atelier 2 :</strong> Le Détecteur d'Arnaques (Faux sites bancaires, fausses alertes virus, arnaques WhatsApp).</li>
          <li><strong>Atelier 3 :</strong> Le Coffre-Fort des Mots de Passe (Créer et retenir une "phrase de passe" ultra-sécurisée).</li>
          <li><strong>Atelier 4 :</strong> Partager en Sécurité (Réseaux sociaux, photos de famille, achats en ligne).</li>
        </ul>
        <p className="mt-4 font-semibold">Inclus : Guide papier récapitulatif, support téléphonique post-formation (1 mois).</p>
      </div>
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
      // MODIFIÉ: Alignement justifié
      <div className="space-y-4 text-gray-700 text-justify">
        <p className="font-semibold text-lg">Objectif : Transformer les enfants en citoyens numériques responsables et avertis par le jeu.</p>
        <p>Ce camp d'entraînement utilise un univers "d'agents secrets" pour enseigner les concepts clés de la sécurité et de l'empathie en ligne.</p>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li><strong>Mission 1 :</strong> Identifier les "Méchants du Web" (Phishing, fausses pubs).</li>
          <li><strong>Mission 2 :</strong> Le Tri des Secrets (Jeu sur les données publiques vs. privées).</li>
          <li><strong>Mission 3 :</strong> Le Gardien du Trésor (Créer une "phrase de passe" magique).</li>
          <li><strong>Mission 4 :</strong> Le Mur des Choix (Jeu de simulation sur le cyber-harcèlement et les rumeurs).</li>
          <li><strong>Mission 5 :</strong> L'Atelier du Super Post (Apprendre à réfléchir avant de publier).</li>
        </ul>
        <p className="mt-4 font-semibold">Inclus : Diplôme officiel "d'Agent Secret d'Internet" et un guide pour les parents.</p>
      </div>
    )
  }
];

const testimonialsData = [
  { name: "Sophie, CEO d'une PME cliente", text: "La formation était excellente, et savoir que notre investissement a un impact local direct est un vrai plus pour notre politique RSE." },
  { name: "Karim, Partenaire d'une Mission Locale", text: "Les 'Kits d'Autonomie' de Kenomi changent la vie des jeunes que nous suivons. C'est un levier d'insertion incroyable." }
];

// --- Custom Hooks ---
const useScrollSpy = (ids: string[], options: IntersectionObserverInit) => {
    const [activeId, setActiveId] = useState<string>("");
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) setActiveId(entry.target.id);
            });
        }, options);
        ids.forEach(id => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });
        return () => {
            ids.forEach(id => {
                const element = document.getElementById(id);
                if (element) observer.unobserve(element);
            });
        };
    }, [ids, options]);
    return activeId;
};

// --- Main Page Component ---
export default function Home() {
  const { isSignedIn } = useUser();
  const activeSection = useScrollSpy(navLinks.map(l => l.href.substring(1)), { rootMargin: "-30% 0px -70% 0px" });

  return (
    <main className="bg-white min-h-screen flex flex-col antialiased">
      <Header activeSection={activeSection} isSignedIn={isSignedIn} />
      <Hero />
      <About />

      {/* MODIFIÉ: Appel aux deux nouvelles fonctions */}

      <ActionPoles />

      {/* AJOUT: Appel au nouveau composant de formation */}
      <TrainingPreviews />

      <Impact />
      <Mission />
      <TransparentSection/>
      <DonationImpact />
      <Newsletter />
      <Footer />
      <StickyButtons />
    </main>
  );
}

// --- Animation Variants ---
const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: "easeOut" }
    }
};

// --- Sub-components ---

function Header({ activeSection, isSignedIn }: { activeSection: string, isSignedIn: boolean | undefined }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user } = useUser();

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <header className="w-full px-4 sm:px-6 py-3 flex justify-between items-center shadow-sm sticky top-0 bg-white/95 z-50">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}>
                <a href="#" aria-label="Page d'accueil">
                    <Image src="/noBgColor.png" alt="Kenomi Logo" width={180} height={30} priority />
                </a>
            </motion.div>
            <nav className="hidden lg:flex items-center gap-6 text-gray-600 font-medium text-sm">
                {navLinks.map(link => (
                    <a key={link.href} href={link.href} className={`relative hover:text-indigo-600 transition-colors ${activeSection === link.href.substring(1) ? "text-indigo-600 font-semibold" : ""}`}>
                        {link.label}
                        {activeSection === link.href.substring(1) && (
                            <motion.div className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-indigo-600" layoutId="underline" />
                        )}
                    </a>
                ))}
            </nav>
            <div className="hidden lg:flex items-center gap-2">
                {isSignedIn && <a href="/dashboard" className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition">Tableau de bord</a>}
                <motion.a href="/don" whileHover={{ scale: 1.05 }} className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-blue-600 rounded-full shadow-md">Faire un don</motion.a>
                {/* MODIFIÉ: Bouton Connexion caché mais conservé dans le code */}
                {!isSignedIn && <a href="/login" className="px-4 py-2 text-sm font-semibold text-gray-700 hidden">Connexion</a>}
                <UserButton afterSignOutUrl="/" />
            </div>
            <button className="lg:hidden text-gray-700 z-50" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Ouvrir le menu">
                {isMenuOpen ? <X /> : <Menu />}
            </button>
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0, x: '100%' }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: '100%' }}
                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                            className="fixed top-0 right-0 h-full w-full max-w-xs bg-white shadow-xl z-40 p-8 flex flex-col"
                        >
                            <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                                <UserButton afterSignOutUrl="/" />
                                {isSignedIn && (
                                    <div>
                                        <p className="font-semibold text-gray-800">{user?.fullName || user?.username}</p>
                                        <p className="text-sm text-gray-500">Mon compte</p>
                                    </div>
                                )}
                            </div>
                            <nav className="flex flex-col gap-6 mt-8 text-lg font-medium text-gray-700">
                                {navLinks.map(link => (
                                    <a key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className="hover:text-indigo-600">{link.label}</a>
                                ))}
                            </nav>
                            <div className="mt-auto flex flex-col gap-4">
                                {isSignedIn && <a href="/dashboard" className="w-full text-center px-4 py-3 font-semibold text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition">Tableau de bord</a>}
                                <motion.a href="/don" whileHover={{ scale: 1.05 }} className="w-full text-center px-4 py-3 font-semibold text-white bg-gradient-to-r from-green-500 to-blue-600 rounded-full shadow-md">Faire un don</motion.a>
                                {/* MODIFIÉ: Bouton Connexion caché mais conservé dans le code */}
                                {!isSignedIn && <a href="/login" className="w-full text-center px-4 py-3 font-semibold text-gray-700 hidden">Connexion</a>}
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-md z-30"
                            onClick={() => setIsMenuOpen(false)}
                        />
                    </>
                )}
            </AnimatePresence>
        </header>
    );
}

function Hero() {
    return (
    <section className="relative w-full min-h-screen flex items-center">
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            // MODIFIÉ: Alignement centré sur mobile, justifié à gauche sur desktop
            className="max-w-2xl order-2 md:order-1 text-center md:text-left"
          >
            <Image
                src="/noBgBlack.png"
                alt="Session de formation à la cybersécurité en PME"
                width={450} height={250} priority
                className="mx-auto md:mx-0" // Centre l'image sur mobile
              />
            <h1 className="text-4xl md:text-5xl font-extrabold text-black mb-4 drop-shadow-[2px_2px_4px_rgba(0,0,0,0.35)]">
              Ensemble contre les pièges du numérique.
            </h1>
            {/* MODIFIÉ: Alignement justifié */}
            <p className="text-xl text-black text-justify mb-8">
              Kenomi renforce le tissu social et économique en Belgique.
              Nous sensibilisons à la cybersécurité et réinvestissons nos bénéfices
              pour l&apos;autonomie des jeunes.
            </p>
            {/* MODIFIÉ: Centré sur mobile */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="#about"
                  aria-label="Découvrir notre mission"
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-full font-semibold shadow-lg text-center block"
                >
                  Découvrir notre mission
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/don"
                  aria-label="Soutenir les jeunes"
                  className="px-8 py-3 bg-white text-gray-900 rounded-full font-semibold shadow-lg text-center block"
                >
                  Soutenir les jeunes
                </Link>
              </motion.div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.6, ease: "easeOut" }}
            className="relative order-1 md:order-2"
          >
            <div className="relative w-full h-[300px] md:h-[620px] rounded-xl">
              <Image
                src="/image1.png"
                alt="Session de formation à la cybersécurité en PME"
                fill
                style={{ objectFit: "cover" }}
                sizes="(min-width: 1024px) 560px, (min-width: 768px) 50vw, 100vw"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function SectionSeparator() {
    return <div className="w-full h-20 bg-gradient-to-b from-white to-gray-50"></div>;
}

// MODIFIÉ: Enveloppé dans memo
const About = memo(function About() {
    return (
        <motion.section id="about"
            className="w-full py-16 sm:py-24 bg-gray-50 px-6 lg:px-8"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
        >
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-base font-semibold leading-7 text-indigo-600">Notre Modèle</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    Le Cercle Vertueux du Numérique en Belgique
                </p>
                <div className="mt-16 bg-white p-8 sm:p-12 rounded-2xl shadow-lg text-left">
                    <h3 className="text-xl font-bold tracking-tight text-gray-900 text-center">Un double volet pour un impact 100% local</h3>
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                        <div>
                            <h4 className="text-lg font-semibold leading-7 text-gray-800">1. Volet Commercial 💼</h4>
                            {/* MODIFIÉ: Alignement justifié */}
                            <p className="mt-2 text-base leading-7 text-gray-600 text-justify">
                                C'est notre moteur économique.
                                Nous proposons des formations de pointe en <strong> sensibilisation à la cybersécurité et hygiène numérique </strong>
                                {/* MODIFIÉ: "Entreprises" -> "PME" */}
                                aux particuliers, PME, ASBL et organismes publics.
                                Ces services professionnels financent en partie notre action sociale.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold leading-7 text-gray-800">2. Volet Social ❤️</h4>
                            {/* MODIFIÉ: Alignement justifié */}
                            <p className="mt-2 text-base leading-7 text-gray-600 text-justify">
                                Notre raison d'être. Les bénéfices sont réinvestis dans notre programme <strong>
                                "Tremplin Numérique"</strong> qui offre des "Kits d'Autonomie"
                                (ordinateur, logiciels, formation) à des jeunes en situation de précarité,
                                via nos partenaires sociaux. Parce que nous croyons que le numérique doit être une opportunité pour tous.
                            </p>
                        </div>
                    </div>
                    <div className="mt-10 pt-6 border-t border-gray-200 text-center">
                        {/* MODIFIÉ: Alignement centré */}
                        <p className="text-base font-semibold text-gray-700 text-center">
                           En choisissant Kenomi, vous n'augmentez pas seulement vos compétences ;
                           vous réalisez un investissement social direct et visible sur votre propre territoire.
                        </p>
                    </div>
                </div>
            </div>
        </motion.section>
    );
});

// --- AJOUT: Nouvelle fonction DonationImpact (enveloppée dans memo) ---
const DonationImpact = memo(function DonationImpact() {
    return (
        <motion.section
            className="w-full py-16 sm:py-24 bg-gray-50 px-6 lg:px-8"
            variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
        >
            <section className="py-16 md:py-24" style={{ backgroundImage: "url('cardbg.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="container mx-auto px-6 text-center bg-white/90 backdrop-blur-sm p-12 rounded-lg shadow-xl">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Votre Don a un Impact Concret et Local</h2>
                    {/* MODIFIÉ: Alignement centré */}
                    <p className="mt-2 text-lg text-gray-600 max-w-2xl mx-auto text-center">Chaque contribution nous aide à réduire la fracture numérique en Belgique. Voyez comment votre don se transforme en action.</p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                        <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                            <p className="text-4xl font-extrabold text-blue-700">25 €</p>
                            {/* MODIFIÉ: Alignement centré */}
                            <p className="mt-2 text-black font-semibold text-center">Finance une session de sensibilisation à la sécurité pour un senior.</p>
                        </div>
                        <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                            <p className="text-4xl font-extrabold text-blue-700">50 €</p>
                            {/* MODIFIÉ: Alignement centré */}
                            <p className="mt-2 text-black font-semibold text-center">Contribue à l'achat d'une licence logicielle pour un kit d'autonomie.</p>
                        </div>
                        <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200 sm:col-span-2 lg:col-span-1">
                            <p className="text-4xl font-extrabold text-blue-700">150 €</p>
                            {/* MODIFIÉ: Alignement centré */}
                            <p className="mt-2 text-black font-semibold text-center">Finance un "Kit d'Autonomie Numérique" complet pour un jeune.</p>
                        </div>
                    </div>
                    <a href="/don" className="mt-12 inline-block bg-yellow-400 text-blue-900 px-10 py-4 rounded-full font-bold text-xl hover:bg-yellow-300 transition-transform transform hover:scale-105">
                        Je Fais un Don
                    </a>
                </div>
            </section>
        </motion.section>
    );
});

// --- AJOUT: Nouvelle fonction ActionPoles (enveloppée dans memo) ---
const ActionPoles = memo(function ActionPoles() {
    const iconColors = {
        red: "bg-red-100 text-red-600",
        blue: "bg-blue-100 text-blue-600",
        teal: "bg-teal-100 text-teal-600",
        yellow: "bg-yellow-100 text-yellow-600"
    };
    return (
        <motion.section
            // MODIFIÉ: id mis à jour
            id="action-poles"
            className="w-full py-16 sm:py-24 bg-gray-50 px-6 lg:px-8"
            variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
        >
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-xl font-semibold leading-7  text-indigo-600">Nos Pôles d'Action</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Des solutions concrètes pour un impact local
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {solutionsData.map((sol, i) => (
                        <motion.div
                            key={sol.title}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.5 }}
                            transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                            className="group p-8 bg-white rounded-2xl border border-gray-200/80 hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                        >
                            <div className={`${iconColors[sol.color as keyof typeof iconColors]} p-3 rounded-lg inline-block mb-4`}>
                                <sol.icon className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">{sol.title}</h3>
                            {/* MODIFIÉ: Alignement justifié */}
                            <p className="mt-2 text-sm text-gray-600 text-justify">{sol.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.section>
    );
});


// --- AJOUT: Nouvelle Section "Aperçu des Formations" (enveloppée dans memo) ---
const TrainingPreviews = memo(function TrainingPreviews() {
  // Gère l'état de la formation sélectionnée pour la modale
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);

  return (
    <motion.section
      id="previews"
      className="w-full py-16 sm:py-24 bg-white px-6 lg:px-8"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Nos Programmes</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Un aperçu de nos formations
          </p>
          {/* MODIFIÉ: Alignement centré */}
          <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-gray-600 text-center">
            Chaque programme est conçu sur mesure pour son public, alliant théorie essentielle et pratique concrète.
          </p>
        </div>

        {/* Grille des cartes de formation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trainingData.map((training) => (
            <TrainingCard
              key={training.id}
              training={training}
              onSelect={() => setSelectedTraining(training)}
            />
          ))}
        </div>
      </div>

      {/* Logique d'affichage de la modale */}
      <AnimatePresence>
        {selectedTraining && (
          <TrainingModal
            training={selectedTraining}
            onClose={() => setSelectedTraining(null)}
          />
        )}
      </AnimatePresence>
    </motion.section>
  );
});

// --- AJOUT: Composant pour la carte de formation ---
// Note: Ce composant n'est pas mémoïsé car il est déjà simple et sa re-création est gérée par le parent.
function TrainingCard({ training, onSelect }: { training: Training; onSelect: () => void; }) {
  const Icon = training.icon;
  return (
    <motion.div
      onClick={onSelect}
      className="bg-gray-50 rounded-2xl border border-gray-200/80 p-8 flex flex-col cursor-pointer group hover:shadow-2xl hover:border-indigo-300 transition-all duration-300"
      whileHover={{ y: -8 }}
    >
      <div className={`p-3 rounded-lg inline-block mb-4 ${training.iconColor.replace("text-", "bg-").replace("600", "100")}`}>
        <Icon className={`h-8 w-8 ${training.iconColor}`} />
      </div>
      <span className="text-sm font-semibold text-indigo-600">{training.targetAudience}</span>
      <h3 className="text-xl font-semibold text-gray-900 mt-2">{training.title}</h3>
      {/* MODIFIÉ: Alignement justifié */}
      <p className="mt-2 text-sm text-gray-600 flex-grow text-justify">{training.shortDesc}</p>
      <span className="mt-6 text-indigo-600 font-semibold flex items-center group-hover:underline">
        Voir le contenu
        <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
      </span>
    </motion.div>
  );
}

// --- AJOUT: Composant pour la modale de formation ---
function TrainingModal({ training, onClose }: { training: Training; onClose: () => void; }) {
  const Icon = training.icon;

  // Permet de fermer la modale en cliquant sur l'arrière-plan
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleBackdropClick}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        // Empêche la fermeture si on clique à l'intérieur de la modale
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête de la modale */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg inline-block ${training.iconColor.replace("text-", "bg-").replace("600", "100")}`}>
              <Icon className={`h-8 w-8 ${training.iconColor}`} />
            </div>
            <div>
              <span className="text-sm font-semibold text-indigo-600">{training.targetAudience}</span>
              <h2 className="text-2xl font-bold text-gray-900">{training.title}</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Fermer">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Contenu de la modale (scrollable) */}
        <div className="p-8 overflow-y-auto">
          {training.fullContent}
        </div>

        {/* Pied de page de la modale */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition"
          >
            Fermer
          </button>
          <a
            href="#contact"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition"
          >
            Demander un devis
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}
// --- FIN DES AJOUTS ---


// MODIFIÉ: Enveloppé dans memo
const Impact = memo(function Impact() {
    return (
        <motion.section id="impact" className="w-full py-16 sm:py-24 bg-white px-6 lg:px-8"
            variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-base font-semibold leading-7 text-indigo-600">Nos Résultats</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Notre Impact en Belgique
                    </p>
                    {/* MODIFIÉ: Alignement centré */}
                    <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-gray-600 text-center">
                        Chaque chiffre représente une compétence acquise, un jeune équipé ou un partenariat renforcé sur notre territoire.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                    {statsData.map((stat, i) => (
                        <AnimatedStat key={stat.label} {...stat} delay={i * 0.15} />
                    ))}
                </div>
            </div>
        </motion.section>
    );
});

function AnimatedStat({ value, label, color, delay = 0 }: { value: number, label: string, color: string, delay?: number }) {
    const ref = useRef<HTMLParagraphElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (isInView) {
            const controls = animate(0, value, {
                duration: 2.5,
                ease: "easeOut",
                onUpdate: (latest) => setCount(Math.floor(latest)),
            });
            return () => controls.stop();
        }
    }, [isInView, value]);
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.7, ease: "easeOut" }} className="p-6 bg-gray-50 rounded-2xl border border-gray-200/80">
            <p ref={ref} className={`text-5xl font-extrabold ${color}`}>
                {count.toLocaleString("fr-BE")}
            </p>
            {/* MODIFIÉ: Alignement centré */}
            <p className="mt-2 text-base font-medium text-gray-700 text-center">{label}</p>
        </motion.div>
    );
}

// MODIFIÉ: Enveloppé dans memo
const Mission = memo(function Mission() {
    const [current, setCurrent] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => setCurrent(prev => (prev + 1) % testimonialsData.length), 6000);
        return () => clearInterval(timer);
    }, []);
    return (
        <motion.section id="mission" className="w-full py-16 sm:py-24 bg-gray-50 px-6 lg:px-8"
            variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Rejoignez le Cercle Vertueux</h2>
                <div className="relative h-48 sm:h-40 mb-10 overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                            className="absolute inset-0"
                        >
                            <Testimonial {...testimonialsData[current]} />
                        </motion.div>
                    </AnimatePresence>
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <motion.a whileHover={{ scale: 1.05, y: -2 }} href="#contact" className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-full font-semibold shadow-md">Devenir partenaire</motion.a>
                    <motion.a whileHover={{ scale: 1.05, y: -2 }} href="/don" className="px-6 py-3 bg-white text-gray-800 border border-gray-300 rounded-full font-semibold shadow-sm">Faire un don</motion.a>
                </div>
            </div>
        </motion.section>
    );
});

function Testimonial({ name, text }: { name: string; text: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            {/* MODIFIÉ: Alignement centré */}
            <p className="text-gray-700 italic text-lg max-w-2xl text-center">&quot;{text}&quot;</p>
            <p className="mt-4 text-sm text-gray-600 font-semibold">{name}</p>
        </div>
    );
}

// MODIFIÉ: Enveloppé dans memo
const TransparentSection = memo(function TransparentSection() {
    return(
    <section className="bg-gray-100 py-16 md:py-24">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Notre Engagement : La Transparence</h2>
                {/* MODIFIÉ: Alignement centré */}
                <p className="mt-2 text-lg text-gray-600 max-w-2xl mx-auto text-center">La confiance est au cœur de notre démarche. Découvrez qui nous sommes et comment nous travaillons.</p>
                <div className="mt-12 grid md:grid-cols-2 gap-8 text-left">
                    <div className="bg-white p-8 rounded-lg shadow-md">
                        <h3 className="text-2xl font-bold text-blue-700 mb-4">Qui Sommes-Nous ?</h3>
                        {/* MODIFIÉ: Alignement justifié */}
                        <p className="text-gray-700 mb-4 text-justify">Kenomi est une ASBL fondée par des passionnés de technologie et d'impact social, convaincus que le numérique doit être une opportunité pour tous en Belgique. Nous sommes animés par des valeurs de partage, d'intégrité et de solidarité locale.</p>
                        <a href="#" className="text-blue-600 font-bold hover:underline">Découvrir l'équipe →</a>
                    </div>
                    <div className="bg-white p-8 rounded-lg shadow-md">
                        <h3 className="text-2xl font-bold text-blue-700 mb-4">Nos Rapports</h3>
                        {/* MODIFIÉ: Alignement justifié */}
                        <p className="text-gray-700 mb-4 text-justify">Chaque année, nous publions un rapport d'activité détaillé. Vous y trouverez nos chiffres clés, nos succès, nos défis et un aperçu financier complet de notre impact en Belgique. Votre confiance est notre priorité.</p>
                        <a href="#" className="text-blue-600 font-bold hover:underline">Consulter le rapport 2024 →</a>
                    </div>
                </div>
            </div>
        </section>
)});

// MODIFIÉ: Enveloppé dans memo
const Newsletter = memo(function Newsletter() {
    return (
        <motion.section className="w-full py-16 bg-white px-6 lg:px-8"
            variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
            <div className="max-w-2xl mx-auto text-center bg-gray-100 p-8 sm:p-12 rounded-2xl">
                <h3 className="text-2xl font-bold text-gray-900">Restez informé·e de notre impact local</h3>
                {/* MODIFIÉ: Alignement centré */}
                <p className="mt-2 text-gray-600 text-center">Recevez les dernières nouvelles de nos projets en Belgique.</p>
                <form className="mt-6 flex flex-col sm:flex-row gap-3 w-full">
                    <input type="email" placeholder="Votre adresse e-mail" className="flex-grow px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none w-full" />
                    <motion.button whileHover={{ scale: 1.05 }} type="submit" className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold shadow-sm hover:bg-indigo-700">S'abonner</motion.button>
                </form>
            </div>
        </motion.section>
    );
});

// MODIFIÉ: Enveloppé dans memo
const Footer = memo(function Footer() {
    return (
        <footer id="contact" className="w-full bg-black text-gray-300 py-12 px-6 lg:px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    {/* MODIFIÉ: Retrait de unoptimized */}
                    <Image src="/noBgWhite.png" alt="Logo Kenomi" width={150} height={32} />
                    <p className="mt-4 text-sm text-gray-400">Le cercle vertueux du numérique en Belgique.</p>
                    <div className="flex gap-4 mt-4">
                       <a href="https://www.linkedin.com/company/kenomi-eu" aria-label="LinkedIn" className="hover:text-white"><Image src="/linkedin.png" alt="LinkedIn" width={24} height={24} /></a>
                        <a href="https://www.instagram.com/kenomi_eu/" aria-label="Instagram" className="hover:text-white"><Image src="/instagram.png" alt="Instagram" width={24} height={24} /></a>
                        <a href="https://x.com/kenomi_eu" aria-label="Twitter" className="hover:text-white"><Image src="/twitter.png" alt="Twitter" width={24} height={24} /></a>
                        <a href="https://www.facebook.com/people/Kenomi/61578022332134/" aria-label="Facebook" className="hover:text-white"><Image src="/facebook.png" alt="Facebook" width={24} height={24} /></a>
                        <a href="#" aria-label="TikTok" className="hover:text-white"><Image src="/tik-tok.png" alt="TikTok" width={24} height={24} /></a>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <h4 className="font-semibold text-white">Navigation</h4>
                        <ul className="mt-4 space-y-2 text-sm">
                            {/* AJOUT: S'assurer que le nouveau lien est aussi dans le footer */}
                            {navLinks.map(link => <li key={link.label}><a href={link.href} className="hover:underline">{link.label}</a></li>)}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white">Légal</h4>
                        <ul className="mt-4 space-y-2 text-sm">
                            <li><a href="#" className="hover:underline">Mentions légales</a></li>
                            <li><a href="#" className="hover:underline">Politique de confidentialité</a></li>
                            <li><a href="mailto:contact@kenomi.eu" className="hover:underline">Contact</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            {/* MODIFIÉ: Alignement centré */}
            <div className="mt-12 border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
                &copy; {new Date().getFullYear()} Kenomi ASBL. Tous droits réservés.
            </div>
        </footer>
    );
});

function StickyButtons() {
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        const toggleVisibility = () => window.scrollY > 300 ? setIsVisible(true) : setIsVisible(false);
        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3">
            <AnimatePresence>
                {isVisible && (
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        onClick={scrollToTop}
                        className="h-12 w-12 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-200"
                        aria-label="Remonter en haut"
                    >
                        <ArrowUp className="h-6 w-6" />
                    </motion.button>
                )}
            </AnimatePresence>
            <motion.a
                href="/don"
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-green-500 to-blue-600 text-white font-bold shadow-xl"
            >
                <Heart className="h-5 w-5" />
                <span className="hidden sm:inline">Faire un don</span>
            </motion.a>
        </div>
    );
}

