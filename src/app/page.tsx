'use client';
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";

// Données statiques
const stats = [
  { label: "Bénéficiaires", value: 15000 },
  { label: "ONG partenaires", value: 23 },
  { label: "Projets financés", value: 12 },
  { label: "Zones d'action", value: 3, display: "Kinshasa, Goma, Bukavu" },
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
  useEffect(() => {
    const interval = setInterval(() => setCurrent((i) => (i + 1) % testimonials.length), 4000);
    return () => clearInterval(interval);
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
            <a href="#solutions" className="hover:text-primary">Our Solutions</a>
          </button>
          <button onClick={() => setIsMenuOpen(false)}>
            <a href="#impact" className="hover:text-primary">Our Impact</a>
          </button>
          <button onClick={() => setIsMenuOpen(false)}>
            <a href="#mission" className="hover:text-primary">Join the mission</a>
          </button>
          <button onClick={() => setIsMenuOpen(false)}>
            <a href="#contact" className="hover:text-primary">Contact</a>
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
          <p className="text-lg text-gray-700 leading-relaxed">
            Kenomi est une initiative technologique à but humanitaire qui vise à améliorer l’accès aux soins de santé, à l’éducation et à la protection de l’enfance en République Démocratique du Congo.
            Nous croyons en une technologie inclusive, éthique et solidaire, capable de transformer les vies durablement. Nos solutions s'appuient sur des partenariats locaux et un modèle économique responsable.
          </p>
        </div>
      </motion.section>

      {/* Nos solutions */}
      <motion.section id="solutions" initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}
        className="w-full py-16 bg-white px-6"
      >
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Nos solutions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {solutions.map((sol, idx) => (
            <motion.div
              key={idx}
              whileHover={{ rotateY: 8, scale: 1.05, boxShadow: "0px 8px 32px rgba(50, 180, 100, 0.13)" }}
              className="bg-gradient-to-tr from-green-100 to-blue-100 rounded-xl p-6 shadow flex flex-col items-center text-center cursor-pointer"
            >
              <div className="text-4xl mb-3">{sol.icon}</div>
              <h3 className="text-xl text-black font-semibold mb-2">{sol.title}</h3>
              <p className="text-gray-600">{sol.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Notre impact */}
      <motion.section id="impact" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}
        className="w-full py-16 bg-gradient-to-l from-blue-50 via-green-50 to-white px-6"
      >
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Notre impact</h2>
        <div className="flex flex-wrap text-black justify-center gap-8 max-w-5xl mx-auto">
          {stats.map((stat, i) => (
            <AnimatedStat key={stat.label} value={stat.value} label={stat.label} display={stat.display} delay={i * 0.2} />
          ))}
        </div>
      </motion.section>

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
    </main>
  );
}

// Chiffres animés
type AnimatedStatProps = {
  value: number | string;
  label: string;
  display?: string;
  delay?: number;
};

function AnimatedStat({ value, label, display, delay = 0 }: AnimatedStatProps) {
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
      className="bg-white border border-gray-200 rounded-xl px-8 py-6 flex flex-col items-center shadow"
    >
      <span className="text-2xl font-bold text-primary mb-1">
        {typeof value === "number" ? (label === "Bénéficiaires" ? "+" : "") + count.toLocaleString("fr-FR") : value}
      </span>
      <span className="text-gray-700">{label}</span>
      {display && <span className="text-xs text-gray-500">{display}</span>}
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
