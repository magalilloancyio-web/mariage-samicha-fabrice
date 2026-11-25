# Samicha & Fabrice · Nos photos

Site de partage de photos pour le mariage de Samicha & Fabrice (25–27 juin 2027, Mas de Coulet, Brissac).
Les invités scannent un QR code, donnent leur prénom et leur nom, puis prennent ou choisissent des photos. Pas d'application ni de compte.

## Pages

| Adresse | Pour qui | Rôle |
|---|---|---|
| `/` | invités | Accueil, prénom + nom (mémorisés sur le téléphone) |
| `/photo` | invités | Prendre une photo / choisir dans la galerie, envoi automatique |
| `/galerie` | invités | Toutes les photos (ou compte à rebours avant la révélation) |
| `/diaporama` | écran / vidéoprojecteur | Photos en direct, nouvelles en priorité, QR code |
| `/qr` | mariés | Carte A5 à imprimer avec le QR code |
| `/maries` | mariés (code secret) | Direct ou révélation, date de révélation, masquer/supprimer |

**Mode révélation** : avant l'heure choisie, chaque invité ne voit que ses propres photos ; le serveur ne transmet jamais celles des autres. Les mariés peuvent aussi cliquer sur « Révéler maintenant ».

## Essayer en local (sans compte)

```bash
npm install
npm run dev
```

Sans configuration Supabase, le site fonctionne en **mode démo** : les photos sont stockées dans `.data/` et le code des mariés est `0000`.

## Mise en ligne

1. **Supabase** (gratuit) : créer un projet, région Europe. Dans *SQL Editor*, coller et exécuter `supabase/schema.sql`.
2. **Vercel** (gratuit) : importer ce dépôt GitHub, puis renseigner les variables de `.env.example` (*Settings > Environment Variables*).
3. Ouvrir `/maries`, régler le mode et imprimer le QR code depuis `/qr`.

## Récupérer toutes les photos après le mariage

```bash
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/telecharger-photos.mjs
```

Les photos sont rangées dans `photos-mariage/`, un dossier par invité.

## Technique

Next.js 15 + Tailwind CSS, Supabase (Postgres + Storage). Les photos sont redimensionnées sur le téléphone (2560 px, JPEG) avant l'envoi, avec une miniature. Elles sont envoyées directement vers Supabase et renvoyées automatiquement si le réseau coupe.
