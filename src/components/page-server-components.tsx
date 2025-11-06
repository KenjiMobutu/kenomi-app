import Image from "next/image";

import { memo } from "react";
import Link from 'next/link';

// --- Data (Uniquement pour le Footer) ---
const navLinks = [
  { href: "#about", label: "Notre Modèle" },
  { href: "#action-poles", label: "Nos Actions" },
  { href: "#previews", label: "Formations" },
  { href: "#impact", label: "Notre Impact" },
  { href: "#mission", label: "La Mission" },
  { href: "#contact", label: "Contact" },
];

// --- Composants Serveur ---
// Ces composants n'utilisent NI hooks NI framer-motion.

export const TransparentSection = memo(function TransparentSection() {
  return (
    <section className="bg-gray-100 py-16 md:py-24">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
          Notre Engagement : La Transparence
        </h2>
        <p className="mt-2 text-lg text-gray-600 max-w-2xl mx-auto text-center">
          La confiance est au cœur de notre démarche. Découvrez qui nous sommes et
          comment nous travaillons.
        </p>
        <div className="mt-12 grid md:grid-cols-2 gap-8 text-left">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-blue-700 mb-4">
              Qui Sommes-Nous ?
            </h3>
            <p className="text-gray-700 mb-4 text-justify">
              Kenomi est une ASBL fondée par des passionnés de technologie et
              d&apos;impact social, convaincus que le numérique doit être une
              opportunité pour tous en Belgique. Nous sommes animés par des
              valeurs de partage, d&apos;intégrité et de solidarité locale.
            </p>
            <a href="#" className="text-blue-600 font-bold hover:underline">
              Découvrir l&apos;équipe →
            </a>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-blue-700 mb-4">
              Nos Rapports
            </h3>
            <p className="text-gray-700 mb-4 text-justify">
              Chaque année, nous publions un rapport d&apos;activité détaillé.
              Vous y trouverez nos chiffres clés, nos succès, nos défis et un
              aperçu financier complet de notre impact en Belgique. Votre
              confiance est notre priorité.
            </p>
            <a href="#" className="text-blue-600 font-bold hover:underline">
              Consulter le rapport 2024 →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
});

export const Footer = memo(function Footer() {
  return (
    <footer id="contact" className="w-full bg-black text-gray-300 py-12 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <Image src="/noBgWhite.png" alt="Logo Kenomi" width={150} height={32} />
          <p className="mt-4 text-sm text-gray-400">
            Le cercle vertueux du numérique en Belgique.
          </p>
          <div className="flex gap-4 mt-4">
            <a
              href="https://www.linkedin.com/company/kenomi-eu"
              aria-label="LinkedIn"
              className="hover:text-white"
            >
              <Image src="/linkedin.png" alt="LinkedIn" width={24} height={24} />
            </a>
            <a
              href="https://www.instagram.com/kenomi_eu/"
              aria-label="Instagram"
              className="hover:text-white"
            >
              <Image
                src="/instagram.png"
                alt="Instagram"
                width={24}
                height={24}
              />
            </a>
            <a
              href="https://x.com/kenomi_eu"
              aria-label="Twitter"
              className="hover:text-white"
            >
              <Image src="/twitter.png" alt="Twitter" width={24} height={24} />
            </a>
            <a
              href="https://www.facebook.com/people/Kenomi/61578022332134/"
              aria-label="Facebook"
              className="hover:text-white"
            >
              <Image src="/facebook.png" alt="Facebook" width={24} height={24} />
            </a>
            <a href="#" aria-label="TikTok" className="hover:text-white">
              <Image src="/tik-tok.png" alt="TikTok" width={24} height={24} />
            </a>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-white">Navigation</h4>
            <ul className="mt-4 space-y-2 text-sm">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:underline">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white">Légal</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/mentions_legales" className="hover:underline">
                Mentions légales </Link>
              </li>
              <li>

                <Link href="/politique_confidentialite" className="hover:underline">
                Politique de confidentialité </Link>

              </li>
              <li>
                <a href="mailto:contact@kenomi.eu" className="hover:underline">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mt-12 border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Kenomi ASBL. Tous droits réservés.
      </div>
    </footer>
  );
});
