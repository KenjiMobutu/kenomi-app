export async function checkRole(roleToCheck: string): Promise<boolean> {
  try {
    const res = await fetch('/api/user/role');
    const data = await res.json();
    return data.role === roleToCheck;
  } catch (err) {
    console.error('Erreur lors de la vérification du rôle:', err);
    return false;
  }
}

export async function getRole(): Promise<string> {
  try {
    const res = await fetch('/api/user/role');
    const data = await res.json();
    return data.role;
  } catch (err) {
    console.error('Erreur lors de la récupération du rôle:', err);
    return 'guest'; // Valeur par défaut en cas d'erreur
  }
}

export async function isAdmin(): Promise<boolean> {
  try {
    const res = await fetch('/api/user/role');
    const data = await res.json();
    return data.role === 'admin';
  } catch (err) {
    console.error('Erreur lors de la vérification du rôle admin:', err);
    return false;
  }
}
