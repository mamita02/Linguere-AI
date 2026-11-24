# LINGUERE AI — Mame Fatou Wade
Prototype V0.1 pour présentation CAIREAFRICA. Essential 100 000 FCFA / 7 régions / 1 compte ; Pro 250 000 FCFA / 14 régions / 4 comptes. Charte chocolat #4B281A, beige #F7F0E6, noir #191512, terracotta #A35D39.

## Démarrer immédiatement (Windows / PowerShell)
Décompresser puis ouvrir le dossier LINGUERE-AI dans VS Code. Node.js 20+ recommandé.
```
npm install
npm run dev
```
Ouvrir l'adresse localhost affichée. Sans .env, mode démonstration avec données fictives explicitement signalées. Choisir Essential/Pro dans l'en-tête ; ouvrir une opportunité, préparer un message WhatsApp et l'ajouter au suivi Pro. Les prospects de démo restent dans le navigateur. `npm test` exécute les tests du moteur local.

## Connecter Supabase réel
1. Créer un projet Supabase. Exécuter `supabase/migrations/001_init.sql` dans SQL Editor sur un projet neuf, une seule fois.
2. Dans Authentication > Users, créer un compte administrateur et un compte pilote. Copier leurs UUID. Exécuter en remplaçant les valeurs :
```sql
insert into companies(name,plan,regions) values ('CAIREAFRICA','pro',array['Dakar','Thiès','Diourbel','Fatick','Kaffrine','Kaolack','Kédougou','Kolda','Louga','Matam','Saint-Louis','Sédhiou','Tambacounda','Ziguinchor']);
insert into profiles(id,role) values ('UUID_ADMIN','super_admin');
insert into profiles(id,company_id,role) select 'UUID_CLIENT',id,'client' from companies where name='CAIREAFRICA';
```
Ne pas publier de compte ou mot de passe de démonstration réel. Le changement de pack et les comptes se gèrent actuellement dans SQL/Auth. Pour Essential, définir exactement 7 régions distinctes et retirer les utilisateurs excédentaires avant rétrogradation.
3. Copier `.env.example` en `.env` et renseigner URL Supabase et clé publique anon (jamais service_role). Relancer Vite.
4. Installer Supabase CLI selon sa documentation, puis `npx supabase login`, `npx supabase link --project-ref VOTRE_REF`, `npx supabase functions deploy collect`. Laisser la vérification JWT activée. Ajouter `BRAVE_SEARCH_API_KEY` dans les secrets Edge Functions. Optionnel : `GEMINI_API_KEY` et `GEMINI_MODEL` (nom d'un modèle disponible dans votre compte). Ne jamais mettre les clés dans le frontend. Vérifier les conditions de traitement des données avant activation Gemini.
5. Se connecter via le formulaire en bas de l'accueil et lancer une pige. La fonction effectue une ou deux recherches Brave (10 résultats max chacune). Les résultats sont des extraits web, non des annonces confirmées ; vérifier URL, disponibilité et prix. Le moteur ne contourne aucune restriction. Les scores locaux sont explicitement indiqués. Les baisses de prix exigent plusieurs observations fiables.

## Cloudflare Pages
Créer un dépôt GitHub privé et pousser le code (sans .env). Cloudflare Pages > Connect to Git > choisir le dépôt > framework Vite > build `npm run build` > dossier `dist`. Ajouter les deux variables VITE_ dans les paramètres du build si nécessaire. URL pages.dev attribuée par Cloudflare. Sans variables, le déploiement reste en démo. Vérifier quotas et conditions commerciales avant production.

## État réel et limites
- Fonctionnel en mode démo : navigation, filtres, score local, détails, messages WhatsApp manuels, pipeline prospects, notes/relances, exports CSV compatibles Excel, impression PDF, graphiques de répartition, comparaison de packs.
- Code backend fourni, à déployer et tester : Auth, RLS, quota de comptes, quota quotidien, recherche Brave, Gemini optionnel, historique de prix et logs. Le quota est par entreprise ; la collecte n'est pas encore planifiée ni mutualisée à cadence fixe. Les résultats sont partagés dans une base centrale, filtrés par RLS. La classification géographique est approximative. Aucun connecteur direct testé ; pas de Facebook automatisé ni Apify actif. Aucune promesse de couverture exhaustive.
- Non implémenté : Cron automatique, alertes WhatsApp Business API, API Apify, scraping direct par source, import manuel Facebook, carte géographique, scoring personnalisé par société, rapports hebdomadaires automatiques, attribution de prospects, facturation, CRUD administration depuis UI, export XLSX natif. Les onglets projets/appels d'offres/partenariats filtrent les résultats de recherche ; veille concurrentielle réservée mais aucun moteur spécialisé. L'ancienneté est basée sur première observation, pas date de publication ni preuve de disponibilité.
- Avant production : tests d'intégration et d'isolation avec comptes distincts, revue sécurité, consentements WhatsApp, conditions des sources et API, limites globales de coûts, pagination, règles de rétention, validation de prix, déploiement Cron avec authentification machine dédiée et quotas. Ne pas stocker de jeton utilisateur dans Cron. Le frontend n'est pas une garantie de sécurité ; les politiques SQL doivent être testées.

## Démonstration
Présenter le mode démo comme un prototype et CAIREAFRICA comme client cible jusqu'à utilisation effective. Montrer la collecte réelle uniquement après configuration et succès vérifié. Ne pas activer de services payants sans accord.
