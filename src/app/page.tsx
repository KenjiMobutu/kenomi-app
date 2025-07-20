'use client';

import Image from "next/image";
import { motion, useAnimation, useInView, AnimatePresence, animate } from "framer-motion";
import { useEffect, useState, useRef, ReactNode } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { HeartPulse, School, ShieldCheck, Users2, Heart, ArrowUp, Menu, X ,Lightbulb} from 'lucide-react';

// --- Data ---
const navLinks = [
  { href: "#solutions", label: "Nos Solutions" },
  { href: "#impact", label: "Notre Impact" },
  { href: "#mission", label: "La Mission" },
  { href: "#contact", label: "Contact" },
];

const statsData = [
  { label: "Vies améliorées en RDC", value: 1500, color: "text-red-500" },
  { label: "Enfants scolarisés", value: 500, color: "text-blue-500" },
  { label: "Heures de formation en Belgique", value: 250, color: "text-teal-500" },
  { label: "Personnes (re)connectées", value: 45, color: "text-yellow-500" },
];

const solutionsData = [
    { icon: ShieldCheck, title: "Formation & Sensibilisation (BE)", desc: "Nous formons tous les publics (entreprises, seniors, enfants) à la cybersécurité et à la citoyenneté numérique.", color: "teal" },
    { icon: Users2, title: "Inclusion & Reconditionnement (BE)", desc: "Nous formons des jeunes au reconditionnement de matériel informatique, que nous distribuons ensuite pour réduire la fracture numérique locale.", color: "yellow" },
    { icon: School, title: "Éducation & Avenir (RDC)", desc: "En partenariat avec des acteurs locaux, nous soutenons la formation des jeunes aux métiers du numérique pour leur offrir un meilleur avenir.", color: "blue" },
    { icon: Lightbulb, title: "Innovation & Impact Social", desc: "Nous développons des solutions technologiques et des outils pédagogiques pour répondre à des besoins sociaux concrets.", color: "red" }
  ];

const testimonialsData = [
  { name: "Marie, bénéficiaire", text: "Grâce à Kenomi, ma fille a pu accéder à des soins vitaux et retourner à l’école." },
  { name: "ONG partenaire", text: "Kenomi est un allié tech essentiel pour amplifier l’impact social en RDC." }
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
      <SectionSeparator />
      <Solutions />
      <Impact />
      <Mission />
      <TransparentSection/>
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

    // Effect to handle closing menu on resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) { // lg breakpoint
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
                {!isSignedIn && <a href="/login" className="px-4 py-2 text-sm font-semibold text-gray-700">Connexion</a>}
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
                                {!isSignedIn && <a href="/login" className="w-full text-center px-4 py-3 font-semibold text-gray-700">Connexion</a>}
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
    const [currentImage, setCurrentImage] = useState(0);
    const images = [
        { src: "/africanKids.png", alt: "Enfants RDC souriants" },
        { src: "/euKids.png", alt: "Enfants en Europe" }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImage(prev => (prev + 1) % images.length);
        }, 5000); // Change image every 5 seconds
        return () => clearInterval(timer);
    }, [images.length]);

    return (
        <section className="relative w-full min-h-screen flex items-center">
            <AnimatePresence>
                <motion.div
                    key={currentImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                    className="absolute inset-0 z-0"
                >
                    <Image
                        src={images[currentImage].src}
                        alt={images[currentImage].alt}
                        layout="fill"
                        objectFit="cover"
                        priority={currentImage === 0}
                        className="brightness-75"
                    />
                </motion.div>
            </AnimatePresence>
            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.9, ease: "circOut" }}
                    className="max-w-2xl"
                >
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-md">
                        La technologie au service de l’humain.
                    </h1>
                    <p className="text-xl text-white/90 mb-8 drop-shadow">
                        " Kenomi forme les jeunes aux métiers du numérique en Belgique et en RDC,
                        et sensibilise tous les publics à la cybersécurité."
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <motion.a whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} href="#about" className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-full font-semibold shadow-lg text-center">
                            Découvrir Kenomi
                        </motion.a>
                        <motion.a whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} href="/don" className="px-8 py-3 bg-white/90 text-gray-800 rounded-full font-semibold shadow-lg backdrop-blur-sm text-center">
                            Faire un don
                        </motion.a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

function SectionSeparator() {
    return <div className="w-full h-20 bg-gradient-to-b from-white to-gray-50"></div>;
}

function About() {
    return (
        <motion.section id="about" className="w-full py-16 sm:py-24 bg-gray-50 px-6 lg:px-8"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
        >
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-base font-semibold leading-7 text-indigo-600">Notre Mission</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    La Technologie au Service du Progrès Humain
                </p>
                <div className="mt-16 bg-white p-8 sm:p-12 rounded-2xl shadow-lg text-left">
                    <h3 className="text-xl font-bold tracking-tight text-gray-900 text-center">Notre double engagement : Belgique & RDC</h3>
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">

                        <div>
                            <h4 className="text-lg font-semibold leading-7 text-gray-800">Engagement Local en Belgique 🇧🇪</h4>
                            <p className="mt-2 text-base leading-7 text-gray-600">
                                Formation de jeunes au reconditionnement informatique. Nous leur offrons les compétences nécessaires pour entrer dans le monde du travail, tout en promouvant une économie circulaire et durable. Grâce à nos ateliers, nous sensibilisons également le grand public à la cybersécurité et à l'hygiène numérique.

                            </p>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold leading-7 text-gray-800">Action Internationale en RDC 🇨🇩</h4>
                            <p className="mt-2 text-base leading-7 text-gray-600">
                                Formation de jeunes aux métiers du développement web.
                                Soutien à l'entrepreneuriat numérique local.
                                Création d'opportunités pour l'économie locale.
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
    );
}

function Solutions() {
    const iconColors = {
        red: "bg-red-100 text-red-600",
        blue: "bg-blue-100 text-blue-600",
        teal: "bg-teal-100 text-teal-600",
        yellow: "bg-yellow-100 text-yellow-600"
    };
    return (
        <motion.section id="solutions" className="w-full py-16 sm:py-24 bg-gray-50 px-6 lg:px-8"
            variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
                <section className="py-16 md:py-24" style={{ backgroundImage: "url('/cardbg2.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <div className="container mx-auto px-6 text-center bg-white/90 backdrop-blur-sm p-12 rounded-lg shadow-xl">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Votre Don a un Impact Concret</h2>
                        <p className="mt-2 text-lg text-gray-600 max-w-2xl mx-auto">Chaque contribution, petite ou grande, nous aide à changer des vies. Voyez comment votre don se transforme en action.</p>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                            <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                                <p className="text-4xl font-extrabold text-blue-700">25 €</p>
                                <p className="mt-2 text-black font-semibold">Finance un kit d'outils pour un jeune en formation de reconditionnement.</p>
                            </div>
                            <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                                <p className="text-4xl font-extrabold text-blue-700">50 €</p>
                                <p className="mt-2 text-black font-semibold">Offre une session de formation complète à la cybersécurité pour un senior.</p>
                            </div>
                            <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200 sm:col-span-2 lg:col-span-1">
                                <p className="text-4xl font-extrabold text-blue-700">150 €</p>
                                <p className="mt-2 text-black font-semibold">Fournit un ordinateur reconditionné complet à un étudiant dans le besoin.</p>
                            </div>
                        </div>
                        <a href="/don" className="mt-12 inline-block bg-yellow-400 text-blue-900 px-10 py-4 rounded-full font-bold text-xl hover:bg-yellow-300 transition-transform transform hover:scale-105">
                            Je Fais un Don
                        </a>
                    </div>
                </section>
        <br></br>
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-xl font-semibold leading-7  text-indigo-600">Nos Pôles d'Action</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Des solutions concrètes, un impact durable
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
                            <p className="mt-2 text-sm text-gray-600">{sol.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.section>
    );
}

function Impact() {
    return (
        <motion.section id="impact" className="w-full py-16 sm:py-24 bg-white px-6 lg:px-8"
            variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-base font-semibold leading-7 text-indigo-600">Nos Résultats</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Notre Impact en Chiffres
                    </p>
                    <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-gray-600">
                        Chaque chiffre représente une vie changée, une compétence acquise ou une communauté renforcée grâce à votre soutien.
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
}

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
                {count.toLocaleString("fr-FR")}
            </p>
            <p className="mt-2 text-base font-medium text-gray-700">{label}</p>
        </motion.div>
    );
}

function Mission() {
    const [current, setCurrent] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => setCurrent(prev => (prev + 1) % testimonialsData.length), 5000);
        return () => clearInterval(timer);
    }, []);
    return (
        <motion.section id="mission" className="w-full py-16 sm:py-24 bg-gray-50 px-6 lg:px-8"
            variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Rejoindre la Mission</h2>
                <div className="relative h-40 mb-10 overflow-hidden">
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
                    <motion.a whileHover={{ scale: 1.05, y: -2 }} href="#" className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-full font-semibold shadow-md">Devenir partenaire</motion.a>
                    <motion.a whileHover={{ scale: 1.05, y: -2 }} href="#" className="px-6 py-3 bg-white text-gray-800 border border-gray-300 rounded-full font-semibold shadow-sm">S'impliquer</motion.a>
                </div>
            </div>
        </motion.section>
    );
}

function Testimonial({ name, text }: { name: string; text: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <p className="text-gray-700 italic text-lg">&quot;{text}&quot;</p>
            <p className="mt-4 text-sm text-gray-600 font-semibold">{name}</p>
        </div>
    );
}

function TransparentSection() {
    return(
    <section className="bg-gray-100 py-16 md:py-24">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Notre Engagement : La Transparence</h2>
                <p className="mt-2 text-lg text-gray-600 max-w-2xl mx-auto">La confiance est au cœur de notre démarche. Découvrez qui nous sommes et comment nous travaillons.</p>
                <div className="mt-12 grid md:grid-cols-2 gap-8 text-left">
                    <div className="bg-white p-8 rounded-lg shadow-md">
                        <h3 className="text-2xl font-bold text-blue-700 mb-4">Qui Sommes-Nous ?</h3>
                        <p className="text-gray-700 mb-4">Kenomi a été fondée par des passionnés de technologie et d'impact social, convaincus que le numérique doit être une opportunité pour tous. Nous sommes une ASBL enregistrée en Belgique, animée par des valeurs de partage, d'intégrité et de solidarité.</p>
                        <a href="#" className="text-blue-600 font-bold hover:underline">Découvrir l'équipe →</a>
                    </div>
                    <div className="bg-white p-8 rounded-lg shadow-md">
                        <h3 className="text-2xl font-bold text-blue-700 mb-4">Nos Rapports</h3>
                        <p className="text-gray-700 mb-4">Chaque année, nous publions un rapport d'activité détaillé. Vous y trouverez nos chiffres clés, nos succès, nos défis et un aperçu financier complet. Votre confiance est notre priorité.</p>
                        <a href="#" className="text-blue-600 font-bold hover:underline">Consulter le rapport 2024 →</a>
                    </div>
                </div>
            </div>
        </section>
)}

function Newsletter() {
    return (
        <motion.section className="w-full py-16 bg-white px-6 lg:px-8"
            variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
            <div className="max-w-2xl mx-auto text-center bg-gray-100 p-8 sm:p-12 rounded-2xl">
                <h3 className="text-2xl font-bold text-gray-900">Restez informé·e de notre mission</h3>
                <p className="mt-2 text-gray-600">Recevez les dernières nouvelles de nos projets et de notre impact.</p>
                <form className="mt-6 flex flex-col sm:flex-row gap-3 w-full">
                    <input type="email" placeholder="Votre adresse e-mail" className="flex-grow px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none w-full" />
                    <motion.button whileHover={{ scale: 1.05 }} type="submit" className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold shadow-sm hover:bg-indigo-700">S'abonner</motion.button>
                </form>
            </div>
        </motion.section>
    );
}

function Footer() {
    return (
        <footer id="contact" className="w-full bg-black text-gray-300 py-12 px-6 lg:px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <Image src="/noBgWhite.png" alt="Logo Kenomi" width={150} height={32} />
                    <p className="mt-4 text-sm text-gray-400">La technologie au service du progrès humain.</p>
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
            <div className="mt-12 border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
                &copy; {new Date().getFullYear()} Kenomi. Tous droits réservés.
            </div>
        </footer>
    );
}

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
