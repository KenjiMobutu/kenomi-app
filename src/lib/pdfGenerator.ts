import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { DonationDetails } from '@/lib/emailClient'; // Nous réutiliserons ce type

// Interface étendue pour inclure la date
interface ReceiptDetails extends DonationDetails {
  donationDate: Date;
  transactionId: string;
}

/**
 * Génère un reçu fiscal simple au format PDF.
 * @param details Les informations sur le donateur et la transaction.
 * @returns Un Uint8Array contenant les octets du fichier PDF.
 */
export async function generateDonationPDF(details: ReceiptDetails): Promise<Uint8Array> {
  const { name, amount, frequency, donationDate, transactionId } = details;

  // Crée un nouveau document PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // Format A4
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const fontSize = 12;
  const padding = 50;
  let y = height - padding;

  // 1. En-tête de l'ASBL (À COMPLÉTER PAR VOS SOINS)
  page.drawText('Kenomi ASBL', {
    x: padding,
    y: y,
    size: 24,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  y -= 30;

  page.drawText('18, rue Buchholtz 1050 Bruxelles', { // MODIFIÉ: Adresse du fichier
    x: padding,
    y: y,
    size: fontSize,
    font: font,
  });
  y -= 15;
  page.drawText('BCE : [VOTRE NUMÉRO BCE ICI]', { // IMPORTANT: À REMPLIR
    x: padding,
    y: y,
    size: fontSize,
    font: font,
  });
  y -= 40;

  // 2. Titre du document
  page.drawText('Attestation Fiscale pour Don', {
    x: width / 2 - 100, // Centré approximativement
    y: y,
    size: 18,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.5),
  });
  y -= 30;

  // 3. Informations sur le donateur
  page.drawText(`Fait à Bruxelles, le ${donationDate.toLocaleDateString('fr-BE')}`, {
    x: padding,
    y: y,
    size: fontSize,
  });
  y -= 20;
  page.drawText(`Donateur : ${name}`, {
    x: padding,
    y: y,
    size: fontSize,
    font: boldFont,
  });
  y -= 15;
  page.drawText(`E-mail : ${details.email}`, {
    x: padding,
    y: y,
    size: fontSize,
  });
  y -= 40;

  // 4. Détails du don
  page.drawText('Nous certifions avoir reçu le don suivant à titre de libéralité :', {
    x: padding,
    y: y,
    size: fontSize,
  });
  y -= 30;

  page.drawText('Montant :', { x: padding + 20, y: y, size: fontSize, font: font });
  page.drawText(`${amount.toFixed(2)} EUR`, { x: 200, y: y, size: fontSize, font: boldFont });
  y -= 20;

  page.drawText('Type :', { x: padding + 20, y: y, size: fontSize, font: font });
  page.drawText(frequency === 'monthly' ? 'Paiement mensuel' : 'Paiement unique', { x: 200, y: y, size: fontSize });
  y -= 20;

  page.drawText('ID Transaction :', { x: padding + 20, y: y, size: fontSize, font: font });
  page.drawText(transactionId, { x: 200, y: y, size: 10, font: font });
  y -= 40;

  // 5. Mention légale
  page.drawText('Ce reçu est émis pour servir et valoir ce que de droit.', {
    x: padding,
    y: y,
    size: fontSize,
    font: font,
  });

  // Sauvegarde le document en octets (buffer)
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
