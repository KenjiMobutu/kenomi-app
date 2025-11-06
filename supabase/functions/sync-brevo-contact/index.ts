
// IMPORTANT: Ce fichier doit être déployé sur Supabase via la CLI.
// Emplacement: supabase/functions/sync-brevo-contact/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// L'ID de votre liste de contacts Brevo.
// (Vous pouvez le trouver dans Brevo > Contacts > Listes)
// Mettez "2" si c'est votre première liste, sinon ajustez.
const BREVO_LIST_ID = 2;

interface BrevoPayload {
  email: string;
  listIds: number[];
  updateEnabled: boolean;
}

interface TriggerRecord {
  email?: string;
  consent_given?: boolean;
  subscribed_at?: string;
  [key: string]: unknown;
}

interface RequestPayload {
  record?: TriggerRecord;
}

interface BrevoErrorResponse {
  message?: string;
  [key: string]: unknown;
}

serve(async (req: Request): Promise<Response> => {
  try {
    // 1. Récupérer le nouvel abonné depuis le payload du trigger
    const { record }: RequestPayload = await req.json();
    const email = record?.email;

    if (!email) {
      throw new Error('Email manquant dans le payload');
    }

    // 2. Récupérer la clé API Brevo depuis les secrets Supabase (Vault)
    const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY');
    if (!BREVO_API_KEY) {
      throw new Error('Clé API Brevo (BREVO_API_KEY) non configurée dans Supabase Vault.');
    }

    // 3. Préparer le corps de la requête pour l'API Brevo
    const brevoPayload: BrevoPayload = {
      email: email,
      listIds: [BREVO_LIST_ID], // Ajoute le contact à la liste spécifiée
      updateEnabled: true,      // Met à jour le contact s'il existe déjà
    };

    // 4. Appeler l'API Brevo pour créer/mettre à jour le contact
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify(brevoPayload),
    });

    // 5. Gérer la réponse de Brevo
    if (!response.ok) {
      const errorBody = await response.json() as BrevoErrorResponse;
      console.error('Erreur API Brevo:', errorBody.message || response.statusText);
      throw new Error(`Échec de la synchronisation Brevo: ${errorBody.message}`);
    }

    // 6. Succès
    return new Response(
      JSON.stringify({ success: true, message: `Contact ${email} synchronisé.` }),
      { headers: { 'Content-Type': 'application/json' } },
    );

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('Erreur dans la fonction Edge sync-brevo-contact:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
