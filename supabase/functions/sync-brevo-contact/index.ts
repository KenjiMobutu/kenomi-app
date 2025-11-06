// Emplacement: supabase/functions/sync-brevo-contact/index.ts
// Ce code est Deno, pas Node.js

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY');
// L'ID de votre liste de contacts Brevo.
const BREVO_LIST_ID = 2;

// Définition du type pour le corps de la requête attendu
interface RequestPayload {
  email: string;
}

serve(async (req) => {
  try {
    // Étape 1: Extraire l'email du corps de la requête
    const payload: RequestPayload = await req.json();
    const email = payload.email;

    if (!email) {
      throw new Error('Email manquant dans le payload de la requête.');
    }

    if (!BREVO_API_KEY) {
      throw new Error('Clé API Brevo non configurée dans Supabase Vault.');
    }

    // Étape 2: Préparer et appeler l'API Brevo
    const brevoPayload = {
      email: email,
      listIds: [BREVO_LIST_ID],
      updateEnabled: true, // Met à jour le contact s'il existe déjà
    };

    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify(brevoPayload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur API Brevo:', errorData);
      throw new Error(`Échec de la synchronisation Brevo: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('Contact synchronisé avec Brevo:', data);

    // Étape 3: Répondre avec succès
    return new Response(JSON.stringify({ success: true, data }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error('Erreur dans la Edge Function:', err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
