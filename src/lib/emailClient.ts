// Emplacement: src/lib/emailClient.ts
import { Buffer } from 'buffer';

/**
 * Définit les informations requises pour un e-mail de confirmation de don.
 */
// MODIFIÉ: Exporté pour être réutilisé par pdfGenerator
export interface DonationDetails {
  email: string;
  name: string;
  amount: number;
  frequency: 'once' | 'monthly';
  // AJOUT: Informations optionnelles pour le reçu
  donationDate?: Date;
  transactionId?: string;
  pdfBuffer?: Uint8Array; // Le PDF généré
}

// --- AJOUT: Définition des types pour l'API Brevo ---
interface BrevoSender {
  name: string;
  email: string;
}

interface BrevoRecipient {
  email: string;
  name: string;
}

interface BrevoAttachment {
  name: string;
  content: string; // Contenu encodé en Base64
}

/**
 * Définit la structure de la charge utile envoyée à l'API Brevo.
 */
interface BrevoPayload {
  sender: BrevoSender;
  to: BrevoRecipient[];
  subject: string;
  htmlContent: string;
  attachment?: BrevoAttachment[]; // La pièce jointe est optionnelle
}

/**
 * Envoie un e-mail de confirmation de don via l'API SMTP de Brevo.
 * @param details Les informations sur le donateur et la transaction.
 */
export async function sendDonationConfirmationEmail(details: DonationDetails) {
  const { email, name, amount, frequency, pdfBuffer } = details;
  const brevoApiKey = process.env.BREVO_API_KEY;

  if (!brevoApiKey) {
    console.error("ERREUR: La variable d'environnement BREVO_API_KEY est manquante.");
    return;
  }

  const subject =
    frequency === 'monthly'
      ? 'Merci pour votre soutien mensuel !'
      : 'Merci pour votre don !';

  // MODIFIÉ: Le texte mentionne la pièce jointe
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <img src="https://kenomi.eu/noBgColor.png" alt="Kenomi Logo" style="display: block; margin: 0 auto; width: 150px; margin-bottom: 20px;">
        <h1 style="font-size: 24px; color: #000;">Merci, ${name} !</h1>
        <p>Nous vous confirmons la réception de votre don et vous remercions chaleureusement pour votre soutien à la mission de Kenomi.</p>

        <h2 style="font-size: 20px; border-bottom: 2px solid #eee; padding-bottom: 5px;">Détails de votre don :</h2>
        <ul>
          <li><strong>Montant :</strong> ${amount.toFixed(2)} €</li>
          <li><strong>Fréquence :</strong> ${
            frequency === 'monthly' ? 'Mensuel' : 'Unique'
          }</li>
          <li><strong>Donateur :</strong> ${name} (${email})</li>
        </ul>
        <p>Votre générosité nous aide à réduire la fracture numérique en Belgique et à financer nos programmes "Tremplin Numérique" pour les jeunes.</p>

        <p>Veuillez trouver ci-joint votre attestation fiscale (reçu fiscal) pour ce don. Ce document officiel vous permettra de bénéficier de la déduction fiscale prévue par la législation belge en vigueur.</p>

        <br>
        <p>Avec gratitude,</p>
        <p><strong>L'équipe Kenomi</strong></p>
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;">
        <p style="font-size: 12px; color: #888; text-align: center;">Kenomi ASBL - 18, rue Buchholtz 1050 Bruxelles - [Votre BCE]</p>
      </div>
    </div>
  `;

  // Construction de la charge utile pour l'API Brevo
  // MODIFIÉ: Utilisation d'un type plus flexible pour le payload
  const payload: BrevoPayload = {
    sender: {
      name: 'Kenomi',
      email: 'kenji@kenomi.eu', // Doit être un expéditeur validé sur Brevo
    },
    to: [
      {
        email: email,
        name: name,
      },
    ],
    subject: subject,
    htmlContent: htmlContent,
  };

  // AJOUT: Logique d'attachement de la pièce jointe
  if (pdfBuffer) {
    payload.attachment = [
      {
        name: `Recu_Fiscal_Kenomi_${details.transactionId || 'Don'}.pdf`,
        // Le buffer doit être encodé en Base64 pour l'API Brevo
        content: Buffer.from(pdfBuffer).toString('base64'),
      },
    ];
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'api-key': brevoApiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erreur lors de l'envoi de l'e-mail Brevo:", errorData);
      throw new Error(`Erreur Brevo: ${errorData.message || 'Échec de l\'envoi de l\'e-mail.'}`);
    } else {
      console.log(`E-mail de confirmation (avec PDF) envoyé avec succès à ${email}.`);
    }
  } catch (error) {
    console.error("Erreur réseau lors de la communication avec Brevo:", error);
    throw error;
  }
}
