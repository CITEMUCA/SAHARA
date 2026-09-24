# Moroccan Sahara Innovation Challenge 2026

Site officiel et plateforme de candidature : Cité de l'Innovation, Université Cadi Ayyad.
Événement du 29 au 31 octobre 2026, Marrakech.

## Démarrage

Prérequis : Node.js 22.13 ou plus récent (Python 3 uniquement pour régénérer la carte et les logos).

```bash
npm install
cp .env.example .env      # puis définir ADMIN_PASSWORD et DATABASE_URL
# Créer la base : CREATE DATABASE sic2026;
npm start
```

- Site : http://localhost:3000
- Espace organisateurs : http://localhost:3000/admin

## Modifier le contenu

| Quoi | Où |
|---|---|
| Textes FR / EN / AR (challenges, programme, FAQ, règlement…) | `public/js/i18n.js` |
| Partenaires, e-mail de contact, réseaux sociaux | `public/js/config.js` |
| Date de clôture, taille maximale des fichiers | `.env` |
| Couleurs, typographies | `public/css/style.css` (variables en tête de fichier) |

Après une modification des fichiers CSS/JS, lancer `node tools/bump_version.js` pour forcer le rechargement chez les visiteurs.

## Carte et logos

Le logo officiel est `public/assets/brand/logo-sic.png`. `python tools/build_map.py` régénère la carte des 12 régions du Royaume à partir de `tools/mar_adm1.geojson` (geoBoundaries / OpenStreetMap, licence ODbL).

## Données

Les candidatures sont stockées dans **PostgreSQL** (`DATABASE_URL` dans `.env`). Les fichiers déposés sont dans `data/uploads/`. Sauvegardez régulièrement la base et ce dossier ; ne les publiez jamais.

Le cahier des charges complet est dans `CAHIER_DES_CHARGES.md`.
