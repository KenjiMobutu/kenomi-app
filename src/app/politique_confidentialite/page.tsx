
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

// Métadonnées pour le SEO
export const metadata: Metadata = {
  title: "Politique de Confidentialité - Kenomi ASBL",
  description:
    "Consultation de la politique de confidentialité de Kenomi ASBL.",
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * Page statique de Politique de Confidentialité.
 * Conçue comme un Composant Serveur (Server Component) pour la performance et le SEO.
 */
export default function PolitiqueDeConfidentialitePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      {/* En-tête simplifié pour la navigation */}
      <header className="w-full px-4 sm:px-6 py-3 flex justify-between items-center shadow-sm sticky top-0 bg-white/95 z-50">
        <Link href="/" aria-label="Retour à la Page d'accueil">
          <Image
            src="/noBgColor.png" // Utilisation du logo couleur sur fond blanc
            alt="Kenomi Logo"
            width={180}
            height={30}
            priority
          />
        </Link>
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
            Politique de Confidentialité
          </h1>

          <p className="text-sm text-gray-500 mb-6">
            Dernière mise à jour : {new Date().toLocaleDateString("fr-BE")}
          </p>

          <p>
            Kenomi ASBL (&quot;nous&quot;, &quot;notre&quot;, &quot;nos&quot;)
            s&apos;engage à protéger la vie privée des visiteurs de notre site
            web <strong>kenomi.eu</strong> (&quot;Site&quot;). Cette
            Politique de Confidentialité décrit les types d&apos;informations
            personnelles que nous collectons, comment nous les utilisons, et les
            choix que vous avez concernant vos informations, conformément au
            Règlement Général sur la Protection des Données (RGPD).
          </p>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Article 1 : Responsable du Traitement
            </h2>
            <p>
              Le responsable du traitement de vos données personnelles est :
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>
                <strong>Dénomination sociale :</strong> Kenomi ASBL
              </li>
              <li>
                <strong>Siège social :</strong> 18, Rue Buchholtz 1050 Bruxelles, Belgique
              </li>
              <li>
                <strong>Numéro BCE :</strong> [À COMPLÉTER : Votre numéro BCE]
              </li>
              <li>
                <strong>Email du Délégué à la Protection des Données (DPO) :</strong>{" "}
                <a
                  href="mailto:contact@kenomi.eu"
                  className="text-indigo-600 hover:underline"
                >
                  contact@kenomi.eu
                </a>
              </li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Article 2 : Données collectées
            </h2>
            <p>
              Nous collectons différentes catégories de données pour diverses
              finalités :
            </p>
            <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">
              A. Données de compte (via Clerk)
            </h3>
            <p>
              Lorsque vous créez un compte sur notre Site, nous collectons les
              informations nécessaires à la gestion de votre compte, gérées par
              notre sous-traitant{" "}
              <a
                href="https://clerk.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                Clerk
              </a>
              . Cela inclut typiquement :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Adresse e-mail</li>
              <li>Nom d&apos;utilisateur, Prénom, Nom (si fournis)</li>
              <li>Mot de passe (hashé et géré par Clerk)</li>
              <li>Photo de profil (si fournie)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">
              B. Données de Don (via Stripe et PayPal)
            </h3>
            <p>
              Lorsque vous effectuez un don, le paiement est traité par nos
              prestataires de services de paiement sécurisés (Stripe ou PayPal).
              Nous collectons :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                Informations de contact : Nom, Prénom, Adresse e-mail.
              </li>
              <li>
                Informations sur la transaction : Montant, date, fréquence
                (unique ou mensuel).
              </li>
            </ul>
            <p className="mt-2">
              <strong>Nous ne stockons jamais</strong> vos informations de carte
              de crédit. Ces données sont transmises directement et de manière
              sécurisée à{" "}
              <a
                href="https://stripe.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                Stripe
              </a>{" "}
              ou{" "}
              <a
                href="https://www.paypal.com/us/legalhub/privacy-full"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                PayPal
              </a>
              .
            </p>

            <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">
              C. Données de Projets (Base de données Supabase)
            </h3>
            <p>
              Si vous soumettez un projet via votre tableau de bord, nous
              stockons les informations que vous fournissez (titre, description)
              dans notre base de données sécurisée hébergée par{" "}
              <a
                href="https://supabase.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                Supabase
              </a>
              .
            </p>

            <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">
              D. Données de Navigation (Cookies)
            </h3>
            <p>
              Nous utilisons des cookies essentiels au fonctionnement du site,
              notamment pour la gestion de votre session d&apos;authentification
              (via Clerk) et la sécurité de base. Nous n&apos;utilisons pas de
              cookies de suivi publicitaire tiers.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Article 3 : Finalités du traitement
            </h2>
            <p>Vos données sont utilisées pour :</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Fournir et gérer votre accès au compte (Base légale : Contrat).</li>
              <li>
                Traiter vos dons et émettre les reçus fiscaux (Base légale :
                Contrat).
              </li>
              <li>
                Gérer les projets que vous soumettez (Base légale : Contrat).
              </li>
              <li>
                Vous envoyer des communications transactionnelles (confirmation
                de don, réinitialisation de mot de passe) (Base légale :
                Contrat).
              </li>
              <li>
                Assurer la sécurité de notre site web (Base légale : Intérêt
                légitime).
              </li>
              <li>
                Répondre à vos demandes de contact (Base légale : Intérêt
                légitime).
              </li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Article 4 : Durée de conservation
            </h2>
            <p>
              Nous conservons vos données pour la durée nécessaire aux finalités
              pour lesquelles elles sont collectées :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <strong>Données de compte :</strong> Tant que votre compte est
                actif. En cas d&apos;inactivité pendant 3
                ans, votre compte pourra être supprimé.
              </li>
              <li>
                <strong>Données de dons :</strong> Conservées pendant 7 ans,
                conformément aux obligations légales comptables belges.
              </li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Article 5 : Partage des données
            </h2>
            <p>
              Nous ne vendons ni ne louons vos données. Elles sont partagées
              uniquement avec les sous-traitants essentiels au fonctionnement de
              nos services :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <strong>Clerk (Auth, Inc.) :</strong> Pour l&apos;authentification
                (localisé aux États-Unis, certifié Data Privacy Framework).
              </li>
              <li>
                <strong>Stripe, Inc. :</strong> Pour le traitement des paiements par
                carte (localisé aux États-Unis, certifié DPF).
              </li>
              <li>
                <strong>PayPal, Inc. :</strong> Pour le traitement des paiements
                (localisé aux États-Unis, certifié DPF).
              </li>
              <li>
                <strong>Supabase, Inc. :</strong> Pour l&apos;hébergement de la base
                de données (localisé aux États-Unis, certifié DPF).
              </li>
              <li>
                <strong>Vercel, Inc. :</strong> Pour l&apos;hébergement du site
                (localisé aux États-Unis, certifié DPF).
              </li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Article 6 : Vos droits (RGPD)
            </h2>
            <p>
              Conformément au RGPD, vous disposez des droits suivants concernant
              vos données personnelles :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <strong>Droit d&apos;accès :</strong> Demander quelles
                informations nous détenons sur vous.
              </li>
              <li>
                <strong>Droit de rectification :</strong> Corriger des
                informations inexactes.
              </li>
              <li>
                <strong>Droit à l&apos;effacement :</strong> Demander la
                suppression de vos données (sous réserve des obligations
                légales).
              </li>
              <li>
                <strong>Droit à la limitation :</strong> Suspendre
                temporairement l&apos;utilisation de vos données.
              </li>
              <li>
                <strong>Droit à la portabilité :</strong> Recevoir vos données
                dans un format structuré.
              </li>
            </ul>
            <p className="mt-2">
              Vous pouvez exercer la plupart de ces droits (accès, rectification)
              directement depuis votre tableau de bord (profil Clerk). Pour
              toute autre demande, ou pour exercer votre droit à l&apos;effacement,
              veuillez contacter notre DPO à{" "}
              <a
                href="mailto:contact@kenomi.eu"
                className="text-indigo-600 hover:underline"
              >
                contact@kenomi.eu
              </a>
              .
            </p>
            <p className="mt-2">
              Vous avez également le droit d&apos;introduire une réclamation
              auprès de l&apos;Autorité de protection des données (APD) en
              Belgique.
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
