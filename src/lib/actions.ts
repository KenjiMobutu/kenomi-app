
import { supabaseAdmin } from './supabaseAdmin';

// --- Interface pour les options de dons ---
interface GetDonationsOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  currency?: string;
  minAmount?: number;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Fonction utilitaire pour appliquer les filtres à une requête Supabase.
 */
function applyDonationFilters(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any, // Utilisation d'any pour éviter les conflits de types complexes
  options: GetDonationsOptions
) {
  const { search, startDate, endDate, status, currency, minAmount } = options;

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  }
  if (startDate) {
    query = query.gte('created_at', startDate);
  }
  if (endDate) {
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
    query = query.lt('created_at', adjustedEndDate.toISOString());
  }
  if (status && status !== 'all') {
    query = query.eq('status', status);
  }
  if (currency && currency !== 'all') {
    query = query.eq('currency', currency);
  }
  if (minAmount) {
    query = query.gte('amount', minAmount);
  }

  return query;
}

/**
 * Récupère les données agrégées et paginées pour le tableau de bord des dons.
 */
export async function getDonationsData(options: GetDonationsOptions = {}) {
  const {
    page = 1,
    pageSize = 20,
    sortKey = 'created_at',
    sortDirection = 'desc',
  } = options;

  try {
    // 1. Requête pour les données paginées (pour le tableau)
    const paginatedQuery = applyDonationFilters(
      supabaseAdmin.from('donations').select('*'),
      options
    )
      .order(sortKey, { ascending: sortDirection === 'asc' })
      .range((page - 1) * pageSize, page * pageSize - 1);

    // 2. Requête pour le compte total (pour la pagination)
    const countQuery = applyDonationFilters(
      supabaseAdmin.from('donations').select('*', { count: 'exact', head: true }),
      options
    );

    // 3. Requête pour les statistiques globales (sans filtres complexes)
    const { data: statsData, error: statsError } = await supabaseAdmin
      .from('donations')
      .select('amount');

    if (statsError) throw statsError;

    const amounts = (statsData || []).map(d => d.amount);
    const total = amounts.reduce((sum, a) => sum + a, 0);
    const count = amounts.length;
    const average = count > 0 ? total / count : 0;
    const stats = { total, count, average };

    // 4. Requête pour les données des graphiques (groupées par mois)
    const { data: chartData, error: chartError } = await supabaseAdmin
      .from('donations')
      .select('created_at, amount');

    if (chartError) throw chartError;

    const monthlyMap = new Map<string, { total: number; count: number }>();

    (chartData || []).forEach(don => {
      const date = new Date(don.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const existing = monthlyMap.get(key) || { total: 0, count: 0 };
      existing.total += don.amount;
      existing.count += 1;
      monthlyMap.set(key, existing);
    });

    const sorted = [...monthlyMap.entries()].sort(([a], [b]) => a.localeCompare(b));
    const chartResult = {
      labels: sorted.map(([key]) => new Date(`${key}-02`).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })),
      amountData: sorted.map(([, value]) => value.total),
      countData: sorted.map(([, value]) => value.count),
    };

    // 5. Requête pour les Top Donateurs
    const { data: donorsData, error: donorsError } = await supabaseAdmin
      .from('donations')
      .select('name, email, amount');

    if (donorsError) throw donorsError;

    const donorMap = new Map<string, { name: string, email: string, total: number }>();

    (donorsData || []).forEach(d => {
      const key = d.email;
      if (!key) return;
      if (!donorMap.has(key)) {
        donorMap.set(key, { name: d.name || 'Anonyme', email: d.email, total: 0 });
      }
      donorMap.get(key)!.total += d.amount;
    });

    const topDonors = [...donorMap.values()].sort((a, b) => b.total - a.total).slice(0, 5);

    // Exécuter les requêtes paginées et de count
    const [paginatedResult, countResult] = await Promise.all([
      paginatedQuery,
      countQuery
    ]);

    // Gérer les erreurs potentielles
    if (paginatedResult.error) throw paginatedResult.error;
    if (countResult.error) throw countResult.error;

    // Retourner un objet de données complet
    return {
      paginatedData: paginatedResult.data ?? [],
      totalCount: countResult.count ?? 0,
      stats,
      chartData: chartResult,
      topDonors
    };

  } catch (error) {
    console.error('Erreur dans getDonationsData:', error);
    throw error;
  }
}

// --- Vos autres actions (projets) restent inchangées ---
export async function addProject(title: string, description: string) {
  const { data, error } = await supabaseAdmin
    .from('Project')
    .insert([{ title, description }]);
  if (error) throw error;
  return data;
}

interface GetProjectsOptions {
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export async function getProjects(options: GetProjectsOptions = {}) {
  const { search, startDate, endDate, page = 1, pageSize = 10 } = options;

  let query = supabaseAdmin
    .from('Project')
    .select('*', { count: 'exact' });

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }
  if (startDate) {
    query = query.gte('created_at', startDate);
  }
  if (endDate) {
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
    query = query.lt('created_at', adjustedEndDate.toISOString());
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);
  query = query.order('created_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) throw error;

  return { data, count: count ?? 0 };
}

export async function getProjectById(id: string) {
  const { data, error } = await supabaseAdmin
    .from('Project')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProject(id: string) {
  const { error } = await supabaseAdmin
    .from('Project')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function updateProject(id: string, title: string, description: string) {
  const { data, error } = await supabaseAdmin
    .from('Project')
    .update({ title, description })
    .eq('id', id);
  if (error) throw error;
  return data;
}
