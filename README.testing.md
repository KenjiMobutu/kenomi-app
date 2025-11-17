# Guide de Tests - Kenomi App

Ce document décrit la stratégie de tests et comment exécuter les tests pour l'application Kenomi.

## 📚 Table des matières

- [Types de tests](#types-de-tests)
- [Installation](#installation)
- [Exécution des tests](#exécution-des-tests)
- [Structure des tests](#structure-des-tests)
- [Écrire de nouveaux tests](#écrire-de-nouveaux-tests)
- [Couverture de code](#couverture-de-code)
- [Meilleures pratiques](#meilleures-pratiques)

---

## 🧪 Types de tests

### 1. **Tests Unitaires** (Jest)
Tests pour les fonctions individuelles, les actions Supabase, et les utilitaires.

**Localisation** : `src/__tests__/unit/`

**Exemples** :
- `actions.test.ts` - Tests pour les actions de donations et projets
- `pdfGenerator.test.ts` - Tests pour la génération de PDF
- `emailClient.test.ts` - Tests pour l'envoi d'emails

### 2. **Tests d'Intégration** (Jest)
Tests pour les API routes et l'interaction entre composants.

**Localisation** : `src/__tests__/integration/`

**Exemples** :
- `api-donations.test.ts` - Tests pour l'API admin des donations
- `api-webhook.test.ts` - Tests pour les webhooks Stripe

### 3. **Tests de Composants** (React Testing Library)
Tests pour les composants React UI.

**Localisation** : `src/__tests__/components/`

**Exemples** :
- `B2BContactForm.test.tsx` - Tests pour le formulaire de contact B2B

### 4. **Tests E2E** (Playwright)
Tests de bout en bout simulant les parcours utilisateurs complets.

**Localisation** : `e2e/`

**Exemples** :
- `homepage.spec.ts` - Tests de la page d'accueil
- `donation-flow.spec.ts` - Tests du flux de donation complet

---

## 📦 Installation

Les dépendances de test sont déjà installées. Si nécessaire, réinstallez-les :

```bash
npm install
```

### Dépendances principales

- **Jest** : Framework de test JavaScript
- **React Testing Library** : Tests de composants React
- **Playwright** : Tests E2E multi-navigateurs
- **@testing-library/jest-dom** : Matchers Jest personnalisés

---

## ▶️ Exécution des tests

### Tests Unitaires et d'Intégration (Jest)

```bash
# Exécuter tous les tests unitaires et d'intégration
npm test

# Mode watch (re-exécute les tests à chaque modification)
npm run test:watch

# Générer un rapport de couverture
npm run test:coverage

# Tests en CI (avec couverture)
npm run test:ci
```

### Tests E2E (Playwright)

```bash
# Exécuter tous les tests E2E (headless)
npm run test:e2e

# Mode UI interactif
npm run test:e2e:ui

# Voir les navigateurs pendant l'exécution
npm run test:e2e:headed

# Voir le rapport HTML après exécution
npm run test:e2e:report
```

**⚠️ Important** : Les tests E2E démarrent automatiquement le serveur de développement sur `http://localhost:3000`

---

## 📁 Structure des tests

```
kenomi-app/
├── src/
│   └── __tests__/
│       ├── unit/               # Tests unitaires
│       │   ├── actions.test.ts
│       │   ├── pdfGenerator.test.ts
│       │   └── emailClient.test.ts
│       ├── integration/        # Tests d'intégration
│       │   ├── api-donations.test.ts
│       │   └── api-webhook.test.ts
│       └── components/         # Tests de composants
│           └── B2BContactForm.test.tsx
├── e2e/                        # Tests E2E Playwright
│   ├── homepage.spec.ts
│   └── donation-flow.spec.ts
├── jest.config.ts              # Configuration Jest
├── jest.setup.ts               # Setup global Jest
└── playwright.config.ts        # Configuration Playwright
```

---

## ✍️ Écrire de nouveaux tests

### Test Unitaire (Jest)

```typescript
import { maFonction } from '@/lib/maFonction'

describe('maFonction', () => {
  it('should do something', () => {
    const result = maFonction('input')
    expect(result).toBe('expected')
  })
})
```

### Test de Composant (React Testing Library)

```typescript
import { render, screen } from '@testing-library/react'
import MonComposant from '@/components/MonComposant'

describe('MonComposant', () => {
  it('should render correctly', () => {
    render(<MonComposant />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Test E2E (Playwright)

```typescript
import { test, expect } from '@playwright/test'

test('should navigate to page', async ({ page }) => {
  await page.goto('/ma-page')
  await expect(page).toHaveTitle(/Mon Titre/)
})
```

---

## 📊 Couverture de code

La couverture de code est configurée avec les seuils suivants :

- **Branches** : 50%
- **Fonctions** : 50%
- **Lignes** : 50%
- **Statements** : 50%

Pour voir le rapport de couverture :

```bash
npm run test:coverage
```

Le rapport est généré dans `coverage/lcov-report/index.html`

**Fichiers exclus de la couverture** :
- `*.d.ts` (types TypeScript)
- `*.stories.*` (Storybook)
- `__tests__/**`
- `app/layout.tsx`
- `middleware.ts`

---

## ✅ Meilleures pratiques

### 1. **Nommer les tests clairement**

```typescript
// ✅ Bon
it('should return 403 if user is not admin', async () => { ... })

// ❌ Mauvais
it('test1', () => { ... })
```

### 2. **Arrange, Act, Assert (AAA)**

```typescript
it('should calculate total', () => {
  // Arrange
  const amounts = [10, 20, 30]

  // Act
  const total = calculateTotal(amounts)

  // Assert
  expect(total).toBe(60)
})
```

### 3. **Isoler les tests**

Chaque test doit être indépendant. Utilisez `beforeEach` pour la configuration :

```typescript
beforeEach(() => {
  jest.clearAllMocks()
})
```

### 4. **Mocker les dépendances externes**

```typescript
jest.mock('@/lib/supabaseAdmin', () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}))
```

### 5. **Tester les cas limites**

```typescript
it('should handle empty array', () => {
  expect(calculateTotal([])).toBe(0)
})

it('should handle null values', () => {
  expect(formatName(null)).toBe('Anonyme')
})
```

### 6. **Tests E2E : Utiliser des sélecteurs sémantiques**

```typescript
// ✅ Bon
await page.getByRole('button', { name: 'Submit' })

// ⚠️ Acceptable
await page.getByLabel('Email')

// ❌ Fragile
await page.locator('.btn-primary')
```

---

## 🐛 Debugging

### Jest

```bash
# Mode debug
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Playwright

```bash
# Mode debug interactif
npm run test:e2e:ui

# Avec Chrome DevTools
PWDEBUG=1 npm run test:e2e
```

---

## 🚀 CI/CD

Pour exécuter les tests en CI (GitHub Actions, GitLab CI, etc.) :

```yaml
# Exemple GitHub Actions
- name: Run tests
  run: npm run test:ci

- name: Run E2E tests
  run: npm run test:e2e
```

---

## 📈 Objectifs de couverture

| Catégorie | Objectif actuel | Objectif futur |
|-----------|----------------|----------------|
| Actions | 50% | 80% |
| API Routes | 50% | 80% |
| Composants | 50% | 70% |
| Utilitaires | 50% | 90% |

---

## 🔗 Ressources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## ❓ FAQ

**Q: Les tests sont lents, comment les accélérer ?**
A: Utilisez `--maxWorkers=2` ou exécutez seulement les tests modifiés avec `--onlyChanged`

**Q: Comment tester une API route Next.js ?**
A: Importez directement la fonction handler et appelez-la avec un NextRequest mocké (voir `api-donations.test.ts`)

**Q: Comment mocker Clerk/Supabase ?**
A: Les mocks globaux sont dans `jest.setup.ts`. Vous pouvez les surcharger par test si nécessaire.

---

**📝 Note** : Ce guide sera mis à jour au fur et à mesure de l'évolution de la suite de tests.
