# Cahier des charges : Moroccan Sahara Innovation Challenge 2026

**Site officiel & plateforme de candidature**
*Un territoire · Un potentiel · Un avenir*

| Élément | Valeur |
|---|---|
| Maître d'ouvrage | Cité de l'Innovation, Université Cadi Ayyad (UCA), Marrakech |
| Co-organisateurs | Faculté des Sciences Semlalia (FSSM) · Faculté des Sciences et Techniques de Marrakech (FSTG) |
| Partenaires | À compléter |
| Événement | 1ʳᵉ édition, du **jeudi 29 au samedi 31 octobre 2026**, Marrakech |
| Occasion | Aïd Al Wahda, Fête de l'Unité (31 octobre) · Commémoration de la Glorieuse Marche Verte (6 novembre) |
| Version du document | 1.0 : 23 septembre 2026 |

---

## Sommaire

1. Contexte et objectifs
2. Périmètre du projet
3. Publics cibles et parcours utilisateurs
4. Architecture de l'information (arborescence)
5. Spécifications fonctionnelles détaillées : site public
6. Spécifications fonctionnelles : formulaire de candidature
7. Spécifications fonctionnelles : espace organisateurs
8. Charte graphique et identité visuelle
9. Multilinguisme (FR / EN / AR)
10. Contenus éditoriaux
11. Spécifications techniques
12. Sécurité et protection des données (loi 09-08)
13. Accessibilité, performance, SEO
14. Hébergement, déploiement, exploitation
15. Calendrier prévisionnel du projet web
16. Recette et critères d'acceptation
17. Livrables
18. Points à valider par le comité d'organisation
19. Évolutions futures (éditions suivantes)

---

## 1. Contexte et objectifs

### 1.1 Contexte

À l'occasion de l'**Aïd Al Wahda, Fête de l'Unité** (31 octobre) et de la **commémoration de la Glorieuse Marche Verte** (6 novembre), la Cité de l'Innovation de l'Université Cadi Ayyad institue un rendez-vous annuel consacré à l'innovation au service du développement des **Provinces du Sud** : le *Moroccan Sahara Innovation Challenge : Innover pour les Provinces du Sud*.

La 1ʳᵉ édition se déroule **du 29 au 31 octobre 2026 à Marrakech** ; la finale et la remise des prix ont lieu **le 31 octobre, jour de l'Aïd Al Wahda**. Les deux dates symboliques constituent l'occasion et le fil conducteur de l'événement.

Le Challenge mobilise étudiants, chercheurs, jeunes innovateurs, startups et porteurs de projets autour de **six grands challenges** thématiques et de **trois parcours de maturité** (IDEA, LAB, SCALE).

### 1.2 Objectifs du site

| # | Objectif | Indicateur de réussite |
|---|---|---|
| O1 | Présenter l'événement de façon claire, institutionnelle et attractive | Temps moyen sur la page > 2 min |
| O2 | Collecter les candidatures complètes, dossier joint | ≥ 150 candidatures complètes |
| O3 | Valoriser le territoire national, du nord à Lagouira, et les Provinces du Sud | Section carte consultée par > 50 % des visiteurs |
| O4 | Donner de la visibilité aux organisateurs et partenaires | Logos visibles sur toutes les tailles d'écran |
| O5 | Outiller le comité : tri, évaluation, export des candidatures | 100 % des candidatures exportables en CSV |
| O6 | Toucher un public national et international | Site disponible en FR, EN et AR |

---

## 2. Périmètre du projet

### 2.1 Inclus

- Site vitrine *one-page* (page unique à sections ancrées), responsive.
- Formulaire de candidature en 4 étapes, avec dépôt de fichier.
- Formulaire de contact / partenariat.
- Espace organisateurs sécurisé (tableau de bord, liste, fiche détaillée, statuts, notes, export CSV, messages).
- Identité visuelle de l'événement : logo, favicon, palette, typographies, motifs.
- Carte interactive du Royaume (12 régions, dont les 3 régions des Provinces du Sud).
- Trilinguisme FR / EN / AR (arabe en écriture droite-à-gauche).
- Règlement du Challenge et mentions relatives aux données personnelles.

### 2.2 Exclus (version 1)

- Envoi automatique d'e-mails de confirmation (voir § 19).
- Espace candidat avec compte et modification en ligne.
- Module d'évaluation par les membres du jury (grille de notation en ligne).
- Paiement en ligne (participation gratuite).

---

## 3. Publics cibles et parcours utilisateurs

### 3.1 Personas

| Persona | Profil | Besoin principal | Parcours |
|---|---|---|---|
| Salma, 22 ans | Étudiante en Master, FSTG | Comprendre le Challenge, trouver une équipe, candidater | IDEA |
| Dr. Karim, 41 ans | Enseignant-chercheur, brevet en biotechnologie marine | Valoriser un résultat de recherche | LAB |
| Youssef, 29 ans | Fondateur d'une startup logistique à Laâyoune | Déployer sa solution, rencontrer des investisseurs | SCALE |
| Partenaire | Entreprise, institution, investisseur | Évaluer l'opportunité de partenariat | Contact |
| Comité | Organisateurs UCA | Suivre, trier, évaluer, exporter | Admin |

### 3.2 Parcours type : candidat

1. Arrivée sur la page d'accueil (réseaux sociaux, lien universitaire).
2. Lecture de l'accroche, des dates et du compte à rebours.
3. Découverte des 6 challenges (fiche détaillée en fenêtre modale).
4. Choix du parcours IDEA / LAB / SCALE.
5. Clic « Candidater » → le parcours ou le challenge est **pré-sélectionné** dans le formulaire.
6. Remplissage en 4 étapes, brouillon enregistré automatiquement.
7. Envoi → écran de confirmation avec **numéro de référence** `SIC26-XXXXX`, copie et impression.

### 3.3 Parcours type : organisateur

1. Connexion à `/admin` par mot de passe.
2. Tableau de bord : volumes, répartitions, évolution quotidienne.
3. Liste filtrable → fiche détaillée → téléchargement du dossier → changement de statut → note interne.
4. Export CSV pour le jury (Excel).

---

## 4. Architecture de l'information

```
/  (page unique)
├── Bandeau symbolique : 31 octobre : Aïd Al Wahda · 6 novembre : Marche Verte
├── En-tête : logo · navigation · langues FR/EN/ع · bouton « Candidater »
├── #top           Héros : titre, slogan, dates, lieu, compte à rebours, appels à l'action
├── Bandeau « Organisé par » : UCA · Cité de l'Innovation · FSSM · FSTG
├── #unity         Une séquence hautement symbolique (31 octobre / 6 novembre)
├── #about         Contexte & ambition + chiffres clés
├── #territory     Carte interactive du Royaume + atouts des Provinces du Sud
├── #challenges    6 grands challenges (fiches modales)
├── #tracks        3 parcours IDEA · LAB · SCALE
├── #criteria      Critères de sélection + question clé
├── #prizes        Grand Prix · 3 prix de parcours · 6 prix thématiques · Coup de cœur
├── #continuum     Du Challenge au déploiement (9 étapes) + accompagnement 12 mois
├── #programme     Programme 29-31 octobre + calendrier prévisionnel
├── #ambition      Un rendez-vous annuel
├── #partners      Organisateurs & partenaires + appel à partenariat
├── #register      Formulaire de candidature (4 étapes)
├── #faq           Questions fréquentes
├── #contact       Formulaire de contact
└── Pied de page : liens, règlement, données personnelles, espace organisateurs

/admin  Espace organisateurs (non indexé)
```

---

## 5. Spécifications fonctionnelles : site public

### 5.1 En-tête

| Réf. | Exigence |
|---|---|
| H-01 | Bandeau fixe aux couleurs nationales (rouge / vert) rappelant les deux dates symboliques ; il se masque au défilement. |
| H-02 | En-tête fixe, transparent sur le héros, puis fond clair givré après 40 px de défilement. |
| H-03 | Logo « MOROCCAN / SAHARA / Innovation Challenge 2026 » cliquable (retour en haut). |
| H-04 | 8 liens d'ancre ; le lien de la section visible est mis en évidence. |
| H-05 | Sélecteur de langue FR / EN / ع, mémorisé dans le navigateur. |
| H-06 | Bouton « Candidater » toujours accessible. |
| H-07 | **Aucun débordement horizontal** : sous 1240 px, la navigation passe dans un menu burger plein écran. |

### 5.2 Héros

- Ciel nocturne animé (étoiles scintillantes, étoiles filantes), aurore dorée et bleue, dunes animées en bas de section.
- Titre : « Moroccan » / « Sahara » (dégradé or) / « Innovation Challenge » / « 2026 ».
- Slogan : *Un territoire · Un potentiel · Un avenir*.
- Pastilles : **29 → 31 octobre 2026** · Marrakech · Cité de l'Innovation UCA.
- Deux boutons : « Déposer ma candidature » / « Découvrir les challenges ».
- Emblème flottant (logo) avec orbites et étiquettes (6 Challenges, IDEA · LAB · SCALE, Dakhla Atlantique).
- Compte à rebours jusqu'à la clôture des candidatures (jours, heures, minutes, secondes), date lue depuis le serveur ; à l'échéance : message « candidatures closes ».

### 5.3 Une séquence symbolique

Deux cartes : **31 octobre : Aïd Al Wahda** (rouge ; finale et remise des prix le jour même) et **6 novembre : Glorieuse Marche Verte** (vert ; séquence symbolique).

### 5.4 Contexte & chiffres clés

Textes de contexte + 5 compteurs animés : **6** challenges · **3** parcours · **3** jours de Challenge · **11** prix & distinctions · **1** an de maturation.

### 5.5 Carte du Royaume

| Réf. | Exigence |
|---|---|
| M-01 | Carte vectorielle (SVG) du **territoire national complet, de Tanger à Lagouira**, en **12 régions officielles**, dont Guelmim-Oued Noun, Laâyoune-Sakia El Hamra et Dakhla-Oued Ed-Dahab. |
| M-02 | Seul le territoire national est représenté (ni pays voisins, ni flèches). |
| M-03 | Toutes les régions en **dégradé doré** ; survol ou focus : la région passe **en blanc** avec un halo. |
| M-04 | Info-bulle au survol : nom de la région (traduit). |
| M-05 | Villes : Rabat (capitale), Casablanca, Tanger, Fès, Oujda, Marrakech (ville hôte, étoile rouge pulsante), Agadir, Guelmim, Tan-Tan, Laâyoune, Es-Semara, Boujdour, Dakhla, Lagouira. Pas de légende sous la carte. |
| M-06 | Régions accessibles au clavier (tabulation) et au toucher. |
| M-07 | Données : geoBoundaries / OpenStreetMap (licence ODbL), converties par `tools/build_map.py` (12 Ko). |

À côté : 6 atouts (icônes seules) : Port Dakhla Atlantique, énergies renouvelables, économie bleue, agriculture résiliente, logistique & connectivité, tourisme & patrimoine.

### 5.6 Six grands challenges

Grille de 6 cartes (numéro, icône, couleur propre, titre, résumé, 4 mots-clés). Le bouton « Découvrir » ouvre une fenêtre modale : texte intégral, tous les mots-clés et bouton « Candidater sur ce challenge », qui pré-sélectionne le challenge dans le formulaire.

| N° | Challenge | Couleur |
|---|---|---|
| 1 | Océan, Port & Économie bleue | Bleu océan `#1E9BD7` |
| 2 | Eau, Énergies renouvelables & Transition verte | Vert `#1B8A4B` |
| 3 | Agriculture, Alimentation & Bioressources | Ocre `#C98B2B` |
| 4 | Mobilité, Logistique, Connectivité & Territoires intelligents | Indigo `#5B5FC7` |
| 5 | Art, Culture, Tourisme, Sport & Expérience territoriale | Rouge `#C1272D` |
| 6 | Entrepreneuriat, Investissement & Nouvelles chaînes de valeur | Cuivre `#B8652F` |

Encart transversal : ouverture sur l'Afrique et l'espace atlantique, réplicabilité.

### 5.7 Trois parcours

Cartes IDEA (or), LAB (bleu), SCALE (cuivre) : slogan, flux (IDEA → SOLUTION, LAB → TERRITORY, SOLUTION → MARKET & SCALE), jauge de maturité, public, description, formes possibles, bouton de candidature avec pré-sélection du parcours.

### 5.8 Critères, prix, continuum

- **Critères** : 8 critères communs + mise en exergue de la question clé.
- **Prix** : Grand Prix (carte dorée), Prix IDEA : Best Emerging Innovation, Prix LAB : Best Research Valorization, Prix SCALE : Best Market & Deployment Potential, 6 prix thématiques, Prix Coup de cœur du Jury.
- **Continuum** : frise animée en 9 étapes (Détection → … → Impact) + 9 axes d'accompagnement du programme de maturation de 12 mois.

### 5.9 Programme (29-31 octobre 2026)

| Jour | Créneau | Séquence |
|---|---|---|
| Jeudi 29 oct. | Matinée | Accueil, cérémonie d'ouverture, conférence inaugurale, présentation des challenges et des parcours, lancement officiel |
| Jeudi 29 oct. | Après-midi | Project Clinics : accompagnement individualisé équipe par équipe |
| Vendredi 30 oct. | Matinée | Bootcamp : Innovation & Proposition de valeur · Business Model & Marché · Pitch & Storytelling |
| Vendredi 30 oct. | Après-midi | Mise en pratique & coaching |
| Samedi 31 oct. | Matinée | Coaching final, finalisation des supports, répétitions, préparation aux questions du jury |
| Samedi 31 oct. : Aïd Al Wahda | Après-midi | Final Pitches, délibération, cérémonie de remise des prix, clôture |

Présentation en frise verticale (date, pictogramme, carte détaillée, modalité, objectif).

### 5.10 Calendrier prévisionnel

| Date | Étape |
|---|---|
| 23 septembre 2026 | Ouverture des candidatures |
| 18 octobre 2026, 23h59 | Clôture des candidatures |
| 21 octobre 2026 | Annonce des équipes retenues |
| 22 → 28 octobre 2026 | Suivi à distance des équipes retenues |
| 29 octobre 2026 | Ouverture, lancement & Project Clinics |
| 30 octobre 2026 | Bootcamp & coaching |
| 31 octobre 2026 | Final Pitches & Awards (Aïd Al Wahda) |
| Novembre 2026 → 2027 | Programme de maturation (12 mois) |

Mention : « Dates prévisionnelles, susceptibles d'ajustement par le comité d'organisation. »

### 5.11 Organisateurs & partenaires

- Organisateurs : Cité de l'Innovation (mise en avant), UCA, FSSM, FSTG : logos officiels sur cartes blanches.
- Partenaires : grille alimentée par `public/js/config.js` (nom, logo, lien, niveau : gold / silver / media / institutional). Tant que la liste est incomplète, emplacements « Votre logo ici » cliquables vers le formulaire de contact (objet « Devenir partenaire » pré-sélectionné).
- Bandeau d'appel à partenariat.

### 5.12 FAQ, contact, pied de page

- FAQ : 9 questions en accordéon (une seule ouverte à la fois).
- Contact : nom, e-mail, objet (information, partenariat, mentor / jury, presse), message ; anti-robots ; confirmation à l'écran.
- Pied de page : liserés rouge et vert, logo, slogan, navigation, règlement, données personnelles, espace organisateurs, mentions.
- Règlement (10 articles) affiché en fenêtre modale.

---

## 6. Formulaire de candidature

### 6.1 Principes

- 4 étapes avec barre de progression et indicateur « Étape n sur 4 ».
- Validation à chaque étape (côté navigateur) **et** à la réception (côté serveur).
- Messages d'erreur en langue courante, sous le champ concerné.
- **Brouillon automatique** dans le navigateur (hors fichier), restauré à la visite suivante ; bouton « Effacer le brouillon ».
- Pré-sélection du parcours et du challenge depuis les sections du site.
- Fermeture automatique à la date de clôture (message dédié).

### 6.2 Champs

**Étape 1 : Porteur de projet**

| Champ | Type | Obligatoire | Règle |
|---|---|---|---|
| Prénom, Nom | texte | oui | 80 caractères max |
| E-mail | e-mail | oui | format valide |
| Téléphone (WhatsApp) | tél. | oui | 8 à 20 caractères, `+212…` |
| Genre | liste | non | Femme / Homme / Non précisé |
| Ville de résidence | texte | oui | - |
| Profil | liste | oui | Étudiant(e), Doctorant(e), Enseignant-chercheur, Fondateur de startup, Professionnel(le), Autre |
| Établissement / Laboratoire / Structure | texte | oui | - |
| Filière, niveau ou fonction | texte | non | - |
| LinkedIn | URL | non | http(s) |

**Étape 2 : Équipe**

| Champ | Type | Obligatoire | Règle |
|---|---|---|---|
| Nom de l'équipe | texte | non | - |
| Taille de l'équipe | compteur − / + | oui | 1 à 6, porteur inclus |
| Membres (taille − 1 blocs) | nom, e-mail, rôle, établissement | nom obligatoire | e-mail valide si renseigné |

**Étape 3 : Projet**

| Champ | Type | Obligatoire | Règle |
|---|---|---|---|
| Parcours | cartes IDEA / LAB / SCALE | oui | - |
| Challenge | 6 cartes | oui | - |
| Titre | texte | oui | 3 à 150 caractères |
| Résumé (pitch) | zone de texte + compteur | oui | 50 à 700 caractères |
| Défi / opportunité dans les Provinces du Sud | zone de texte | oui | 30 à 1 500 caractères |
| Solution proposée | zone de texte | oui | 30 à 1 500 caractères |
| Caractère innovant, cibles, impact | zones de texte | non | 800 à 1 200 caractères |
| Territoire(s) ciblé(s) | choix multiples | oui (≥ 1) | Guelmim-Oued Noun / Laâyoune-Sakia El Hamra / Dakhla-Oued Ed-Dahab / Ensemble des Provinces du Sud |
| Stade de maturité | liste | oui | Idée → Sur le marché (6 niveaux) |
| Propriété intellectuelle | liste | non | 5 statuts |
| TRL | curseur 1-9 | **oui si LAB** | affiché uniquement pour LAB |
| Startup : nom, année, forme juridique | texte | **nom obligatoire si SCALE** | affiché uniquement pour SCALE |
| Besoins d'accompagnement | choix multiples | non | 8 besoins |

**Étape 4 : Dossier & validation**

| Champ | Type | Obligatoire | Règle |
|---|---|---|---|
| Dossier de présentation | glisser-déposer / parcourir | oui | PDF, PPT ou PPTX : 5 Mo max |
| Vidéo, site web | URL | non | http(s) |
| Source de connaissance du Challenge | liste | non | 6 choix |
| Récapitulatif | lecture seule | - | titre, parcours, challenge, porteur, e-mail, équipe |
| Acceptation du règlement | case | oui | lien vers le règlement |
| Consentement données (loi 09-08) | case | oui | - |
| Droit à l'image | case | non | - |

### 6.3 Envoi et confirmation

- Envoi avec **pourcentage d'avancement** du téléversement.
- Contrôle des doublons (même e-mail + même titre) → message avec la référence existante.
- Limitation : 8 envois / 15 min / adresse IP ; champ piège anti-robots.
- Confirmation : référence `SIC26-XXXXX`, bouton copier, récapitulatif imprimable, prochaines étapes.

---

## 7. Espace organisateurs (`/admin`)

| Réf. | Fonction | Détail |
|---|---|---|
| A-01 | Connexion | Mot de passe unique (variable `ADMIN_PASSWORD`), jeton de session de 8 h, 10 tentatives / 15 min. |
| A-02 | Tableau de bord | Candidatures, participants, présélectionnées, messages non traités ; répartition par parcours, statut, challenge ; histogramme journalier. |
| A-03 | Liste | Recherche (référence, titre, porteur, e-mail, établissement), filtres parcours / challenge / statut. |
| A-04 | Fiche détaillée | Projet, porteur, équipe, dossier et liens, consentements. |
| A-05 | Statuts | Reçue → En évaluation → Présélectionnée → Finaliste → Lauréate / Non retenue. |
| A-06 | Note interne | Texte libre pour le comité et le jury. |
| A-07 | Dossier | Téléchargement du fichier, renommé `SIC26-XXXXX_nom.pdf`. |
| A-08 | Export | CSV (séparateur `;`, UTF-8 avec BOM, lisible directement dans Excel), 35 colonnes. |
| A-09 | Suppression | Candidature et fichier, avec confirmation. |
| A-10 | Messages | Liste des messages de contact, marquage traité / à traiter. |

---

## 8. Charte graphique

### 8.1 Concept

« **Nuit saharienne & aube dorée** » : un ciel étoilé au-dessus des dunes, l'or du sable et du soleil levant, le bleu de l'Atlantique, et le rouge et le vert de l'Unité nationale.

### 8.2 Logo

- **Emblème officiel** : sceau circulaire doré portant l'inscription « MOROCCAN SAHARA INNOVATION CHALLENGE ». Au centre, une **ampoule** (symbole de l'innovation) renfermant la **silhouette complète du Royaume**, d'où jaillit la lumière. Le médaillon est orné d'étoiles à huit branches et d'arabesques d'inspiration marocaine.
- **Logotype du site** : « MOROCCAN » (petites capitales espacées) / « SAHARA » (capitales grasses) / « INNOVATION CHALLENGE 2026 », accolé à l'emblème dans l'en-tête et le pied de page.
- Fichier : `public/assets/brand/logo-sic.png` (500 × 500 px, fond transparent), utilisé aussi comme favicon et image de partage.
- Zone de protection : ¼ du diamètre de l'emblème. Taille minimale : 32 px (favicon), 48 px (écran).

### 8.3 Palette

| Nom | Hex | Usage |
|---|---|---|
| Nuit | `#070D22` / `#0D1736` | Fonds sombres, texte sur clair |
| Sable | `#FDFAF4` / `#F8F1E4` | Fonds clairs |
| Or | `#F4C95D` / `#E8A93B` | Accents, titres, carte |
| Cuivre (UCA) | `#B8652F` / `#D98A45` | Boutons, liens, accents |
| Océan (Cité de l'Innovation) | `#1E9BD7` / `#7FD0F2` | Parcours LAB, port, liens secondaires |
| Rouge national | `#C1272D` | Unité, logo, Aïd Al Wahda |
| Vert national | `#1B8A4B` | Étoile, Marche Verte, succès |

### 8.4 Typographies

| Usage | Latin | Arabe |
|---|---|---|
| Titres | Sora 600-800 | Reem Kufi 500-700 |
| Texte | Inter 400-700 | IBM Plex Sans Arabic 400-700 |
| Citations, slogans | Instrument Serif (italique) | IBM Plex Sans Arabic 600 |

Icônes : **Font Awesome 6** (style *solid*), sans cadre ni pastille autour dans les listes d'atouts.

### 8.5 Motifs et effets

- Motif **zellige** (étoile à huit branches) en filigrane sur les sections claires.
- Rayons : 18 px (cartes), 28 px (blocs), boutons en pilule.
- Animations : apparition au défilement, compteurs, étoiles, dunes ; désactivées si l'utilisateur a choisi de réduire les animations.

---

## 9. Multilinguisme

- Langues : **français** (par défaut), **anglais**, **arabe**.
- Changement instantané sans rechargement ; choix mémorisé ; lien direct `?lang=fr|en|ar`.
- Arabe : `dir="rtl"`, mise en page miroir par propriétés logiques CSS, polices arabes dédiées, flèches inversées.
- Champs e-mail, téléphone et URL toujours saisis de gauche à droite.
- Terminologie officielle : « Provinces du Sud » / « الأقاليم الجنوبية », « Aïd Al Wahda » / « عيد الوحدة », « Glorieuse Marche Verte » / « المسيرة الخضراء المظفرة », noms officiels des 12 régions.
- Tous les contenus sont centralisés dans `public/js/i18n.js`.

---

## 10. Contenus éditoriaux

| Contenu | Source | Statut |
|---|---|---|
| Contexte, 6 challenges, 3 parcours, critères, prix, continuum, programme | Note de cadrage du comité | Intégré FR / EN / AR |
| Règlement (10 articles), FAQ (9 questions) | Rédaction proposée | **À valider** |
| Calendrier des candidatures (18, 21, 22-28 octobre) | Proposition | **À valider** |
| Logos organisateurs | Fournis | Intégrés |
| Logos partenaires | À fournir (PNG/SVG transparent, ≥ 400 px) | En attente |
| E-mail de contact, réseaux sociaux | `public/js/config.js` | **À confirmer** |

---

## 11. Spécifications techniques

| Élément | Choix |
|---|---|
| Serveur | Node.js ≥ 22.13, Express 4 |
| Base de données | SQLite intégré à Node (`node:sqlite`), fichier `data/sic2026.db` : aucune installation |
| Fichiers | Multer 2, stockage `data/uploads/`, noms aléatoires |
| Front | HTML5, CSS3, JavaScript natif : **sans framework**, sans étape de compilation |
| Carte / logos | SVG générés par `tools/build_map.py` (Python 3) |
| Polices / icônes | Google Fonts, Font Awesome 6 (CDN) |
| Configuration | Fichier `.env` : `PORT`, `ADMIN_PASSWORD`, `REG_DEADLINE`, `MAX_FILE_MB`, `DATA_DIR` |

### 11.1 API

| Méthode | Route | Accès | Rôle |
|---|---|---|---|
| GET | `/api/config` | public | État des candidatures, date de clôture, taille maximale |
| POST | `/api/register` | public | Dépôt d'une candidature (multipart) |
| POST | `/api/contact` | public | Message de contact |
| POST | `/api/admin/login` · `/logout` | - | Session organisateur |
| GET | `/api/admin/stats` | admin | Indicateurs |
| GET | `/api/admin/registrations` | admin | Liste filtrée |
| GET / PATCH / DELETE | `/api/admin/registrations/:id` | admin | Fiche, statut & note, suppression |
| GET | `/api/admin/registrations/:id/file` | admin | Dossier |
| GET | `/api/admin/export.csv` | admin | Export |
| GET / PATCH | `/api/admin/messages[/:id]` | admin | Messages |

### 11.2 Modèle de données

- `registrations` : id, ref, created_at, updated_at, status, track, challenge, title, leader_name, email, phone, institution, city, team_size, lang, file_path, file_original, file_size, payload (JSON complet), admin_note, ip_hash.
- `messages` : id, created_at, name, email, subject, message, handled.

---

## 12. Sécurité et données personnelles

- Conformité à la **loi n° 09-08** ; déclaration du traitement auprès de la **CNDP** à effectuer par l'UCA.
- Consentement explicite et séparé : règlement, traitement des données, droit à l'image (facultatif).
- Finalité unique : gestion du Challenge. Durée de conservation proposée : 24 mois après l'édition.
- Adresses IP non stockées en clair (empreinte).
- Mot de passe d'administration comparé à temps constant ; jetons aléatoires de 256 bits.
- Limitation du nombre de requêtes (candidature, contact, connexion) ; champ piège anti-robots.
- Contrôle des extensions et de la taille des fichiers ; fichiers non accessibles publiquement.
- En-têtes de sécurité : `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`.
- **Production : HTTPS obligatoire**, sauvegarde quotidienne du dossier `data/`.

---

## 13. Accessibilité, performance, SEO

- Objectif **WCAG 2.1 AA** : contrastes, navigation clavier, lien d'évitement, focus visible, libellés de formulaire, ARIA sur la carte et les fenêtres modales.
- Responsive : 360 px → 1920 px ; burger sous 1240 px ; formulaire sur une colonne sur mobile.
- Performance : carte 12 Ko, images en `lazy`, aucun framework ; objectif Lighthouse ≥ 90.
- SEO : titre et description traduits, Open Graph, favicon SVG, `/admin` en `noindex`.
- Anti-cache : fichiers servis en `no-cache` et versionnés (`tools/bump_version.js`).

---

## 14. Hébergement et exploitation

- Serveur de l'UCA ou VPS (1 vCPU, 1 Go RAM, 10 Go disque suffisent).
- Nom de domaine proposé : `saharachallenge.uca.ma` (à valider).
- Mise en service : `npm install` puis `npm start` derrière un reverse proxy (Nginx) avec certificat TLS.
- Supervision : redémarrage automatique (PM2 ou service Windows / systemd).
- Sauvegarde : copie quotidienne de `data/` (base + dossiers).

---

## 15. Calendrier prévisionnel du projet web

| Période | Étape |
|---|---|
| 23 septembre | Livraison de la version 1 (site + candidature + admin) |
| 24 → 28 septembre | Relecture des contenus, validation du règlement et du calendrier |
| 29 septembre → 2 octobre | Intégration des partenaires, mise en ligne sur le domaine définitif |
| Octobre | Campagne de communication, suivi quotidien des candidatures |
| 18 octobre | Clôture automatique |
| 19 → 21 octobre | Présélection via l'espace organisateurs, export pour le jury |
| Après le 31 octobre | Mise à jour avec les lauréats et les photos |

---

## 16. Recette et critères d'acceptation

| # | Scénario | Résultat attendu |
|---|---|---|
| R1 | Affichage 360, 768, 1024, 1250, 1440, 1920 px | Aucun débordement horizontal, en-tête sur une ligne |
| R2 | Changement de langue FR → AR → EN | Tous les textes traduits, sens RTL correct en arabe |
| R3 | Survol / tabulation sur la carte | Région en blanc + info-bulle traduite |
| R4 | Candidature IDEA complète avec PDF | Référence `SIC26-XXXXX` affichée, visible dans l'admin |
| R5 | Candidature LAB sans TRL / SCALE sans startup | Refus avec message sur le champ |
| R6 | Fichier autre que PDF/PPT/PPTX, ou > 5 Mo | Refus explicite |
| R7 | Deuxième envoi identique | Message « doublon » avec la référence |
| R8 | Rechargement pendant la saisie | Brouillon restauré |
| R9 | Après la date de clôture | Formulaire remplacé par « candidatures closes » |
| R10 | Accès `/api/admin/*` sans connexion | Refus (401) |
| R11 | Export CSV ouvert dans Excel | Accents corrects, une ligne par candidature |

---

## 17. Livrables

- Code source complet (`server.js`, `public/`, `tools/`), `package.json`, `.env.example`, `README.md`.
- Identité visuelle : `logo-sic.png` (emblème officiel).
- Carte : `public/assets/map/morocco-map.js` + générateur.
- Le présent cahier des charges.

---

## 18. Points à valider par le comité

1. Nom officiel : « Moroccan Sahara Innovation Challenge » (le site utilise ce nom).
2. Dates de clôture (18 octobre), d'annonce des équipes (21 octobre) et de suivi à distance (22-28 octobre).
3. Lieu précis de l'événement à Marrakech (Cité de l'Innovation ?).
4. Gratuité de la participation (indiquée dans la FAQ).
5. E-mail de contact officiel et comptes de réseaux sociaux.
6. Liste et logos des partenaires ; dotations des prix.
7. Textes du règlement et de la FAQ.
8. Déclaration CNDP et durée de conservation des données.
9. Nom de domaine et hébergement.

---

## 19. Évolutions futures

- E-mail automatique de confirmation (avec le récapitulatif) et notifications de changement de statut.
- Espace candidat : suivi et modification jusqu'à la clôture.
- Module jury : grille de notation pondérée par critère, classement automatique.
- Galerie photos et vidéos, page des lauréats, archives par édition.
- Pages dédiées par challenge et par parcours pour le référencement.
- Ajout d'une version en amazighe (tifinagh).
