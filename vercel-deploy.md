# 🚀 Déploiement de l'application Kenomi sur Vercel

Ce guide décrit comment déployer et maintenir l’application **Kenomi** (Next.js + Supabase) sur **Vercel**, avec un workflow Git propre, sécurisé et automatisé.

---

## 🛠 Prérequis

- ✔️ Compte GitHub avec le repo Kenomi
- ✔️ Compte Vercel (https://vercel.com)
- ✔️ Projet Next.js fonctionnel
- ✔️ Supabase configuré avec base de données PostgreSQL
- ✔️ Fichier `.env.local` prêt (voir ci-dessous)

---

## 📁 1. Structure recommandée

```
kenomi/
├── pages/
├── components/
├── lib/
├── styles/
├── public/
├── .env.local
├── vercel.json (optionnel)
└── ...
```

---

## 🔐 2. Variables d’environnement

Crée un fichier `.env.local` à la racine avec les variables nécessaires :

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-secret-key # (uniquement côté serveur)
```

**⚠️ Ne commit jamais `.env.local` dans le dépôt.**
Ajoute-le à `.gitignore`.

---

## ☁️ 3. Déploiement via Vercel

### Étapes :

1. Connecte-toi sur [https://vercel.com](https://vercel.com)
2. Clique sur **"New Project"**
3. Lien ton compte GitHub → sélectionne ton repo Kenomi
4. Vercel détecte automatiquement Next.js
5. Clique sur **"Environment Variables"** → ajoute les clés de `.env.local`
6. Clique sur **"Deploy"**

---

## 🌐 4. URLs et branches

- **Production** : `https://kenomi.vercel.app` *(branche `main` ou `production`)*
- **Previews** : à chaque PR ou push sur une autre branche → preview unique

---

## ⚙️ 5. Commandes de développement (en local)

```bash
# Installation des dépendances
npm install

# Lancer le serveur local avec les envs
npm run dev
```

---

## 🧠 6. Conseils de gestion

- Utilise les **API routes** Next.js si tu veux sécuriser des appels vers Supabase avec `SUPABASE_SERVICE_ROLE_KEY`.
- Utilise les **Middleware Vercel Edge** si besoin de protection ou redirections.
- Tu peux configurer le routing ou les headers dans un fichier `vercel.json`.

---

## ✅ 7. Configuration avancée (optionnelle)

`vercel.json` :

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" }
  ],
  "redirects": [],
  "headers": [],
  "cleanUrls": true
}
```

---

## 🧹 8. Bonnes pratiques

- Une PR = une branche = un déploiement preview
- Sécuriser les routes sensibles côté serveur
- Mettre à jour les clés Supabase dès rotation
- Monitorer les erreurs via le dashboard Vercel

---

## 🧩 Ressources utiles

- Vercel : https://vercel.com/docs
- Supabase : https://supabase.com/docs
- Next.js : https://nextjs.org/docs

---

Déploiement réussi ? Champagne. 🍾 
