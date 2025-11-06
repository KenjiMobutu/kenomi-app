import { MetadataRoute } from 'next'

// Ceci est un fichier sitemap de base.
// Pour les pages dynamiques (ex: /projects/[id]), vous devrez
// fetcher les projets depuis votre base de données et les ajouter à la liste.

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://kenomi.eu' // Assurez-vous que ceci est votre URL de production

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: `${baseUrl}/don`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/mentions_legales`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/politique_confidentialite`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/sign-up`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    // TODO: Ajoutez ici vos pages de projets dynamiques si nécessaire
    // Exemple :
    // const projects = await fetchAllProjects(); // Logique de fetch
    // const projectUrls = projects.map(project => ({
    //   url: `${baseUrl}/projects/${project.id}`,
    //   lastModified: new Date(project.updated_at),
    //   changeFrequency: 'monthly',
    //   priority: 0.6,
    // }));
    // return [...staticUrls, ...projectUrls];
  ]
}
