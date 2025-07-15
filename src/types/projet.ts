export interface Projet {
  id: string;
  titre: string;
  description: string;
  created_at: string;
}

export interface ProjetWithDetails extends Projet {
  details: string;
  status: 'en_cours' | 'termine' | 'annule';
  budget: number;
  equipe: string[];
}

export interface ProjetWithStats extends Projet {
  nombre_taches: number;
  avance: number; // Pourcentage d'avancement
  priorite: 'haute' | 'moyenne' | 'basse';
}

export interface ProjetWithClient extends Projet {
  client: {
    id: string;
    nom: string;
    email: string;
  };
}


export interface ProjetWithTeam extends Projet {
  equipe: {
    id: string;
    nom: string;
    role: string;
  }[];
}

export interface ProjetWithTimeline extends Projet {
  debut: string;
  fin: string;
  jalons: {
    titre: string;
    date: string;
  }[];
}




export interface ProjetWithFiles extends Projet {
  fichiers: {
    id: string;
    nom: string;
    url: string;
    type: string; // e.g., 'document', 'image', 'video'
  }[];
}
export interface ProjetWithComments extends Projet {
  commentaires: {
    id: string;
    auteur: string;
    contenu: string;
    date: string;
  }[];
}
export interface ProjetWithTasks extends Projet {
  taches: {
    id: string;
    titre: string;
    description: string;
    statut: 'a_faire' | 'en_cours' | 'termine';
    priorite: 'haute' | 'moyenne' | 'basse';
    date_echeance: string;
  }[];
}
export interface ProjetWithBudget extends Projet {
  budget: {
    total: number;
    depenses: number;
    reste: number;
  };
}
export interface ProjetWithResources extends Projet {
  ressources: {
    id: string;
    nom: string;
    type: 'humain' | 'materiel' | 'financier';
    quantite: number;
    disponibilite: boolean; // Indique si la ressource est disponible
  }[];
}

export interface ProjetWithRisks extends Projet {
  risques: {
    id: string;
    description: string;
    impact: 'haut' | 'moyen' | 'bas';
    probabilite: 'haute' | 'moyenne' | 'basse';
    plan_mitigation: string;
  }[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  created_at: string;
}
