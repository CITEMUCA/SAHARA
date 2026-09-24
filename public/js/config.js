/* Paramètres éditables par le comité d'organisation. */
window.SIC_CONFIG = {
  /* À confirmer par le comité d'organisation. */
  contactEmail: "sahara.challenge@uca.ac.ma",

  socials: [
    { icon: "fa-brands fa-linkedin-in", label: "LinkedIn", url: "https://www.linkedin.com/" },
    { icon: "fa-brands fa-instagram", label: "Instagram", url: "https://www.instagram.com/" },
    { icon: "fa-brands fa-facebook-f", label: "Facebook", url: "https://www.facebook.com/" },
    { icon: "fa-brands fa-youtube", label: "YouTube", url: "https://www.youtube.com/" },
  ],

  /*
   * Partenaires : déposer le logo dans /public/assets/partners/ puis ajouter une entrée.
   * tier : "gold" | "silver" | "media" | "institutional"
   * Exemple : { name: "Partenaire", logo: "/assets/partners/partenaire.png", url: "https://…", tier: "gold" }
   */
  partners: [
    { name: "Centre Régional d'Investissement Marrakech-Safi", logo: "/assets/partners/cri.jpeg", url: "https://www.cri-marrakech.ma/", tier: "institutional" },
    { name: "CGEM", logo: "/assets/partners/cgem.webp", url: "https://www.cgem.ma/", tier: "institutional" },
    { name: "Agence de Développement Social", logo: "/assets/partners/ads.jpeg", url: "https://www.ads.ma/", tier: "institutional" },
  ],

  partnerSlots: 0,
};
