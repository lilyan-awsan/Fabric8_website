/**
 * Fabric8 Default Settings & Instant Sector Pre-Hydration
 * Prevents FOUC (Flash of Unstyled/Hidden Content) with 0ms delay.
 */
(function() {
  'use strict';

  var defaultSettings = {
    brandLogos: [
      { backupSrc: "", id: "brand_district", name: "DISTRICT", src: "assets/site_images/district.png" },
      { backupSrc: "", id: "brand_alibi", name: "ALIBI", src: "assets/site_images/alibi.png" },
      { backupSrc: "", id: "brand_cewas", name: "CEWAS", src: "assets/site_images/cewas.png" },
      { backupSrc: "", id: "brand_blaze_n_puff", name: "BLAZE N PUFF", src: "assets/site_images/blaze_n_puff.png" },
      { backupSrc: "", id: "brand_mazaj_resto_cafe", name: "MAZAJ Resto Cafe", src: "assets/site_images/mazaj_resto_cafe.png" },
      { backupSrc: "", id: "brand_visiotech", name: "VISIOTECH", src: "assets/site_images/visiotech.png" },
      { backupSrc: "", fileName: "ROYAL_PNG.webp", id: "brand_1790802238805", name: "ROYAL", src: "assets/site_images/1790802241101_6_royal.webp" }
    ],
    footerLegal: "© 2026 Fabric8. All rights reserved.",
    siteContent: {
      contactEmail: "hello@thefabric8.com",
      contactGlobalText: "USA: +1 (770) 710-2286\nJordan: +962 79 67 88 240",
      contactHQ: "6290 Jimmy Carter Blvd Suite 202\nNorcross, GA 30071\nUnited States",
      contactJordan: "+962 79 67 88 240",
      contactUSA: "+1",
      footerContactHtml: "6290 Jimmy Carter Blvd Suite 202<br>Norcross, GA 30071<br>United States<br><br>USA: +1 (770) 710-2286<br>Jordan: +962 79 67 88 240<br><a href=\"contact.html\" style=\"color: var(--yellow, #ffd700); text-decoration: none; font-weight: bold;\">Contact Us</a>",
      footerLegalLinksHtml: "<a href=\"privacy.html\" style=\"color: #aaa; text-decoration: none;\">Privacy Policy</a><br><a href=\"terms.html\" style=\"color: #aaa; text-decoration: none;\">Terms &amp; Conditions</a>",
      footerOverviewHtml: "<a href=\"services.html\" style=\"color: #aaa; text-decoration: none;\">Services</a>\n<a href=\"method.html\" style=\"color: #aaa; text-decoration: none;\">The Fabric 8 Method</a>\n<a href=\"sectors.html\" style=\"color: #aaa; text-decoration: none;\">Sectors</a>\n<a href=\"shop.html\" style=\"color: #aaa; text-decoration: none;\">Shop</a>\n<a href=\"about.html\" style=\"color: #aaa; text-decoration: none;\">About Us</a>",
      heroImage: "assets/site_images/1790706519189_bg_0_1789771722093_bg_0_1787516021301_img.webp",
      homeHeroBtnText: "EXPLORE THE COLLECTION",
      homeHeroSubtitle: "High-performance industrial uniforms & corporate fashion designed for modern teams.",
      homeHeroTag: "Corporate couture for working teams",
      homeHeroTitle: "engineered for Comfort, Designed to inspire",
      socialFacebook: "",
      socialIcons: [
        { active: true, iconKey: "linkedin", id: "linkedin", name: "LinkedIn", shape: "square", url: "https://www.linkedin.com/company/thefabric8" },
        { active: true, iconKey: "instagram", id: "instagram", name: "Instagram", shape: "square", url: "https://www.instagram.com/thefabric8" },
        { active: false, iconKey: "facebook", id: "facebook", name: "Facebook", shape: "square", url: "" },
        { active: false, iconKey: "whatsapp", id: "whatsapp", name: "WhatsApp", shape: "square", url: "https://wa.me/962796788240" }
      ],
      socialInstagram: "https://www.instagram.com/thefabric8",
      socialLinkedIn: "https://www.linkedin.com/company/thefabric8",
      contactHeroTag: "Get in Touch",
      contactHeroTitle: "Contact US",
      contactHeroSub: "We're ready to discuss your next uniform program.",
      contactInquiryTitle: "Send an Inquiry",
      contactHQTitle: "Corporate Headquarters",
      contactGlobalTitle: "Global Contact",
      contactEmailTitle: "Direct Email",
      aboutTitle: "Our Story, Behind the Craft",
      aboutSub: "B2B uniform solutions for clients who demand brand, purpose, performance, and reliability.",
      aboutMission: "We aspire to be the most trusted uniform partner in the region; one that listens, advises, executes, and stands behind every garment we deliver. We bridge the knowledge gap between buyers and their business needs, so every client receives a uniform solution that works as hard as the people wearing it.",
      aboutVision: "To become the regional benchmark for high-volume, high-quality uniform supply recognized for creative solutions, operational scale, and an unwavering commitment to client success over the long term.",
      sectorsTitle: "Uniform concepts for every business environment.",
      sectorsSub: "Explore Our Sector Capabilities"
    },
    categories1stLayer: [
      { enabled: true, name: "Food & beverage" },
      { enabled: true, name: "Hospitality" },
      { enabled: true, name: "Corporate" },
      { enabled: true, name: "Healthcare" },
      { enabled: true, name: "Industrial" },
      { enabled: false, name: "Education" },
      { enabled: false, name: "Aviation" }
    ],
    categories2ndLayer: [
      { enabled: true, name: "HEAD WEAR" },
      { enabled: true, name: "TOP WEAR" },
      { enabled: true, name: "BOTTOM WEAR" },
      { enabled: true, name: "OUTER WEAR" },
      { enabled: true, name: "ACCESSORIES" }
    ]
  };

  window.FABRIC8_DEFAULT_SETTINGS = defaultSettings;

  // Instant Pre-hide engine
  try {
    var activeSettings = defaultSettings;
    var cached = localStorage.getItem("fabric8_admin_settings_cache");
    if (cached) {
      try {
        var parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.categories1stLayer) && parsed.categories1stLayer.length > 0) {
          activeSettings = parsed;
        }
      } catch (e) {}
    }

    if (activeSettings && Array.isArray(activeSettings.categories1stLayer)) {
      var disabled = activeSettings.categories1stLayer
        .filter(function(s) { return s && s.enabled === false; })
        .map(function(s) { return (s.name || '').toLowerCase().trim(); });

      if (disabled.length > 0) {
        var cssRules = [];
        disabled.forEach(function(sec) {
          if (sec.indexOf('education') !== -1) {
            cssRules.push('[data-sector="education"]');
            cssRules.push('.flip-card[data-sector="education"]');
            cssRules.push('#sectorFilterContainer button[data-sec="Education"]');
            cssRules.push('#sectorFilterContainer button[data-sec*="Education"]');
            cssRules.push('.flip-card:has(#cmsSectorEduTitle)');
            cssRules.push('.flip-card:has(#cmsSectorEduImg)');
          }
          if (sec.indexOf('aviation') !== -1) {
            cssRules.push('[data-sector="aviation"]');
            cssRules.push('.flip-card[data-sector="aviation"]');
            cssRules.push('#sectorFilterContainer button[data-sec="Aviation"]');
            cssRules.push('#sectorFilterContainer button[data-sec*="Aviation"]');
            cssRules.push('.flip-card:has(#cmsSectorAviaTitle)');
            cssRules.push('.flip-card:has(#cmsSectorAviaImg)');
          }
          if (sec.indexOf('food') !== -1) {
            cssRules.push('[data-sector="food"]');
            cssRules.push('.flip-card[data-sector="food"]');
            cssRules.push('.flip-card:has(#cmsSectorFoodTitle)');
          }
          if (sec.indexOf('hospitality') !== -1) {
            cssRules.push('[data-sector="hospitality"]');
            cssRules.push('.flip-card[data-sector="hospitality"]');
            cssRules.push('.flip-card:has(#cmsSectorHospTitle)');
          }
          if (sec.indexOf('corporate') !== -1) {
            cssRules.push('[data-sector="corporate"]');
            cssRules.push('.flip-card[data-sector="corporate"]');
            cssRules.push('.flip-card:has(#cmsSectorCorpTitle)');
          }
          if (sec.indexOf('healthcare') !== -1) {
            cssRules.push('[data-sector="healthcare"]');
            cssRules.push('.flip-card[data-sector="healthcare"]');
            cssRules.push('.flip-card:has(#cmsSectorHealthTitle)');
          }
          if (sec.indexOf('industrial') !== -1) {
            cssRules.push('[data-sector="industrial"]');
            cssRules.push('.flip-card[data-sector="industrial"]');
            cssRules.push('.flip-card:has(#cmsSectorIndTitle)');
          }
        });

        if (cssRules.length > 0) {
          var styleEl = document.createElement('style');
          styleEl.id = 'fabric8-sector-prehide';
          styleEl.textContent = cssRules.join(', ') + ' { display: none !important; }';
          var headTarget = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
          headTarget.appendChild(styleEl);
        }
      }
    }
  } catch (err) {
    console.warn("Prehide notice:", err);
  }
})();
