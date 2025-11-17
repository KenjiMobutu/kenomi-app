'use client';

import Image from "next/image";
import Link from "next/link";
import { motion, useInView, AnimatePresence, animate, Variants } from "framer-motion";
import { useEffect, useState, useRef, ReactNode, memo, FormEvent } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { Briefcase, Users2, Heart, ArrowUp, Menu, X , Package, Handshake, Users, Smile } from 'lucide-react';
// AJOUT: Import nécessaire pour détecter la page actuelle
import { usePathname } from 'next/navigation';

// --- Types ---
type Training = {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  targetAudience: string;
  title: string;
  shortDesc: string;
  fullContent: ReactNode;
};

// --- Data (Déplacée ici car utilisée par des composants clients) ---
const navLinks = [
  { href: "#about", label: "Notre Modèle" },
  { href: "#action-poles", label: "Nos Actions" },
  { href: "/formations", label: "Formations" }, // MODIFIÉ (précédemment "#previews")
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
    { icon: Briefcase, title: "Formations pour PME & ASBL", desc: "Protégez vos données et renforcez vos équipes avec nos formations en cybersécurité, RGPD et hygiène numérique.", color: "teal" },
    { icon: Users2, title: "Ateliers pour Tous les Publics", desc: "Nous rendons le numérique plus sûr pour les seniors, les parents et les chercheurs d'emploi via des ateliers pratiques.", color: "yellow" },
    { icon: Package, title: "Le Programme \"Tremplin Numérique\"", desc: "Nous équipons des jeunes défavorisés avec un kit complet : ordinateur, logiciels et formation pour garantir leur autonomie.", color: "blue" },
    { icon: Handshake, title: "Votre Investissement Social Direct", desc: "Chaque formation achetée finance directement notre programme social. Un impact concret et visible sur votre territoire.", color: "red" }
  ];

// ... (trainingData et testimonialsData restent inchangés) ...
const trainingData: Training[] = [
  {
    id: "pro",
    icon: Briefcase,
    iconColor: "text-teal-600",
    targetAudience: "PME & ASBL",
    title: "Cybersécurité en Milieu Professionnel",
    shortDesc: "Une formation intensive de 10-12h pour donner à vos équipes les réflexes indispensables contre les menaces actuelles.",
    fullContent: (
      <div className="space-y-4 text-gray-700 text-justify">
        <p className="font-semibold text-lg">Objectif : Transformer chaque employé en un maillon fort de votre sécurité.</p>
        <p>Ce programme complet (10-12h) couvre tous les aspects essentiels de la sécurité numérique en PME, du phishing à la protection des données (RGPD).</p>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li><strong>Module 1 :</strong> Introduction & Enjeux (Coûts d&apos;une attaque, risques légaux).</li>
          <li><strong>Module 2 :</strong> Identification des Menaces (Phishing, Ransomwares, Ingénierie Sociale).</li>
          <li><strong>Module 3 :</strong> Hygiène Numérique (Mots de passe, 2FA, Mises à jour).</li>
          <li><strong>Module 4 :</strong> Sécurité en Télétravail (VPN, Wi-Fi, fuites de données).</li>
          <li><strong>Module 5 :</strong> Ateliers Pratiques & Simulation d&apos;attaque.</li>
          <li><strong>Module 6 :</strong> Le cadre légal (RGPD) et la gestion d&apos;incident.</li>
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
      <div className="space-y-4 text-gray-700 text-justify">
        <p className="font-semibold text-lg">Objectif : Donner confiance et autonomie aux seniors face au numérique.</p>
        <p>Ce programme est conçu sans jargon, axé sur la pratique et les situations réelles que les seniors rencontrent au quotidien.</p>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li><strong>Atelier 1 :</strong> Démystifier Internet & Gérer ses Emails (Reconnaître un spam).</li>
          <li><strong>Atelier 2 :</strong> Le Détecteur d&apos;Arnaques (Faux sites bancaires, fausses alertes virus, arnaques WhatsApp).</li>
          <li><strong>Atelier 3 :</strong> Le Coffre-Fort des Mots de Passe (Créer et retenir une &quot;phrase de passe&quot; ultra-sécurisée).</li>
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
      <div className="space-y-4 text-gray-700 text-justify">
        <p className="font-semibold text-lg">Objectif : Transformer les enfants en citoyens numériques responsables et avertis par le jeu.</p>
        <p>Ce camp d&apos;entraînement utilise un univers &quot;d&apos;agents secrets&quot; pour enseigner les concepts clés de la sécurité et de l&apos;empathie en ligne.</p>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li><strong>Mission 1 :</strong> Identifier les &quot;Méchants du Web&quot; (Phishing, fausses pubs).</li>
          <li><strong>Mission 2 :</strong> Le Tri des Secrets (Jeu sur les données publiques vs. privées).</li>
          <li><strong>Mission 3 :</strong> Le Gardien du Trésor (Créer une &quot;phrase de passe&quot; magique).</li>
          <li><strong>Mission 4 :</strong> Le Mur des Choix (Jeu de simulation sur le cyber-harcèlement et les rumeurs).</li>
          <li><strong>Mission 5 :</strong> L&apos;Atelier du Super Post (Apprendre à réfléchir avant de publier).</li>
        </ul>
        <p className="mt-4 font-semibold">Inclus : Diplôme officiel &quot;d&apos;Agent Secret d&apos;Internet&quot; et un guide pour les parents.</p>
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
        // CORRECTION: Ne rien faire si la liste des IDs est vide (ex: sur les pages autres que l'accueil)
        if (ids.length === 0) {
            setActiveId(""); // Réinitialiser l'ID actif
            return;
        }

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
    }, [ids, options]); // 'ids' est maintenant une dépendance clé

    return activeId;
};

// --- Animation Variants ---
const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: "easeOut" }
    }
};

// --- Composants Clients (Interactifs) ---

export function Header() {
    const { isSignedIn, user } = useUser();

    // --- DÉBUT DE LA CORRECTION MAJEURE ---
    const pathname = usePathname();
    const isHomePage = pathname === '/';

    // 1. Le ScrollSpy ne doit être actif QUE sur la page d'accueil
    const activeSection = useScrollSpy(
        isHomePage ? navLinks.map(l => l.href.startsWith('#') ? l.href.substring(1) : '') : [],
        { rootMargin: "-30% 0px -70% 0px" }
    );
    // --- FIN DE LA CORRECTION MAJEURE ---

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // --- NOUVELLE FONCTION HELPER ---
    // Détermine le Href correct en fonction de la page actuelle
    const getLinkHref = (href: string) => {
      // Si ce n'est pas un lien d'ancre (comme /formations), le retourner tel quel
      if (!href.startsWith('#')) {
        return href;
      }
      // Si nous sommes sur la homepage, retourner l'ancre seule.
      // Sinon, préfixer avec '/' pour retourner à l'accueil.
      return isHomePage ? href : `/${href}`;
    };

    // Détermine si un lien est "actif"
    const getIsActive = (href: string) => {
        // Pour les ancres (ex: #about)
        if (href.startsWith('#')) {
            // L'état actif ne fonctionne que sur la page d'accueil
            return isHomePage && activeSection === href.substring(1);
        }
        // Pour les pages complètes (ex: /formations)
        return pathname === href;
    };
    // --- FIN HELPER ---


    return (
        <header className="w-full px-4 sm:px-6 py-3 flex justify-between items-center shadow-sm sticky top-0 bg-white/95 z-50">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}>
                {/* CORRECTION: Toujours utiliser <Link> et pointer vers la racine "/" */}
                <Link href="/" aria-label="Page d'accueil">
                    <Image src="/noBgColor.png" alt="Kenomi Logo" width={180} height={30} priority />
                </Link>
            </motion.div>
            <nav className="hidden lg:flex items-center gap-6 text-gray-600 font-medium text-sm">

                {/* --- MODIFICATION DE LA LOGIQUE DE LIEN --- */}
                {navLinks.map(link => {
                    const href = getLinkHref(link.href);
                    const isActive = getIsActive(link.href);

                    return (
                        <Link // <-- Utiliser Link au lieu de <a>
                          key={link.href}
                          href={href}
                          className={`relative hover:text-indigo-600 transition-colors ${
                            isActive ? "text-indigo-600 font-semibold" : ""
                          }`}
                        >
                            {link.label}
                            {isActive && (
                                <motion.div className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-indigo-600" layoutId="underline" />
                            )}
                        </Link>
                    );
                })}
                {/* --- FIN MODIFICATION --- */}

            </nav>
            <div className=" lg:flex items-center gap-2">
                {isSignedIn && <Link href="/dashboard" className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition">Tableau de bord</Link>}
                <motion.a href="/don" whileHover={{ scale: 1.05 }} className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-blue-600 rounded-full shadow-md">Don</motion.a>
                {!isSignedIn && <Link href="/login" className="px-4 py-2 text-sm font-semibold text-gray-700">Connexion</Link>}
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

                                {/* --- MODIFICATION MENU MOBILE --- */}
                                {navLinks.map(link => (
                                    <Link // <-- Utiliser Link au lieu de <a>
                                      key={link.href}
                                      href={getLinkHref(link.href)} // <-- Utiliser le helper
                                      onClick={() => setIsMenuOpen(false)}
                                      className="hover:text-indigo-600"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                                {/* --- FIN MODIFICATION --- */}

                            </nav>
                            <div className="mt-auto flex flex-col gap-4">
                                {isSignedIn && <Link href="/dashboard" className="w-full text-center px-4 py-3 font-semibold text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition">Tableau de bord</Link>}
                                <motion.a href="/don" whileHover={{ scale: 1.05 }} className="w-full text-center px-4 py-3 font-semibold text-white bg-gradient-to-r from-green-500 to-blue-600 rounded-full shadow-md">Faire un don</motion.a>
                                {!isSignedIn && <Link href="/login" className="w-full text-center px-4 py-3 font-semibold text-gray-700 hidden">Connexion</Link>}
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

export const Hero = memo(function Hero() {
    return (
    <section className="relative w-full min-h-screen flex items-center">
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-2xl order-2 md:order-1 text-center md:text-left"
          >
            <Image
                src="/noBgBlack.png"
                alt="Session de formation à la cybersécurité en PME"
                width={450} height={250} priority
                className="mx-auto md:mx-0"
              />
            <h1 className="text-4xl md:text-5xl font-extrabold text-black mb-4 drop-shadow-[2px_2px_4px_rgba(0,0,0,0.35)]">
              Formez-vous contre les pièges du numérique.
            </h1>
            <p className="text-xl text-black text-justify mb-8">
              Grâce à ses formations, Kenomi renforce le tissu social et économique en Belgique.
              Nous sensibilisons à la cybersécurité et réinvestissons nos bénéfices
              pour l&apos;autonomie numérique des jeunes et des seniors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="formations"
                  aria-label="Découvrir nos formations"
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-full font-semibold shadow-lg text-center block"
                >
                  Découvrir nos formations
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
                className="object-contain md:object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 560px"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
});

export const About = memo(function About() {
    return (
        <motion.section id="about"
            className="w-full py-16 sm:py-24 bg-gray-50 px-4 sm:px-6 lg:px-8"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
        >
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-base font-semibold leading-7 text-indigo-600">Notre Modèle</h2>
                {/* CORRECTION CSS: Suppression de sm:text-3xl qui était en conflit avec sm:text-4xl */}
                <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    Le Cercle Vertueux du Numérique en Belgique
                </p>
                <div className="mt-12 sm:mt-16 bg-white p-6 sm:p-8 lg:p-12 rounded-2xl shadow-lg text-left">
                    <h3 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 text-center">Un double volet pour un impact 100% local</h3>
                    <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-8 lg:gap-y-10">
                        <div>
                            <h4 className="text-base sm:text-lg text-center font-semibold leading-7 text-gray-800">1. Volet Commercial 💼</h4>
                            <p className="mt-2 text-sm sm:text-base leading-7 text-gray-600 text-justify">
                                C&apos;est notre moteur économique.
                                Nous proposons des formations de pointe en <strong> sensibilisation à la cybersécurité et hygiène numérique </strong>
                                aux particuliers, PME, ASBL et organismes publics.
                                Ces services professionnels financent en partie notre action sociale.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-base sm:text-lg text-center font-semibold leading-7 text-gray-800">2. Volet Social ❤️</h4>
                            <p className="mt-2 text-sm sm:text-base leading-7 text-gray-600 text-justify">
                                Notre raison d&apos;être. Les bénéfices sont réinvestis dans notre programme <strong>
                                &quot;Tremplin Numérique&quot;</strong> qui offre des &quot;Kits d&apos;Autonomie&quot;
                                (ordinateur, logiciels, formation) à des jeunes en situation de précarité,
                                via nos partenaires sociaux. Parce que nous croyons que le numérique doit être une opportunité pour tous.
                            </p>
                        </div>
                    </div>
                    <div className="mt-8 sm:mt-10 pt-6 border-t border-gray-200 text-center">
                        <p className="text-sm sm:text-base font-semibold text-gray-700 text-center">
                           En choisissant Kenomi, vous n&apos;augmentez pas seulement vos compétences ;
                           vous réalisez un investissement social direct et visible sur votre propre territoire.
                        </p>
                    </div>
                </div>
            </div>
        </motion.section>
    );
});

export const DonationImpact = memo(function DonationImpact() {
    return (
        <motion.section
            className="w-full py-16 sm:py-24 bg-gray-50 px-4 sm:px-6 lg:px-8"
            variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
        >
            <section className="py-12 sm:py-16 md:py-24" style={{ backgroundImage: "url('cardbg.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="container mx-auto px-4 sm:px-6 text-center bg-white/90 backdrop-blur-sm p-8 sm:p-12 rounded-lg shadow-xl">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">Votre Don a un Impact Concret et Local</h2>
                    <p className="mt-2 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto text-center">Chaque contribution nous aide à réduire la fracture numérique en Belgique. Voyez comment votre don se transforme en action.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-12">
                        <div className="bg-blue-50 p-4 sm:p-6 rounded-lg border-2 border-blue-200">
                            <p className="text-3xl sm:text-4xl font-extrabold text-blue-700">25 €</p>
                            <p className="mt-2 text-black font-semibold text-center text-sm sm:text-base">Finance une session de sensibilisation à la sécurité pour un senior.</p>
                        </div>
                        <div className="bg-blue-50 p-4 sm:p-6 rounded-lg border-2 border-blue-200">
                            <p className="text-3xl sm:text-4xl font-extrabold text-blue-700">50 €</p>
                            <p className="mt-2 text-black font-semibold text-center text-sm sm:text-base">Contribue à l&apos;achat d&apos;une licence logicielle pour un kit d&apos;autonomie.</p>
                        </div>
                        <div className="bg-blue-50 p-4 sm:p-6 rounded-lg border-2 border-blue-200 sm:col-span-2 lg:col-span-1">
                            <p className="text-3xl sm:text-4xl font-extrabold text-blue-700">150 €</p>
                            <p className="mt-2 text-black font-semibold text-center text-sm sm:text-base">Finance un &quot;Kit d&apos;Autonomie Numérique&quot; complet pour un jeune.</p>
                        </div>
                    </div>
                    <a href="/don" className="mt-8 sm:mt-12 inline-block bg-yellow-400 text-blue-900 px-8 sm:px-10 py-3 sm:py-4 rounded-full font-bold text-lg sm:text-xl hover:bg-yellow-300 transition-transform transform hover:scale-105">
                        Je Fais un Don
                    </a>
                </div>
            </section>
        </motion.section>
    );
});

export const ActionPoles = memo(function ActionPoles() {
    const iconColors = {
        red: "bg-red-100 text-red-600",
        blue: "bg-blue-100 text-blue-600",
        teal: "bg-teal-100 text-teal-600",
        yellow: "bg-yellow-100 text-yellow-600"
    };
    return (
        <motion.section
            id="action-poles"
            className="w-full py-16 sm:py-24 bg-gray-50 px-4 sm:px-6 lg:px-8"
            variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
        >
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12 sm:mb-16">
                    <h2 className="text-lg sm:text-xl font-semibold leading-7 text-indigo-600">Nos Pôles d&apos;Action</h2>
                    {/* CORRECTION CSS: Suppression de sm:text-3xl qui était en conflit avec sm:text-4xl */}
                    <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Des solutions concrètes pour un impact local
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                    {solutionsData.map((sol, i) => (
                        <motion.div
                            key={sol.title}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.5 }}
                            transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                            className="group p-6 sm:p-8 bg-white rounded-2xl border border-gray-200/80 hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                        >
                            <div className="flex justify-center mb-4">
                                <div className={`${iconColors[sol.color as keyof typeof iconColors]} p-3 rounded-lg inline-block`}>
                                    <sol.icon className="h-6 w-6 sm:h-8 sm:w-8" />
                                </div>
                            </div>
                            <h3 className="text-base sm:text-lg text-center font-semibold text-gray-900">{sol.title}</h3>
                            <p className="mt-2 text-sm text-gray-600 text-justify">{sol.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.section>
    );
});

export const TrainingPreviews = memo(function TrainingPreviews() {
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);

  return (
    <motion.section
      id="previews" // L'ID reste ici pour le scrollspy de la page d'accueil
      className="w-full py-16 sm:py-24 bg-white px-4 sm:px-6 lg:px-8"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Nos Programmes</h2>
          {/* CORRECTION CSS: Suppression de sm:text-3xl qui était en conflit avec sm:text-4xl */}
          <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Un aperçu de nos formations
          </p>
          <p className="mt-4 sm:mt-6 max-w-2xl mx-auto text-base sm:text-lg leading-8 text-gray-600 text-center">
            Chaque programme est conçu sur mesure pour son public, alliant théorie essentielle et pratique concrète.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {trainingData.map((training) => (
            <TrainingCard
              key={training.id}
              training={training}
              onSelect={() => setSelectedTraining(training)}
            />
          ))}
        </div>
      </div>

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

function TrainingCard({ training, onSelect }: { training: Training; onSelect: () => void; }) {
  const Icon = training.icon;
  return (
    <motion.div
      onClick={onSelect}
      className="bg-gray-50 rounded-2xl border border-gray-200/80 p-6 sm:p-8 flex flex-col cursor-pointer group hover:shadow-2xl hover:border-indigo-300 transition-all duration-300"
      whileHover={{ y: -8 }}
    >
      <div className={`p-3 rounded-lg inline-block mb-4 ${training.iconColor.replace("text-", "bg-").replace("600", "100")}`}>
        <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${training.iconColor}`} />
      </div>
      <span className="text-xs sm:text-sm font-semibold text-indigo-600">{training.targetAudience}</span>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mt-2">{training.title}</h3>
      <p className="mt-2 text-sm text-gray-600 flex-grow text-justify">{training.shortDesc}</p>
      <span className="mt-4 sm:mt-6 text-indigo-600 font-semibold flex items-center group-hover:underline">
        Voir le contenu
        <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
      </span>
    </motion.div>
  );
}

function TrainingModal({ training, onClose }: { training: Training; onClose: () => void; }) {
  const Icon = training.icon;

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
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={`p-2 sm:p-3 rounded-lg inline-block ${training.iconColor.replace("text-", "bg-").replace("600", "100")}`}>
              <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${training.iconColor}`} />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-semibold text-indigo-600">{training.targetAudience}</span>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900">{training.title}</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Fermer">
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {training.fullContent}
        </div>

        <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition"
          >
            Fermer
          </button>
          {/* MODIFICATION: Lien vers la nouvelle page de contact B2B */}
          <Link
            href="/formations#contact-form"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition text-center"
          >
            Demander un devis
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

export const Impact = memo(function Impact() {
    return (
        <motion.section id="impact" className="w-full py-16 sm:py-24 bg-white px-4 sm:px-6 lg:px-8"
            variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12 sm:mb-16">
                    <h2 className="text-base font-semibold leading-7 text-indigo-600">Nos Résultats</h2>
                    {/* CORRECTION CSS: Suppression de sm:text-3xl qui était en conflit avec sm:text-4xl */}
                    <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Notre Impact en Belgique
                    </p>
                    <p className="mt-4 sm:mt-6 max-w-2xl mx-auto text-base sm:text-lg leading-8 text-gray-600 text-center">
                        Chaque chiffre représente une compétence acquise, un jeune équipé ou un partenariat renforcé sur notre territoire.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
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
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.7, ease: "easeOut" }} className="p-4 sm:p-6 bg-gray-50 rounded-2xl border border-gray-200/80">
            <p ref={ref} className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold ${color}`}>
                {count.toLocaleString("fr-BE")}
            </p>
            <p className="mt-2 text-sm sm:text-base font-medium text-gray-700 text-center">{label}</p>
        </motion.div>
    );
}

export const Mission = memo(function Mission() {
    const [current, setCurrent] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => setCurrent(prev => (prev + 1) % testimonialsData.length), 6000);
        return () => clearInterval(timer);
    }, []);
    return (
        <motion.section id="mission" className="w-full py-16 sm:py-24 bg-gray-50 px-4 sm:px-6 lg:px-8"
            variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Rejoignez le Cercle Vertueux</h2>
                <div className="relative h-40 sm:h-48 mb-8 sm:mb-10 overflow-hidden">
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
                    {/* MODIFICATION: Lien vers la nouvelle page de contact B2B */}
                    <motion.a whileHover={{ scale: 1.05, y: -2 }} href="/formations#contact-form" className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-full font-semibold shadow-md">Devenir partenaire</motion.a>
                    <motion.a whileHover={{ scale: 1.05, y: -2 }} href="/don" className="px-6 py-3 bg-white text-gray-800 border border-gray-300 rounded-full font-semibold shadow-sm">Faire un don</motion.a>
                </div>
            </div>
        </motion.section>
    );
});

function Testimonial({ name, text }: { name: string; text: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-full px-4">
            <p className="text-gray-700 italic text-base sm:text-lg max-w-2xl text-center">&quot;{text}&quot;</p>
            <p className="mt-4 text-sm text-gray-600 font-semibold">{name}</p>
        </div>
    );
}

// --- DÉBUT DE LA MODIFICATION NEWSLETTER ---

export const Newsletter = memo(function Newsletter() {
    // États pour gérer le formulaire
    const [email, setEmail] = useState('');
    const [consent, setConsent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(''); // Pour les retours de succès ou d'erreur
    const [error, setError] = useState(false); // Pour déterminer la couleur du message

    /**
     * Gère la soumission du formulaire d'inscription.
     */
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Empêche le rechargement de la page

        // Validation côté client
        if (!consent) {
            setError(true);
            setMessage("Vous devez accepter la politique de confidentialité pour vous inscrire.");
            return;
        }
        if (!email) {
            setError(true);
            setMessage("Veuillez entrer une adresse e-mail.");
            return;
        }

        setLoading(true);
        setError(false);
        setMessage('');

        try {
            // Appel à notre nouvelle route API
            const res = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, consent }),
            });

            const data = await res.json();

            if (!res.ok) {
                // Gérer les erreurs de l'API (ex: email déjà inscrit, erreur serveur)
                throw new Error(data.error || "Une erreur est survenue.");
            }

            // Succès
            setError(false);
            setMessage("Inscription réussie ! Merci de nous rejoindre.");
            setEmail(''); // Réinitialiser le champ
            setConsent(false); // Réinitialiser la case

        } catch (err: unknown) {
            setError(true);
            if (err instanceof Error) {
                setMessage(err.message);
            } else {
                setMessage("Une erreur inconnue est survenue.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.section className="w-full py-16 bg-white px-4 sm:px-6 lg:px-8"
            variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
            <div className="max-w-2xl mx-auto text-center bg-gray-100 p-6 sm:p-8 lg:p-12 rounded-2xl">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Restez informé·e de notre impact local</h3>
                <p className="mt-2 text-sm sm:text-base text-gray-600 text-center">Recevez les dernières nouvelles de nos projets en Belgique.</p>

                {/* Formulaire rendu fonctionnel */}
                <form onSubmit={handleSubmit} className="mt-6 w-full space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="email"
                            placeholder="Votre adresse e-mail"
                            className="flex-grow text-black px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none w-full text-sm sm:text-base"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            aria-label="Adresse e-mail pour la newsletter"
                            required
                        />
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            type="submit"
                            className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold shadow-sm hover:bg-indigo-700 disabled:opacity-50 text-sm sm:text-base"
                            disabled={loading}
                        >
                            {loading ? "Envoi..." : "S'abonner"}
                        </motion.button>
                    </div>

                    {/* Champ de consentement RGPD OBLIGATOIRE */}
                    <div className="text-left">
                        <label className="flex items-start gap-3 cursor-pointer text-xs sm:text-sm text-gray-600">
                            <input
                                type="checkbox"
                                className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                checked={consent}
                                onChange={(e) => setConsent(e.target.checked)}
                                disabled={loading}
                                aria-label="Consentement à la politique de confidentialité"
                                required
                            />
                            <span>
                                J&apos;accepte de recevoir la newsletter de Kenomi et je certifie avoir lu et accepté la <Link href="/politique_confidentialite" target="_blank" className="font-semibold text-indigo-600 hover:underline">politique de confidentialité</Link>.
                            </span>
                        </label>
                    </div>

                    {/* Affichage des messages de retour */}
                    {message && (
                        <AnimatePresence>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className={`text-xs sm:text-sm font-medium ${error ? 'text-red-600' : 'text-green-600'}`}
                            >
                                {message}
                            </motion.p>
                        </AnimatePresence>
                    )}
                </form>
            </div>
        </motion.section>
    );
});
// --- FIN DE LA MODIFICATION NEWSLETTER ---

export function StickyButtons() {
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        const toggleVisibility = () => window.scrollY > 300 ? setIsVisible(true) : setIsVisible(false);
        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
    return (
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col items-center gap-2 sm:gap-3">
            <AnimatePresence>
                {isVisible && (
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        onClick={scrollToTop}
                        className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-200"
                        aria-label="Remonter en haut"
                    >
                        <ArrowUp className="h-5 w-5 sm:h-6 sm:w-6" />
                    </motion.button>
                )}
            </AnimatePresence>
            <motion.a
                href="/don"
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-3 rounded-full bg-gradient-to-r from-green-500 to-blue-600 text-white font-bold shadow-xl text-sm"
            >
                <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Faire un don</span>
                <span className="sm:hidden">Don</span>
            </motion.a>
        </div>
    );
}
