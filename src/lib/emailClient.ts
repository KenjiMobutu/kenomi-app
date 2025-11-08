// Emplacement: src/lib/emailClient.ts
// Ce fichier centralise la logique d'envoi d'e-mails transactionnels via Brevo.

/**
 * Définit les informations requises pour un e-mail de confirmation de don.
 */
interface DonationDetails {
  email: string;
  name: string;
  amount: number;
  frequency: 'once' | 'monthly';
}

/**
 * Envoie un e-mail de confirmation de don via l'API SMTP de Brevo.
 * @param details Les informations sur le donateur et la transaction.
 */
export async function sendDonationConfirmationEmail(details: DonationDetails) {
  const { email, name, amount, frequency } = details;
  const brevoApiKey = process.env.BREVO_API_KEY;

  if (!brevoApiKey) {
    console.error("ERREUR: La variable d'environnement BREVO_API_KEY est manquante.");
    // Ne pas bloquer le flux principal de paiement si l'e-mail échoue
    return;
  }

  // Détermine le sujet de l'e-mail en fonction de la fréquence
  const subject =
    frequency === 'monthly'
      ? 'Merci pour votre soutien mensuel !'
      : 'Merci pour votre don !';

  // Contenu HTML simple pour l'e-mail de confirmation
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <img src="https://kenomi.eu/noBgColor.png" alt="Kenomi Logo" style="width: 150px; margin-bottom: 20px;">
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
        <p>Vous recevrez un reçu fiscal pour votre contribution conformément à la législation en vigueur.</p>
        <br>
        <p>Avec gratitude,</p>
        <p><strong>L'équipe Kenomi</strong></p>
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;">
        <p style="font-size: 12px; color: #888;">Kenomi ASBL - [Votre adresse] - [Votre BCE]</p>
      </div>
    </div>
  `;

  // Construction de la charge utile pour l'API Brevo
  const payload = {
    sender: {
      name: 'Kenomi ASBL',
      email: 'contact@kenomi.eu', // Doit être un expéditeur validé sur Brevo
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
    } else {
      console.log(`E-mail de confirmation envoyé avec succès à ${email}.`);
    }
  } catch (error) {
    console.error("Erreur réseau lors de la communication avec Brevo:", error);
  }
}
