'use client';
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { HeartPulse, School, ShieldCheck, Users2 } from 'lucide-react';

// Données pour la section Impact (mises à jour)
const stats = [
  { label: "Vies améliorées en RDC", value: 1500, color: "text-red-600" },
  { label: "Enfants scolarisés grâce à nos outils", value: 500, color: "text-blue-600" },
  { label: "Heures de formation en Belgique", value: 250, color: "text-teal-600" },
  { label: "Personnes (re)connectées au numérique", value: 45, color: "text-yellow-600" },
];

const solutions = [
  { icon: "🩺", title: "Santé connectée", desc: "Plateformes d'accès aux soins & suivi à distance" },
  { icon: "💻", title: "Éducation numérique", desc: "Outils pédagogiques, accès à internet, contenus open source" },
  { icon: "🛡️", title: "Protection de l'enfance", desc: "Signalement, soutien psycho-social, aide juridique" },
  { icon: "🤝", title: "Tech solidaire", desc: "Innovation locale + business model durable" }
];

const testimonials = [
  {
    name: "Marie, bénéficiaire",
    text: "Grâce à Kenomi, ma fille a pu accéder à des soins vitaux et retourner à l’école."
  },
  {
    name: "ONG partenaire",
    text: "Kenomi est un allié tech essentiel pour amplifier l’impact social en RDC."
  }
];

export default function Home() {
  // Carousel témoignages auto-scroll
  const [current, setCurrent] = useState(0);
  const { isSignedIn } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Scrollspy state
  const [activeSection, setActiveSection] = useState("");
  // Carousel témoignages
  useEffect(() => {
    const interval = setInterval(() => setCurrent((i) => (i + 1) % testimonials.length), 4000);
    return () => clearInterval(interval);
  }, []);
  // Scrollspy effect
  useEffect(() => {
    const sections = ["solutions", "impact", "mission", "contact"];
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollPosition && el.offsetTop + el.offsetHeight > scrollPosition) {
          setActiveSection(id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="bg-white min-h-screen flex flex-col">
      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
      {/* Header */}
      <motion.header initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7 }} className="relative w-full px-6 py-4 flex flex-wrap justify-between gap-4 items-center shadow-sm sticky top-0 bg-white z-50">
        <div className="flex items-center gap-2">
          <Image src="/noBgColor.png" alt="Kenomi Logo" width={240} height={40} />
          <span className="font-bold text-2xl text-gray-900"></span>
        </div>
        <nav className={`flex-col md:flex md:flex-row md:items-center gap-4 md:gap-8 text-gray-800 font-medium text-sm absolute md:static top-full left-0 w-full md:w-auto bg-white md:bg-transparent p-4 md:p-0 shadow md:shadow-none z-40 ${isMenuOpen ? "flex" : "hidden md:flex"}`}>
          <button onClick={() => setIsMenuOpen(false)}>
            <a
              href="#solutions"
              className={`hover:text-primary ${activeSection === "solutions" ? "text-primary font-semibold" : ""}`}
            >
              Our Solutions
            </a>
          </button>
          <button onClick={() => setIsMenuOpen(false)}>
            <a
              href="#impact"
              className={`hover:text-primary ${activeSection === "impact" ? "text-primary font-semibold" : ""}`}
            >
              Our Impact
            </a>
          </button>
          <button onClick={() => setIsMenuOpen(false)}>
            <a
              href="#mission"
              className={`hover:text-primary ${activeSection === "mission" ? "text-primary font-semibold" : ""}`}
            >
              Join the mission
            </a>
          </button>
          <button onClick={() => setIsMenuOpen(false)}>
            <a
              href="#contact"
              className={`hover:text-primary ${activeSection === "contact" ? "text-primary font-semibold" : ""}`}
            >
              Contact
            </a>
          </button>
        </nav>
        <div className="flex items-center">
          {isSignedIn && (
            <a
              href="/dashboard"
              className="w-full md:w-auto whitespace-nowrap ml-4 px-4 py-2 rounded-full bg-black border border-primary text-primary font-semibold shadow hover:bg-primary hover:text-white transition"
            >
              Tableau de bord
            </a>
          )}
          <motion.a href="don" className="w-full md:w-auto whitespace-nowrap ml-4 px-4 py-2 rounded-full bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold shadow">Faire un don</motion.a>
          {!isSignedIn && (
            <motion.a
              whileHover={{ scale: 1.09 }}
              whileTap={{ scale: 0.97 }}
              href="login"
              className="w-full md:w-auto whitespace-nowrap ml-4 px-4 py-2 rounded-full bg-black border border-primary text-primary font-semibold shadow hover:bg-primary hover:text-white transition"
            >
              Connexion
            </motion.a>
          )}
          <div className="ml-4">
            <UserButton afterSignOutUrl="/" />
          </div>
          <button
            className="ml-4 md:hidden text-2xl text-gray-800"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            ☰
          </button>
        </div>
      </motion.header>

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.9 }}
        className="relative overflow-hidden w-full min-h-[90vh] py-32 flex flex-col md:flex-row items-center justify-between px-6"
      >
        <div className="absolute inset-0 z-0">
          <Image
            src="/africanKids.png"
            alt="Enfants RDC souriants"
            fill
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-black opacity-30"></div>
        </div>
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="flex-1 max-w-xl relative text-center md:text-left"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
            La technologie au service de l’humain.
          </h1>
          <p className="text-xl text-white mb-8">
            Santé, éducation, protection : développons ensemble un futur digne.
          </p>
          <div className="flex flex-col md:flex-row gap-4">
            <motion.a
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.98 }}
              href="#about"
              className="w-full md:w-auto px-6 py-3 bg-primary text-white rounded-full font-semibold bg-gradient-to-r from-green-400 to-blue-500 shadow-lg hover:scale-105 transition"
            >
              Découvrir Kenomi
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.98 }}
              href="don"
              className="w-full md:w-auto px-6 py-3 bg-white text-black border border-primary rounded-full font-semibold shadow-lg hover:bg-primary hover:text-black transition"
            >
              Faire un don
            </motion.a>
          </div>
        </motion.div>
      </motion.section>

      {/* À propos */}
      <motion.section
        id="about"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="w-full py-20 bg-white px-6"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">À propos de Kenomi</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            La Technologie au Service du Progrès Humain
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Kenomi est une initiative humanitaire qui met la technologie au service d'un numérique inclusif, éthique et solidaire.
          </p>
          <div className="mt-16 bg-white p-8 sm:p-12 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold tracking-tight text-gray-900">Notre double engagement : Belgique & RDC </h3>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                    <div>
                        <h4 className="text-lg font-semibold leading-7 text-gray-800">Engagement Local en Belgique</h4>
                        <p className="mt-2 text-base leading-7 text-gray-600">
                            Nous luttons contre la fracture numérique via des formations à l'hygiène numérique. Nous nous consacrons aussi à améliorer l'accès au digital pour les plus vulnérables, comme les personnes âgées et les enfants défavorisés, afin que personne ne soit laissé pour compte.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold leading-7 text-gray-800">Action Internationale en RDC</h4>
                        <p className="mt-2 text-base leading-7 text-gray-600">
                            Au cœur de la République Démocratique du Congo,
                            nous développons des solutions technologiques
                            pour transformer l’accès aux soins de santé,
                            à l’éducation et à la protection de l’enfance.
                            En collaboration avec nos partenaires locaux,
                            nous créons des outils qui répondent à des besoins concrets.
                        </p>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-gray-200 text-center">
                    <p className="text-base font-semibold text-gray-700">
                        Que ce soit en Belgique ou au Congo, notre conviction reste la même : la technologie doit être un levier d'émancipation et de dignité pour tous.
                    </p>
                </div>
            </div>
        </div>
      </motion.section>

      {/* Nos solutions */}
      <motion.section id="solutions" initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}
        className="w-full py-16 bg-white px-6"
      >
        <div className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center">
                <h2 className="text-base font-semibold leading-7 text-indigo-600">Nos Pôles d'Action</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    Des solutions concrètes, un impact durable
                </p>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Card 1: Santé RDC */}
                <div className="group p-8 bg-gray-50 rounded-2xl border border-gray-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                    <div className="bg-red-100 text-red-600 p-3 rounded-lg inline-block mb-4">
                        <HeartPulse color="red" size={48} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Santé & Soins en RDC</h3>
                    <p className="mt-2 text-base text-gray-600">
                        Déploiement d'outils pour améliorer l'accès aux soins de santé primaires et à la protection infantile.
                    </p>
                </div>

                {/* <!-- Card 2: Éducation RDC --> */}
                <div className="group p-8 bg-gray-50 rounded-2xl border border-gray-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-lg inline-block mb-4">
                        <School color="blue" size={48} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Éducation & Avenir en RDC</h3>
                    <p className="mt-2 text-base text-gray-600">
                        Création de plateformes éducatives pour offrir un meilleur avenir aux enfants et renforcer les compétences locales.
                    </p>
                </div>

                {/* <!-- Card 3: Hygiène Numérique Belgique --> */}
                <div className="group p-8 bg-gray-50 rounded-2xl border border-gray-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                    <div className="bg-teal-100 text-teal-600 p-3 rounded-lg inline-block mb-4">
                        <ShieldCheck color="teal" size={48} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Hygiène Numérique en Belgique</h3>
                    <p className="mt-2 text-base text-gray-600">
                        Ateliers de formation pour naviguer le monde digital en toute sécurité et se prémunir contre les risques en ligne.
                    </p>
                </div>

                {/* <!-- Card 4: Inclusion Belgique --> */}
                <div className="group p-8 bg-gray-50 rounded-2xl border border-gray-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                    <div className="bg-yellow-100 text-yellow-600 p-3 rounded-lg inline-block mb-4">
                        <Users2 color="orange" size={48} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Inclusion Digitale en Belgique</h3>
                    <p className="mt-2 text-base text-gray-600">
                        Programmes dédiés pour faciliter l'accès au numérique pour les seniors et les jeunes issus de milieux défavorisés.
                    </p>
                </div>
            </div>
        </div>
    </div>
      </motion.section>

      {/* --- SECTION NOTRE IMPACT MISE À JOUR --- */}
      <motion.section
        id="impact"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="w-full py-16 sm:py-24 bg-gradient-to-br from-blue-50 via-white to-green-50 px-6"
      >
        <div className="max-w-7xl mx-auto">
            <div className="text-center">
                <h2 className="text-base font-semibold leading-7 text-indigo-600">Nos Résultats</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    Notre Impact en Chiffres
                </p>
                <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-gray-600">
                    Chaque chiffre représente une vie changée, une compétence acquise ou une communauté renforcée grâce à votre soutien.
                </p>
            </div>
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {stats.map((stat, i) => (
                <AnimatedStat key={stat.label} value={stat.value} label={stat.label} color={stat.color} delay={i * 0.2} />
              ))}
            </div>
        </div>
      </motion.section>
      {/* --- FIN DE LA SECTION MISE À JOUR --- */}


      {/* Rejoindre la mission */}
      <motion.section id="mission" initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}
        className="w-full py-16 bg-white px-6"
      >
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Rejoindre la mission</h2>
        <div className="flex flex-col md:flex-row gap-10 max-w-4xl mx-auto mb-8">
          <motion.div
            animate={{ x: current === 0 ? 0 : 20, opacity: current === 0 ? 1 : 0.5 }}
            transition={{ duration: 0.5 }}
            className={`w-full ${current !== 0 && 'hidden md:block'}`}
          >
            <Testimonial {...testimonials[0]} />
          </motion.div>
          <motion.div
            animate={{ x: current === 1 ? 0 : -20, opacity: current === 1 ? 1 : 0.5 }}
            transition={{ duration: 0.5 }}
            className={`w-full ${current !== 1 && 'hidden md:block'}`}
          >
            <Testimonial {...testimonials[1]} />
          </motion.div>
        </div>
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <motion.a whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.97 }} href="#contact" className="w-full md:w-auto px-5 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-full font-semibold shadow">
            Devenir partenaire
          </motion.a>
          <motion.a whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.97 }} href="#contact" className="w-full md:w-auto px-5 py-3 border border-primary text-primary rounded-full font-semibold shadow hover:bg-primary hover:text-white transition">
            Soumettre un projet
          </motion.a>
          <motion.a whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.97 }} href="#contact" className="w-full md:w-auto px-5 py-3 border border-primary text-primary rounded-full font-semibold shadow hover:bg-primary hover:text-white transition">
            S’impliquer
          </motion.a>
        </div>
      </motion.section>

      {/* Newsletter & Réseaux */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="w-full py-10 bg-gradient-to-r from-blue-100 to-green-100 px-6 flex flex-col items-center"
      >
        <h3 className="text-lg text-black font-semibold mb-4">Reste informé·e de notre mission</h3>
        <form className="flex gap-3 mb-5 w-full max-w-md">
          <input
            type="email"
            placeholder="Ton email"
            className="flex-grow px-4 py-2 rounded-l-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
          />
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            type="submit"
            className="px-4 py-2 rounded-r-lg bg-primary text-black font-semibold"
          >
            S&apos;abonner
          </motion.button>
        </form>
        <div className="flex gap-4 text-xl">
          <a href="https://www.linkedin.com/company/kenomi-eu" aria-label="LinkedIn" className="hover:text-primary">
            <Image src="/linkedin.png" alt="insta" width={40} height={40} />
          </a>
          <a href="https://www.instagram.com/kenomi_eu/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="hover:text-primary"
          ><Image src="/instagram.png" alt="insta" width={40} height={40} /></a>

          <a href="https://x.com/kenomi_eu" aria-label="Twitter" className="hover:text-primary">
            <Image src="/twitter.png" alt="twitter" width={40} height={40} />
          </a>
          <a href="https://www.facebook.com/people/Kenomi/61578022332134/?sk=about" aria-label="Facebook" className="hover:text-primary">
            <Image src="/facebook.png" alt="facebook" width={40} height={40} />
          </a>
          <a href="#" aria-label="TikTok" className="hover:text-primary">
            <Image src="/tik-tok.png" alt="tiktok" width={40} height={40} />
          </a>
          <a href="#" aria-label="YouTube" className="hover:text-primary">
            <Image src="/youtube.png" alt="tiktok" width={40} height={40} />
          </a>
        </div>
      </motion.section>

      {/* Footer */}
      <footer id="contact" className="w-full bg-black text-white py-8 px-6 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center gap-3 mb-4 md:mb-0">
          <Image src="/noBgWhite.png" alt="Logo Kenomi" width={150} height={32} />

          <span className="text-white text-sm ml-2">Tech For Human</span>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center text-sm">
          <a href="#">À propos</a>
          <a href="#">Mentions légales</a>
          <a href="#">Politique de confidentialité</a>
          <span>Contact : <a href="mailto:contact@kenomi.org" className="underline">contact@kenomi.eu</a></span>
        </div>
      </footer>
      {/* Sticky bouton don / up */}
      {/* Boutons sticky en bas à droite */}
      {/* --- Sticky Don & Scroll Up --- */}
      {/* Gestion sticky, animation, dark mode */}
      {/*
        - Bouton "Faire un don" : sticky, bas droite, visible en permanence, anim hover, icône cœur, redirection ancre ou page don
        - Bouton "↑" up : sticky, juste au-dessus, visible si scroll > 200px, fade-in/out, rond, anim hover, scroll top
      */}
      <StickyDonUpButtons />
    </main>
  );
}

// Chiffres animés
type AnimatedStatProps = {
  value: number;
  label: string;
  color?: string;
  delay?: number;
};

function AnimatedStat({ value, label, color = "text-primary", delay = 0 }: AnimatedStatProps) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = typeof value === "number" ? value : 0;
    if (end === 0) return;
    const duration = 1200;
    const step = Math.ceil(end / (duration / 30));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5, type: "spring" }}
      className="p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg"
    >
      <p className={`text-5xl font-extrabold ${color}`}>
        {count.toLocaleString("fr-FR")}
      </p>
      <p className="mt-2 text-base font-medium text-gray-700">{label}</p>
    </motion.div>
  );
}

// Témoignages animés (carousel)
function Testimonial({ name, text }: { name: string; text: string }) {
  return (
    <motion.div
      initial={{ scale: 0.97, opacity: 0.8 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 shadow flex-1"
    >
      <p className="text-gray-700 italic mb-3">&quot;{text}&quot;</p>
      <div className="text-right text-sm text-gray-600 font-semibold">{name}</div>
    </motion.div>
  );
}

// Sticky bouton don / up
import { FaHeart, FaArrowUp } from "react-icons/fa";

function StickyDonUpButtons() {
  const [showUp, setShowUp] = useState(false);
  // Scroll handler pour afficher le bouton up
  useEffect(() => {
    const onScroll = () => {
      setShowUp(window.scrollY > 200);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Handler scroll top
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handler scroll to don (si section don existe, sinon redirige vers /don)
  const handleDonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Si section avec id "don" existe, scroll, sinon redirige
    const donSection = document.getElementById("don");
    if (donSection) {
      donSection.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = "/don";
    }
  };

  return (
    <div
      className="fixed z-[120] bottom-15 right-15 flex flex-col items-end gap-3 pointer-events-none"
      style={{}}
    >
      {/* Bouton up */}
      <button
        aria-label="Remonter en haut"
        onClick={handleScrollTop}
        tabIndex={showUp ? 0 : -1}
        className={`
          mb-2
          transition-all duration-300
          rounded-full shadow-lg
          bg-white/90 dark:bg-black/80
          text-primary dark:text-green-300
          w-12 h-12 flex items-center justify-center text-2xl
          border border-primary/40 dark:border-green-700
          hover:bg-primary hover:text-white dark:hover:bg-green-500 dark:hover:text-black
          focus:outline-none
          ${showUp ? "opacity-100 pointer-events-auto translate-y-0" : "opacity-0 pointer-events-none translate-y-6"}
        `}
        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}
      >
        <FaArrowUp />
      </button>
      {/* Bouton don */}
      <button
        aria-label="Faire un don"
        onClick={handleDonClick}
        className={`
          transition-all duration-200
          rounded-full shadow-xl
          bg-gradient-to-r from-green-400 to-blue-500
          dark:from-green-600 dark:to-blue-800
          text-white
          flex items-center justify-center gap-2
          px-5 py-3
          text-base font-bold
          border-2 border-white dark:border-black
          hover:scale-105 hover:shadow-2xl
          active:scale-95
          focus:outline-none
          pointer-events-auto
        `}
        style={{
          boxShadow: "0 4px 18px rgba(50,180,100,0.17)",
        }}
      >
        <FaHeart className="text-lg animate-pulse" />
        <span className="hidden sm:inline">Faire un don</span>
      </button>
    </div>
  );
}
