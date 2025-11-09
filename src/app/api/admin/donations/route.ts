import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDonationsData } from '@/lib/actions';

/**
 * Récupère la liste paginée et les statistiques des dons.
 * CETTE ROUTE EST PROTÉGÉE ET NÉCESSITE LE RÔLE "ADMIN".
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Authentification et vérification du rôle via Clerk (côté serveur)
    const { sessionClaims } = await auth();

    if (sessionClaims?.metadata?.role !== 'admin') {
      return NextResponse.json({ error: "Accès refusé. Vous n'avez pas les droits administrateur." }, { status: 403 }); // 403 Forbidden
    }

    // 2. Extraire les paramètres de l'URL
    const { searchParams } = req.nextUrl;
    const options = {
      page: parseInt(searchParams.get('page') || '1', 10),
      pageSize: parseInt(searchParams.get('pageSize') || '20', 10),
      search: searchParams.get('search') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      status: searchParams.get('status') || 'all',
      currency: searchParams.get('currency') || 'all',
      minAmount: searchParams.has('minAmount') ? parseFloat(searchParams.get('minAmount')!) : undefined,
      sortKey: searchParams.get('sortKey') || 'created_at',
      sortDirection: (searchParams.get('sortDirection') || 'desc') as 'asc' | 'desc',
    };

    // 3. L'utilisateur est admin, récupération des données via la nouvelle action
    const data = await getDonationsData(options);

    // 4. Succès
    return NextResponse.json(data, { status: 200 });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Erreur serveur interne.";
    console.error(`Échec de la récupération des dons admin: ${errorMessage}`);
    return NextResponse.json({ error: "Une erreur serveur interne est survenue." }, { status: 500 });
  }
}
