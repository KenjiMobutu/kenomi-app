
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

// Métadonnées pour le SEO
export const metadata: Metadata = {
  title: "Mentions Légales - Kenomi ASBL",
  description: "Consultation des mentions légales de Kenomi ASBL.",
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * Page statique des Mentions Légales.
 * Conçue comme un Composant Serveur (Server Component) pour la performance et le SEO.
 */
export default function MentionsLegalesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      {/* En-tête simplifié pour la navigation */}
      <header className="w-full px-4 sm:px-6 py-3 flex justify-between items-center shadow-sm sticky top-0 bg-white/95 z-50">
        {/* CORRECTION: <a> -> <Link> */}
        <Link href="/" aria-label="Retour à la Page d'accueil">
          {/* CORRECTION: <img> -> <Image> */}
          <Image
            src="/noBgColor.png" // Utilisation du logo couleur sur fond blanc
            alt="Kenomi Logo"
            width={180}
            height={30}
            priority
          />
        </Link>
        {/* CORRECTION: <a> -> <Link> */}
        <Link
          href="/"
          className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition"
        >
          Retour à l&apos;accueil
        </Link>
      </header>

      {/* Contenu principal */}
      <main className="w-full max-w-4xl mx-auto py-16 sm:py-24 px-6 lg:px-8">
        {/* Utilisation de 'prose' pour une mise en forme automatique du texte */}
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Mentions Légales
          </h1>

          <p className="text-sm text-gray-500 mb-6">
            En vigueur au {new Date().toLocaleDateString("fr-BE")}
          </p>

          <p>
            Conformément aux dispositions de la législation belge, notamment le
            Code de droit économique, il est porté à la connaissance des
            utilisateurs et visiteurs du site Kenomi les présentes mentions
            légales.
          </p>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Article 1 : L&apos;éditeur
            </h2>
            <p>
              L&apos;édition et la direction de la publication du site{" "}
              <strong>kenomi.eu</strong> est assurée par :
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>
                <strong>Dénomination sociale :</strong> Kenomi ASBL
              </li>
              <li>
                <strong>Forme juridique :</strong> Association Sans But Lucratif (ASBL)
              </li>
              <li>
                <strong>Siège social :</strong> [À COMPLÉTER : Adresse complète
                du siège social, ex: Rue des Exemples 1, 1000 Bruxelles,
                Belgique]
              </li>
              <li>
                <strong>Numéro BCE :</strong> [À COMPLÉTER : Votre numéro de la
                Banque-Carrefour des Entreprises]
              </li>
              <li>
                <strong>Adresse e-mail de contact :</strong> contact@kenomi.eu
              </li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Article 2 : L&apos;hébergeur
            </h2>
            <p>
              L&apos;hébergeur du site <strong>kenomi.eu</strong> est la société Vercel
              Inc., dont le siège social est situé au :
            </p>
            <address className="not-italic mt-4 pl-6 border-l-2 border-gray-200">
              Vercel Inc.
              <br />
              340 S Lemon Ave #4133
              <br />
              Walnut, CA 91789
              <br />
              États-Unis
            </address>
            <p className="mt-4">
              Contact :{" "}
              {/* Le lien externe (mailto) reste une balise <a> */}
              <a
                href="mailto:privacy@vercel.com"
                className="text-indigo-600 hover:underline"
              >
                privacy@vercel.com
              </a>
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Article 3 : Accès au site
            </h2>
            <p>
              Le site est accessible par tout endroit, 7j/7, 24h/24 sauf cas de
              force majeure, interruption programmée ou non et pouvant découler
              d&apos;une nécessité de maintenance. En cas de modification,
              interruption ou suspension des services, le site{" "}
              <strong>kenomi.eu</strong> ne saurait être tenu responsable.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Article 4 : Propriété intellectuelle
            </h2>
            <p>
              Toute utilisation, reproduction, diffusion, commercialisation,
              modification de toute ou partie du site <strong>kenomi.eu</strong>,
              sans autorisation de l&apos;Éditeur est prohibée et pourra entraîner
              des actions et poursuites judiciaires telles que notamment prévues
              par le Code de droit économique et le Code civil.
            </p>
            <p className="mt-2">
              Les marques, logos, signes ainsi que tous les contenus du site
              (textes, images, son…) font l&apos;objet d&apos;une protection par
              les lois en vigueur au titre de la propriété intellectuelle.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Article 5 : Limitation de responsabilité
            </h2>
            <p>
              Les informations contenues sur ce site sont aussi précises que
              possible et le site est périodiquement remis à jour, mais peut
              toutefois contenir des inexactitudes, des omissions ou des
              lacunes. Si vous constatez une lacune, erreur ou ce qui parait
              être un dysfonctionnement, merci de bien vouloir le signaler par
              email à l&apos;adresse contact@kenomi.eu.
            </p>
            <p className="mt-2">
              Kenomi ASBL ne pourra être tenu responsable des dommages directs et
              indirects causés au matériel de l&apos;utilisateur, lors de l&apos;accès au
              site <strong>kenomi.eu</strong>.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Article 6 : Droit applicable et juridiction
            </h2>
            <p>
              Tout litige en relation avec l&apos;utilisation du site{" "}
              <strong>kenomi.eu</strong> est soumis au droit belge. En dehors
              des cas où la loi ne le permet pas, il est fait attribution
              exclusive de juridiction aux tribunaux compétents de Bruxelles.
            </p>
          </section>
        </div>
      </main>

      {/* Pied de page simplifié */}
      <footer className="w-full bg-black text-gray-400 py-8 px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto text-center text-sm">
          &copy; {new Date().getFullYear()} Kenomi ASBL. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
