# 📱 RAPPORT AUDIT MOBILE SENIOR — SD Cosmétique
> **Date :** 11 mai 2026 à 05:43
> **Auditeur :** QA Mobile Senior × Expert UX Mobile × Testeur Frontend
> **Scope :** 8 appareils simulés × 9 pages
> **Outils :** Playwright 1.59.1 · Axe-core · CDP Throttling · Émulation tactile

---

## 🎯 SCORE GLOBAL MOBILE

| Dimension | Score | Seuil critique |
|-----------|-------|----------------|
| 📐 Responsive | **10.0/10** | < 6 |
| 👆 UX Mobile | **10.0/10** | < 6 |
| ⚡ Performance | **4.0/10** | < 6 |
| ♿ Accessibilité | **0.0/10** | < 7 |
| 🛒 Conversion Mobile | **8.0/10** | < 7 |
| **🏆 SCORE GLOBAL** | **6.4/10** | < 7 |

> **Résumé :** 52 bug(s) CRITIQUE · 32 MAJEUR · 72 MINEUR

---

## 🔴 BUGS CRITIQUES (52)

### C1. [iphone-se] / — Touch Targets
**Problème :** 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-70 (36×36px) | button.text-xs.font-medium (224×40px) | a.HeroBanner-module__X7v8qW__cta (259×44px) | button (128×34px) | button (26×26px) | button (128×34px) | button (26×26px) | button (128×34px) | button (26×26px) | button (128×34px) | button (26×26px) | button (128×34px) | button (26×26px) | button (128×34px)
**Impact :** Cibles trop petites — erreurs de tap, frustration, abandon

### C2. [iphone-se] /boutique — Touch Targets
**Problème :** 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-70 (36×36px) | button.text-xs.font-medium (224×40px) | a (56×17px) | button.jsx-624c08301d1c5899 (72×36px) | button.jsx-624c08301d1c5899 (81×36px) | button.jsx-624c08301d1c5899 (85×36px) | button.jsx-624c08301d1c5899 (95×36px) | button.jsx-624c08301d1c5899 (66×36px) | button.jsx-624c08301d1c5899 (64×36px) | button.jsx-624c08301d1c5899 (105×36px) | button.jsx-624c08301d1c5899 (98×36px) | button.px-3.py-1.5 (67×30px) | button.flex.items-center (74×30px) | button.flex.items-center (91×30px)
**Impact :** Cibles trop petites — erreurs de tap, frustration, abandon

### C3. [iphone-se] /produit/savon-visage-orange — Touch Targets
**Problème :** 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-70 (36×36px) | button.text-xs.font-medium (224×40px) | a (42×19px) | a (34×19px) | button (40×56px) | button (138×34px) | button (26×26px) | button (138×34px) | button (26×26px) | button (138×34px) | button (26×26px) | button (138×34px) | button (26×26px) | a (45×15px)
**Impact :** Cibles trop petites — erreurs de tap, frustration, abandon

### C4. [iphone-se] /quiz — Touch Targets
**Problème :** 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-70 (36×36px) | button.text-xs.font-medium (224×40px) | a (61×17px) | a (45×15px) | a (41×15px) | a (37×15px) | a (53×15px) | a (23×15px) | a (24×15px) | a (61×15px) | a (82×15px) | a (110×15px) | a (68×15px) | a (75×15px)
**Impact :** Cibles trop petites — erreurs de tap, frustration, abandon

### C5. [iphone-se] /connexion — Touch Targets
**Problème :** 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-70 (36×36px) | button.text-xs.font-medium (224×40px) | a.auth-module__Iay1tq__visualTop (232×42px) | button.auth-module__Iay1tq__passwordToggle (26×26px) | input (16×16px) | a.auth-module__Iay1tq__forgot (134×20px) | a.auth-module__Iay1tq__switchLink (110×16px) | a (45×15px) | a (41×15px) | a (37×15px) | a (53×15px) | a (23×15px) | a (24×15px) | a (61×15px)
**Impact :** Cibles trop petites — erreurs de tap, frustration, abandon

### C6. [iphone-se] /inscription — Touch Targets
**Problème :** 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-70 (36×36px) | button.text-xs.font-medium (224×40px) | a.auth-module__Iay1tq__visualTop (232×42px) | button.auth-module__Iay1tq__passwordToggle (26×26px) | input (16×16px) | a (123×15px) | a (156×15px) | a.auth-module__Iay1tq__switchLink (87×16px) | a (45×15px) | a (41×15px) | a (37×15px) | a (53×15px) | a (23×15px) | a (24×15px)
**Impact :** Cibles trop petites — erreurs de tap, frustration, abandon

### C7. [iphone-se] /checkout — Touch Targets
**Problème :** 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-70 (36×36px) | button.text-xs.font-medium (224×40px) | a.auth-module__Iay1tq__visualTop (232×42px) | button.auth-module__Iay1tq__passwordToggle (26×26px) | input (16×16px) | a.auth-module__Iay1tq__forgot (134×20px) | a.auth-module__Iay1tq__switchLink (110×16px) | a (45×15px) | a (41×15px) | a (37×15px) | a (53×15px) | a (23×15px) | a (24×15px) | a (61×15px)
**Impact :** Cibles trop petites — erreurs de tap, frustration, abandon

### C8. [iphone-se] /wishlist — Touch Targets
**Problème :** 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-70 (36×36px) | button.text-xs.font-medium (224×40px) | a (45×15px) | a (41×15px) | a (37×15px) | a (53×15px) | a (23×15px) | a (24×15px) | a (61×15px) | a (82×15px) | a (110×15px) | a (68×15px) | a (75×15px) | a (25×15px)
**Impact :** Cibles trop petites — erreurs de tap, frustration, abandon

### C9. [iphone-se] /compte — Touch Targets
**Problème :** 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-70 (36×36px) | button.text-xs.font-medium (224×40px) | a.auth-module__Iay1tq__visualTop (232×42px) | button.auth-module__Iay1tq__passwordToggle (26×26px) | input (16×16px) | a.auth-module__Iay1tq__forgot (134×20px) | a.auth-module__Iay1tq__switchLink (110×16px) | a (45×15px) | a (41×15px) | a (37×15px) | a (53×15px) | a (23×15px) | a (24×15px) | a (61×15px)
**Impact :** Cibles trop petites — erreurs de tap, frustration, abandon

### C10. [iphone-13] / — Touch Targets
**Problème :** 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-70 (36×36px) | button.text-xs.font-medium (224×40px) | a.HeroBanner-module__X7v8qW__cta (259×44px) | button (135×34px) | button (26×26px) | button (135×34px) | button (26×26px) | button (135×34px) | button (26×26px) | button (135×34px) | button (26×26px) | button (135×34px) | button (26×26px) | button (135×34px)
**Impact :** Cibles trop petites — erreurs de tap, frustration, abandon

### C11. [iphone-13] /boutique — Touch Targets
**Problème :** 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-70 (36×36px) | button.text-xs.font-medium (224×40px) | a (56×17px) | button.jsx-624c08301d1c5899 (72×36px) | button.jsx-624c08301d1c5899 (81×36px) | button.jsx-624c08301d1c5899 (85×36px) | button.jsx-624c08301d1c5899 (95×36px) | button.jsx-624c08301d1c5899 (66×36px) | button.jsx-624c08301d1c5899 (64×36px) | button.jsx-624c08301d1c5899 (105×36px) | button.jsx-624c08301d1c5899 (98×36px) | button.px-3.py-1.5 (67×30px) | button.flex.items-center (74×30px) | button.flex.items-center (91×30px)
**Impact :** Cibles trop petites — erreurs de tap, frustration, abandon

### C12. [iphone-13] /produit/savon-visage-orange — Touch Targets
**Problème :** 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-70 (36×36px) | button.text-xs.font-medium (224×40px) | a (42×19px) | a (34×19px) | button (40×56px) | button (145×34px) | button (26×26px) | button (145×34px) | button (26×26px) | button (145×34px) | button (26×26px) | button (145×34px) | button (26×26px) | a (45×15px)
**Impact :** Cibles trop petites — erreurs de tap, frustration, abandon

### C13. [iphone-13] /quiz — Touch Targets
**Problème :** 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-70 (36×36px) | button.text-xs.font-medium (224×40px) | a (61×17px) | a (45×15px) | a (41×15px) | a (37×15px) | a (53×15px) | a (23×15px) | a (24×15px) | a (61×15px) | a (82×15px) | a (110×15px) | a (68×15px) | a (75×15px)
**Impact :** Cibles trop petites — erreurs de tap, frustration, abandon

### C14. [iphone-13] /connexion — Touch Targets
**Problème :** 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-70 (36×36px) | button.text-xs.font-medium (224×40px) | a.auth-module__Iay1tq__visualTop (232×42px) | button.auth-module__Iay1tq__passwordToggle (26×26px) | input (16×16px) | a.auth-module__Iay1tq__forgot (134×20px) | a.auth-module__Iay1tq__switchLink (110×16px) | a (45×15px) | a (41×15px) | a (37×15px) | a (53×15px) | a (23×15px) | a (24×15px) | a (61×15px)
**Impact :** Cibles trop petites — erreurs de tap, frustration, abandon

### C15. [iphone-13] /inscription — Touch Targets
**Problème :** 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-70 (36×36px) | button.text-xs.font-medium (224×40px) | a.auth-module__Iay1tq__visualTop (232×42px) | button.auth-module__Iay1tq__passwordToggle (26×26px) | input (16×16px) | a (123×15px) | a (156×15px) | a.auth-module__Iay1tq__switchLink (87×16px) | a (45×15px) | a (41×15px) | a (37×15px) | a (53×15px) | a (23×15px) | a (24×15px)
**Impact :** Cibles trop petites — erreurs de tap, frustration, abandon

### C16. [iphone-13] /checkout — Touch Targets
**Problème :** 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-70 (36×36px) | button.text-xs.font-medium (224×40px) | a.auth-module__Iay1tq__visualTop (232×42px) | button.auth-module__Iay1tq__passwordToggle (26×26px) | input (16×16px) | a.auth-module__Iay1tq__forgot (134×20px) | a.auth-module__Iay1tq__switchLink (110×16px) | a (45×15px) | a (41×15px) | a (37×15px) | a (53×15px) | a (23×15px) | a (24×15px) | a (61×15px)
**Impact :** Cibles trop petites — erreurs de tap, frustration, abandon

### C17. [iphone-13] /wishlist — Touch Targets
**Problème :** 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-70 (36×36px) | button.text-xs.font-medium (224×40px) | a (45×15px) | a (41×15px) | a (37×15px) | a (53×15px) | a (23×15px) | a (24×15px) | a (61×15px) | a (82×15px) | a (110×15px) | a (68×15px) | a (75×15px) | a (25×15px)
**Impact :** Cibles trop petites — erreurs de tap, frustration, abandon

### C18. [iphone-13] /compte — Touch Targets
**Problème :** 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-70 (36×36px) | button.text-xs.font-medium (224×40px) | a.auth-module__Iay1tq__visualTop (232×42px) | button.auth-module__Iay1tq__passwordToggle (26×26px) | input (16×16px) | a.auth-module__Iay1tq__forgot (134×20px) | a.auth-module__Iay1tq__switchLink (110×16px) | a (45×15px) | a (41×15px) | a (37×15px) | a (53×15px) | a (23×15px) | a (24×15px) | a (61×15px)
**Impact :** Cibles trop petites — erreurs de tap, frustration, abandon

### C19. [galaxy-s23] / — Touch Targets
**Problème :** 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-70 (36×36px) | button.text-xs.font-medium (224×40px) | a.HeroBanner-module__X7v8qW__cta (259×44px) | button (120×34px) | button (26×26px) | button (120×34px) | button (26×26px) | button (120×34px) | button (26×26px) | button (120×34px) | button (26×26px) | button (120×34px) | button (26×26px) | button (120×34px)
**Impact :** Cibles trop petites — erreurs de tap, frustration, abandon

### C20. [galaxy-s23] /boutique — Touch Targets
**Problème :** 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-70 (36×36px) | button.text-xs.font-medium (224×40px) | a (56×17px) | button.jsx-624c08301d1c5899 (72×36px) | button.jsx-624c08301d1c5899 (81×36px) | button.jsx-624c08301d1c5899 (85×36px) | button.jsx-624c08301d1c5899 (95×36px) | button.jsx-624c08301d1c5899 (66×36px) | button.jsx-624c08301d1c5899 (64×36px) | button.jsx-624c08301d1c5899 (105×36px) | button.jsx-624c08301d1c5899 (98×36px) | button.px-3.py-1.5 (67×30px) | button.flex.items-center (74×30px) | button.flex.items-center (91×30px)
**Impact :** Cibles trop petites — erreurs de tap, frustration, abandon

### C21. [galaxy-s23] /produit/savon-visage-orange — Touch Targets
**Problème :** 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-70 (36×36px) | button.text-xs.font-medium (224×40px) | a (42×19px) | a (34×19px) | button (40×56px) | button (130×34px) | button (26×26px) | button (130×34px) | button (26×26px) | button (130×34px) | button (26×26px) | button (130×34px) | button (26×26px) | a (45×15px)
**Impact :** Cibles trop petites — erreurs de tap, frustration, abandon

### C22. [galaxy-s23] /quiz — Touch Targets
**Problème :** 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-70 (36×36px) | button.text-xs.font-medium (224×40px) | a (61×17px) | a (45×15px) | a (41×15px) | a (37×15px) | a (53×15px) | a (23×15px) | a (24×15px) | a (61×15px) | a (82×15px) | a (110×15px) | a (68×15px) | a (75×15px)
**Impact :** Cibles trop petites — erreurs de tap, frustration, abandon

### C23. [galaxy-s23] /connexion — Touch Targets
**Problème :** 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-70 (36×36px) | button.text-xs.font-medium (224×40px) | a.auth-module__Iay1tq__visualTop (232×42px) | button.auth-module__Iay1tq__passwordToggle (26×26px) | input (16×16px) | a.auth-module__Iay1tq__forgot (129×41px) | a.auth-module__Iay1tq__switchLink (110×16px) | a (45×15px) | a (41×15px) | a (37×15px) | a (53×15px) | a (23×15px) | a (24×15px) | a (61×15px)
**Impact :** Cibles trop petites — erreurs de tap, frustration, abandon

### C24. [galaxy-s23] /inscription — Touch Targets
**Problème :** 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-70 (36×36px) | button.text-xs.font-medium (224×40px) | a.auth-module__Iay1tq__visualTop (232×42px) | button.auth-module__Iay1tq__passwordToggle (26×26px) | input (16×16px) | a (123×15px) | a (156×15px) | a.auth-module__Iay1tq__switchLink (87×16px) | a (45×15px) | a (41×15px) | a (37×15px) | a (53×15px) | a (23×15px) | a (24×15px)
**Impact :** Cibles trop petites — erreurs de tap, frustration, abandon

### C25. [galaxy-s23] /checkout — Touch Targets
**Problème :** 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-70 (36×36px) | button.text-xs.font-medium (224×40px) | a.auth-module__Iay1tq__visualTop (232×42px) | button.auth-module__Iay1tq__passwordToggle (26×26px) | input (16×16px) | a.auth-module__Iay1tq__forgot (129×41px) | a.auth-module__Iay1tq__switchLink (110×16px) | a (45×15px) | a (41×15px) | a (37×15px) | a (53×15px) | a (23×15px) | a (24×15px) | a (61×15px)
**Impact :** Cibles trop petites — erreurs de tap, frustration, abandon

### C26. [galaxy-s23] /wishlist — Touch Targets
**Problème :** 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-70 (36×36px) | button.text-xs.font-medium (224×40px) | a (45×15px) | a (41×15px) | a (37×15px) | a (53×15px) | a (23×15px) | a (24×15px) | a (61×15px) | a (82×15px) | a (110×15px) | a (68×15px) | a (75×15px) | a (25×15px)
**Impact :** Cibles trop petites — erreurs de tap, frustration, abandon

### C27. [galaxy-s23] /compte — Touch Targets
**Problème :** 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-70 (36×36px) | button.text-xs.font-medium (224×40px) | a.auth-module__Iay1tq__visualTop (232×42px) | button.auth-module__Iay1tq__passwordToggle (26×26px) | input (16×16px) | a.auth-module__Iay1tq__forgot (129×41px) | a.auth-module__Iay1tq__switchLink (110×16px) | a (45×15px) | a (41×15px) | a (37×15px) | a (53×15px) | a (23×15px) | a (24×15px) | a (61×15px)
**Impact :** Cibles trop petites — erreurs de tap, frustration, abandon

### C28. [pixel-8] / — Touch Targets
**Problème :** 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-70 (36×36px) | button.text-xs.font-medium (224×40px) | a.HeroBanner-module__X7v8qW__cta (259×44px) | button (146×34px) | button (26×26px) | button (146×34px) | button (26×26px) | button (146×34px) | button (26×26px) | button (146×34px) | button (26×26px) | button (146×34px) | button (26×26px) | button (146×34px)
**Impact :** Cibles trop petites — erreurs de tap, frustration, abandon

### C29. [pixel-8] /boutique — Touch Targets
**Problème :** 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-70 (36×36px) | button.text-xs.font-medium (224×40px) | a (56×17px) | button.jsx-624c08301d1c5899 (72×36px) | button.jsx-624c08301d1c5899 (81×36px) | button.jsx-624c08301d1c5899 (85×36px) | button.jsx-624c08301d1c5899 (95×36px) | button.jsx-624c08301d1c5899 (66×36px) | button.jsx-624c08301d1c5899 (64×36px) | button.jsx-624c08301d1c5899 (105×36px) | button.jsx-624c08301d1c5899 (98×36px) | button.px-3.py-1.5 (67×30px) | button.flex.items-center (74×30px) | button.flex.items-center (91×30px)
**Impact :** Cibles trop petites — erreurs de tap, frustration, abandon

### C30. [pixel-8] /produit/savon-visage-orange — Touch Targets
**Problème :** 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-70 (36×36px) | button.text-xs.font-medium (224×40px) | a (42×19px) | a (34×19px) | button (40×56px) | button (156×34px) | button (26×26px) | button (156×34px) | button (26×26px) | button (156×34px) | button (26×26px) | button (156×34px) | button (26×26px) | a (45×15px)
**Impact :** Cibles trop petites — erreurs de tap, frustration, abandon

### C31. [pixel-8] /quiz — Touch Targets
**Problème :** 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-70 (36×36px) | button.text-xs.font-medium (224×40px) | a (61×17px) | a (45×15px) | a (41×15px) | a (37×15px) | a (53×15px) | a (23×15px) | a (24×15px) | a (61×15px) | a (82×15px) | a (110×15px) | a (68×15px) | a (75×15px)
**Impact :** Cibles trop petites — erreurs de tap, frustration, abandon

### C32. [pixel-8] /connexion — Touch Targets
**Problème :** 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-70 (36×36px) | button.text-xs.font-medium (224×40px) | a.auth-module__Iay1tq__visualTop (232×42px) | button.auth-module__Iay1tq__passwordToggle (26×26px) | input (16×16px) | a.auth-module__Iay1tq__forgot (134×20px) | a.auth-module__Iay1tq__switchLink (110×16px) | a (45×15px) | a (41×15px) | a (37×15px) | a (53×15px) | a (23×15px) | a (24×15px) | a (61×15px)
**Impact :** Cibles trop petites — erreurs de tap, frustration, abandon

### C33. [pixel-8] /inscription — Touch Targets
**Problème :** 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-70 (36×36px) | button.text-xs.font-medium (224×40px) | a.auth-module__Iay1tq__visualTop (232×42px) | button.auth-module__Iay1tq__passwordToggle (26×26px) | input (16×16px) | a (123×15px) | a (288×34px) | a.auth-module__Iay1tq__switchLink (87×16px) | a (45×15px) | a (41×15px) | a (37×15px) | a (53×15px) | a (23×15px) | a (24×15px)
**Impact :** Cibles trop petites — erreurs de tap, frustration, abandon

### C34. [pixel-8] /checkout — Touch Targets
**Problème :** 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-70 (36×36px) | button.text-xs.font-medium (224×40px) | a.auth-module__Iay1tq__visualTop (232×42px) | button.auth-module__Iay1tq__passwordToggle (26×26px) | input (16×16px) | a.auth-module__Iay1tq__forgot (134×20px) | a.auth-module__Iay1tq__switchLink (110×16px) | a (45×15px) | a (41×15px) | a (37×15px) | a (53×15px) | a (23×15px) | a (24×15px) | a (61×15px)
**Impact :** Cibles trop petites — erreurs de tap, frustration, abandon

### C35. [pixel-8] /wishlist — Touch Targets
**Problème :** 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-70 (36×36px) | button.text-xs.font-medium (224×40px) | a (45×15px) | a (41×15px) | a (37×15px) | a (53×15px) | a (23×15px) | a (24×15px) | a (61×15px) | a (82×15px) | a (110×15px) | a (68×15px) | a (75×15px) | a (25×15px)
**Impact :** Cibles trop petites — erreurs de tap, frustration, abandon

### C36. [pixel-8] /compte — Touch Targets
**Problème :** 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-70 (36×36px) | button.text-xs.font-medium (224×40px) | a.auth-module__Iay1tq__visualTop (232×42px) | button.auth-module__Iay1tq__passwordToggle (26×26px) | input (16×16px) | a.auth-module__Iay1tq__forgot (134×20px) | a.auth-module__Iay1tq__switchLink (110×16px) | a (45×15px) | a (41×15px) | a (37×15px) | a (53×15px) | a (23×15px) | a (24×15px) | a (61×15px)
**Impact :** Cibles trop petites — erreurs de tap, frustration, abandon

### C37. [iphone-se] /connexion — iOS Zoom
**Problème :** 4 input(s) avec font-size < 16px (déclenche zoom iOS Safari) : input#email.auth-module__Iay1tq__input (15px) | input#password.auth-module__Iay1tq__input (15px) | input (13px) | input.jsx-187c5ea2e72e6ac2 (13px)
**Impact :** Zoom automatique iOS = désorientation utilisateur, abandon formulaire estimé +40%

### C38. [iphone-se] /inscription — iOS Zoom
**Problème :** 6 input(s) avec font-size < 16px (déclenche zoom iOS Safari) : input#prenom.auth-module__Iay1tq__input (15px) | input#nom.auth-module__Iay1tq__input (15px) | input#email.auth-module__Iay1tq__input (15px) | input#password.auth-module__Iay1tq__input (15px) | input#confirm.auth-module__Iay1tq__input (15px) | input.jsx-187c5ea2e72e6ac2 (13px)
**Impact :** Zoom automatique iOS = désorientation utilisateur, abandon formulaire estimé +40%

### C39. [iphone-se] /checkout — iOS Zoom
**Problème :** 4 input(s) avec font-size < 16px (déclenche zoom iOS Safari) : input#email.auth-module__Iay1tq__input (15px) | input#password.auth-module__Iay1tq__input (15px) | input (13px) | input.jsx-187c5ea2e72e6ac2 (13px)
**Impact :** Zoom automatique iOS = désorientation utilisateur, abandon formulaire estimé +40%

### C40. [iphone-13] /connexion — iOS Zoom
**Problème :** 4 input(s) avec font-size < 16px (déclenche zoom iOS Safari) : input#email.auth-module__Iay1tq__input (15px) | input#password.auth-module__Iay1tq__input (15px) | input (13px) | input.jsx-187c5ea2e72e6ac2 (13px)
**Impact :** Zoom automatique iOS = désorientation utilisateur, abandon formulaire estimé +40%

### C41. [iphone-13] /inscription — iOS Zoom
**Problème :** 6 input(s) avec font-size < 16px (déclenche zoom iOS Safari) : input#prenom.auth-module__Iay1tq__input (15px) | input#nom.auth-module__Iay1tq__input (15px) | input#email.auth-module__Iay1tq__input (15px) | input#password.auth-module__Iay1tq__input (15px) | input#confirm.auth-module__Iay1tq__input (15px) | input.jsx-187c5ea2e72e6ac2 (13px)
**Impact :** Zoom automatique iOS = désorientation utilisateur, abandon formulaire estimé +40%

### C42. [iphone-13] /checkout — iOS Zoom
**Problème :** 4 input(s) avec font-size < 16px (déclenche zoom iOS Safari) : input#email.auth-module__Iay1tq__input (15px) | input#password.auth-module__Iay1tq__input (15px) | input (13px) | input.jsx-187c5ea2e72e6ac2 (13px)
**Impact :** Zoom automatique iOS = désorientation utilisateur, abandon formulaire estimé +40%

### C43. [galaxy-s23] /connexion — iOS Zoom
**Problème :** 4 input(s) avec font-size < 16px (déclenche zoom iOS Safari) : input#email.auth-module__Iay1tq__input (15px) | input#password.auth-module__Iay1tq__input (15px) | input (13px) | input.jsx-187c5ea2e72e6ac2 (13px)
**Impact :** Zoom automatique iOS = désorientation utilisateur, abandon formulaire estimé +40%

### C44. [galaxy-s23] /inscription — iOS Zoom
**Problème :** 6 input(s) avec font-size < 16px (déclenche zoom iOS Safari) : input#prenom.auth-module__Iay1tq__input (15px) | input#nom.auth-module__Iay1tq__input (15px) | input#email.auth-module__Iay1tq__input (15px) | input#password.auth-module__Iay1tq__input (15px) | input#confirm.auth-module__Iay1tq__input (15px) | input.jsx-187c5ea2e72e6ac2 (13px)
**Impact :** Zoom automatique iOS = désorientation utilisateur, abandon formulaire estimé +40%

### C45. [galaxy-s23] /checkout — iOS Zoom
**Problème :** 4 input(s) avec font-size < 16px (déclenche zoom iOS Safari) : input#email.auth-module__Iay1tq__input (15px) | input#password.auth-module__Iay1tq__input (15px) | input (13px) | input.jsx-187c5ea2e72e6ac2 (13px)
**Impact :** Zoom automatique iOS = désorientation utilisateur, abandon formulaire estimé +40%

### C46. [iphone-13] / — Performance/CLS
**Problème :** CLS critique : 0.7466 (seuil Google "Good" : <0.1)
**Impact :** Éléments qui sautent = clic raté, frustration, pénalité SEO Core Web Vitals

### C47. [iphone-13] /boutique — Performance/CLS
**Problème :** CLS critique : 0.5708 (seuil Google "Good" : <0.1)
**Impact :** Éléments qui sautent = clic raté, frustration, pénalité SEO Core Web Vitals

### C48. [iphone-13] /produit/savon-visage-orange — Performance/CLS
**Problème :** CLS critique : 0.7356 (seuil Google "Good" : <0.1)
**Impact :** Éléments qui sautent = clic raté, frustration, pénalité SEO Core Web Vitals

### C49. [iphone-13] /produit/savon-visage-orange — A11y/button-name
**Problème :** [WCAG] Ensure buttons have discernible text — 1 occurrence(s)
**Impact :** Buttons must have discernible text

### C50. [galaxy-s23] /produit/savon-visage-orange — A11y/button-name
**Problème :** [WCAG] Ensure buttons have discernible text — 1 occurrence(s)
**Impact :** Buttons must have discernible text

### C51. [ipad] /produit/savon-visage-orange — A11y/button-name
**Problème :** [WCAG] Ensure buttons have discernible text — 1 occurrence(s)
**Impact :** Buttons must have discernible text

### C52. [iphone-se] /checkout — Checkout/Touch
**Problème :** 15 éléments < 44px dans le tunnel de paiement
**Impact :** Tunnel de conversion inutilisable tactile — abandon immédiat


---

## 🟠 BUGS MAJEURS (32)

### M1. [iphone-13] / — A11y/aria-hidden-focus
**Problème :** [WCAG] Ensure aria-hidden elements are not focusable nor contain focusable elements — 1 occurrence(s)
**Impact :** ARIA hidden element must not be focusable or contain focusable elements

### M2. [iphone-13] / — A11y/color-contrast
**Problème :** [WCAG] Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds — 5 occurrence(s)
**Impact :** Elements must meet minimum color contrast ratio thresholds

### M3. [iphone-13] /boutique — A11y/aria-hidden-focus
**Problème :** [WCAG] Ensure aria-hidden elements are not focusable nor contain focusable elements — 1 occurrence(s)
**Impact :** ARIA hidden element must not be focusable or contain focusable elements

### M4. [iphone-13] /boutique — A11y/color-contrast
**Problème :** [WCAG] Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds — 19 occurrence(s)
**Impact :** Elements must meet minimum color contrast ratio thresholds

### M5. [iphone-13] /produit/savon-visage-orange — A11y/aria-hidden-focus
**Problème :** [WCAG] Ensure aria-hidden elements are not focusable nor contain focusable elements — 1 occurrence(s)
**Impact :** ARIA hidden element must not be focusable or contain focusable elements

### M6. [iphone-13] /produit/savon-visage-orange — A11y/color-contrast
**Problème :** [WCAG] Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds — 24 occurrence(s)
**Impact :** Elements must meet minimum color contrast ratio thresholds

### M7. [iphone-13] /connexion — A11y/aria-hidden-focus
**Problème :** [WCAG] Ensure aria-hidden elements are not focusable nor contain focusable elements — 1 occurrence(s)
**Impact :** ARIA hidden element must not be focusable or contain focusable elements

### M8. [iphone-13] /checkout — A11y/aria-hidden-focus
**Problème :** [WCAG] Ensure aria-hidden elements are not focusable nor contain focusable elements — 1 occurrence(s)
**Impact :** ARIA hidden element must not be focusable or contain focusable elements

### M9. [galaxy-s23] / — A11y/aria-hidden-focus
**Problème :** [WCAG] Ensure aria-hidden elements are not focusable nor contain focusable elements — 1 occurrence(s)
**Impact :** ARIA hidden element must not be focusable or contain focusable elements

### M10. [galaxy-s23] / — A11y/color-contrast
**Problème :** [WCAG] Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds — 4 occurrence(s)
**Impact :** Elements must meet minimum color contrast ratio thresholds

### M11. [galaxy-s23] /boutique — A11y/aria-hidden-focus
**Problème :** [WCAG] Ensure aria-hidden elements are not focusable nor contain focusable elements — 1 occurrence(s)
**Impact :** ARIA hidden element must not be focusable or contain focusable elements

### M12. [galaxy-s23] /boutique — A11y/color-contrast
**Problème :** [WCAG] Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds — 9 occurrence(s)
**Impact :** Elements must meet minimum color contrast ratio thresholds

### M13. [galaxy-s23] /produit/savon-visage-orange — A11y/aria-hidden-focus
**Problème :** [WCAG] Ensure aria-hidden elements are not focusable nor contain focusable elements — 1 occurrence(s)
**Impact :** ARIA hidden element must not be focusable or contain focusable elements

### M14. [galaxy-s23] /produit/savon-visage-orange — A11y/color-contrast
**Problème :** [WCAG] Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds — 20 occurrence(s)
**Impact :** Elements must meet minimum color contrast ratio thresholds

### M15. [galaxy-s23] /connexion — A11y/aria-hidden-focus
**Problème :** [WCAG] Ensure aria-hidden elements are not focusable nor contain focusable elements — 1 occurrence(s)
**Impact :** ARIA hidden element must not be focusable or contain focusable elements

### M16. [galaxy-s23] /checkout — A11y/aria-hidden-focus
**Problème :** [WCAG] Ensure aria-hidden elements are not focusable nor contain focusable elements — 1 occurrence(s)
**Impact :** ARIA hidden element must not be focusable or contain focusable elements

### M17. [ipad] / — A11y/aria-hidden-focus
**Problème :** [WCAG] Ensure aria-hidden elements are not focusable nor contain focusable elements — 1 occurrence(s)
**Impact :** ARIA hidden element must not be focusable or contain focusable elements

### M18. [ipad] / — A11y/color-contrast
**Problème :** [WCAG] Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds — 7 occurrence(s)
**Impact :** Elements must meet minimum color contrast ratio thresholds

### M19. [ipad] /boutique — A11y/aria-hidden-focus
**Problème :** [WCAG] Ensure aria-hidden elements are not focusable nor contain focusable elements — 1 occurrence(s)
**Impact :** ARIA hidden element must not be focusable or contain focusable elements

### M20. [ipad] /boutique — A11y/color-contrast
**Problème :** [WCAG] Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds — 18 occurrence(s)
**Impact :** Elements must meet minimum color contrast ratio thresholds

### M21. [ipad] /produit/savon-visage-orange — A11y/aria-hidden-focus
**Problème :** [WCAG] Ensure aria-hidden elements are not focusable nor contain focusable elements — 1 occurrence(s)
**Impact :** ARIA hidden element must not be focusable or contain focusable elements

### M22. [ipad] /produit/savon-visage-orange — A11y/color-contrast
**Problème :** [WCAG] Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds — 24 occurrence(s)
**Impact :** Elements must meet minimum color contrast ratio thresholds

### M23. [ipad] /connexion — A11y/aria-hidden-focus
**Problème :** [WCAG] Ensure aria-hidden elements are not focusable nor contain focusable elements — 1 occurrence(s)
**Impact :** ARIA hidden element must not be focusable or contain focusable elements

### M24. [ipad] /checkout — A11y/aria-hidden-focus
**Problème :** [WCAG] Ensure aria-hidden elements are not focusable nor contain focusable elements — 1 occurrence(s)
**Impact :** ARIA hidden element must not be focusable or contain focusable elements

### M25. [iphone-13] / — Lisibilité/Fonts
**Problème :** 10 texte(s) < 12px : span.jsx-22d77ea727267d19.cat-label (11.52px) | span.jsx-22d77ea727267d19.cat-label (11.52px) | span.jsx-22d77ea727267d19.cat-label (11.52px) | span.jsx-22d77ea727267d19.cat-sub (10.88px) | span.jsx-22d77ea727267d19.cat-label (11.52px) | span.jsx-22d77ea727267d19.cat-sub (10.88px) | span.jsx-22d77ea727267d19.cat-label (11.52px) | span.jsx-22d77ea727267d19.cat-sub (10.88px) | span.jsx-22d77ea727267d19.cat-label (11.52px) | span.jsx-22d77ea727267d19.cat-sub (10.88px)
**Impact :** Illisible sur petit écran, non-conforme WCAG 1.4.4

### M26. [iphone-13] /boutique — Lisibilité/Fonts
**Problème :** 10 texte(s) < 12px : span.jsx-624c08301d1c5899 (10.4px) | span.jsx-624c08301d1c5899 (11.52px) | span (6.72px) | span (6.72px) | span (6.72px) | span (6.72px) | span (6.72px) | span (6.72px) | span (6.72px) | span (6.72px)
**Impact :** Illisible sur petit écran, non-conforme WCAG 1.4.4

### M27. [iphone-13] /produit/savon-visage-orange — Lisibilité/Fonts
**Problème :** 10 texte(s) < 12px : span (7px) | span (7px) | span (10px) | span (10px) | p (11px) | span (9px) | p (11px) | p (10px) | span (6px) | span (6px)
**Impact :** Illisible sur petit écran, non-conforme WCAG 1.4.4

### M28. [iphone-13] /quiz — Lisibilité/Fonts
**Problème :** 6 texte(s) < 12px : span.quiz-module__Zi9a9q__crumbsSep (10.4px) | span.quiz-module__Zi9a9q__crumbsCurrent (10.4px) | span.quiz-module__Zi9a9q__welcomeEyebrow (10.88px) | span.quiz-module__Zi9a9q__welcomeMetaLabel (9.6px) | span.quiz-module__Zi9a9q__welcomeMetaLabel (9.6px) | span.quiz-module__Zi9a9q__welcomeMetaLabel (9.6px)
**Impact :** Illisible sur petit écran, non-conforme WCAG 1.4.4

### M29. [iphone-13] /connexion — Lisibilité/Fonts
**Problème :** 4 texte(s) < 12px : span.auth-module__Iay1tq__visualEyebrow (11.2px) | span.auth-module__Iay1tq__formEyebrow (11.2px) | label.auth-module__Iay1tq__label (11.2px) | label.auth-module__Iay1tq__label (11.2px)
**Impact :** Illisible sur petit écran, non-conforme WCAG 1.4.4

### M30. [iphone-13] /inscription — Lisibilité/Fonts
**Problème :** 7 texte(s) < 12px : span.auth-module__Iay1tq__visualEyebrow (11.2px) | span.auth-module__Iay1tq__formEyebrow (11.2px) | label.auth-module__Iay1tq__label (11.2px) | label.auth-module__Iay1tq__label (11.2px) | label.auth-module__Iay1tq__label (11.2px) | label.auth-module__Iay1tq__label (11.2px) | label.auth-module__Iay1tq__label (11.2px)
**Impact :** Illisible sur petit écran, non-conforme WCAG 1.4.4

### M31. [iphone-13] /checkout — Lisibilité/Fonts
**Problème :** 4 texte(s) < 12px : span.auth-module__Iay1tq__visualEyebrow (11.2px) | span.auth-module__Iay1tq__formEyebrow (11.2px) | label.auth-module__Iay1tq__label (11.2px) | label.auth-module__Iay1tq__label (11.2px)
**Impact :** Illisible sur petit écran, non-conforme WCAG 1.4.4

### M32. [iphone-13] /compte — Lisibilité/Fonts
**Problème :** 4 texte(s) < 12px : span.auth-module__Iay1tq__visualEyebrow (11.2px) | span.auth-module__Iay1tq__formEyebrow (11.2px) | label.auth-module__Iay1tq__label (11.2px) | label.auth-module__Iay1tq__label (11.2px)
**Impact :** Illisible sur petit écran, non-conforme WCAG 1.4.4


---

## 🟡 PROBLÈMES MINEURS (72)

- **Mi1** [iphone-se] `/` — Console Errors : 36 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi2** [iphone-se] `/boutique` — Console Errors : 17 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi3** [iphone-se] `/produit/savon-visage-orange` — Console Errors : 18 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi4** [iphone-se] `/quiz` — Console Errors : 3 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 403 (Forbidden)
- **Mi5** [iphone-se] `/connexion` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi6** [iphone-se] `/inscription` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi7** [iphone-se] `/checkout` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi8** [iphone-se] `/wishlist` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi9** [iphone-se] `/compte` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi10** [iphone-13] `/` — Console Errors : 41 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi11** [iphone-13] `/boutique` — Console Errors : 17 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi12** [iphone-13] `/produit/savon-visage-orange` — Console Errors : 20 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi13** [iphone-13] `/quiz` — Console Errors : 3 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 403 (Forbidden)
- **Mi14** [iphone-13] `/connexion` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi15** [iphone-13] `/inscription` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi16** [iphone-13] `/checkout` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi17** [iphone-13] `/wishlist` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi18** [iphone-13] `/compte` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi19** [iphone-15-pro] `/` — Console Errors : 37 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi20** [iphone-15-pro] `/boutique` — Console Errors : 17 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi21** [iphone-15-pro] `/produit/savon-visage-orange` — Console Errors : 20 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi22** [iphone-15-pro] `/quiz` — Console Errors : 3 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 403 (Forbidden)
- **Mi23** [iphone-15-pro] `/connexion` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi24** [iphone-15-pro] `/inscription` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi25** [iphone-15-pro] `/checkout` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi26** [iphone-15-pro] `/wishlist` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi27** [iphone-15-pro] `/compte` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi28** [galaxy-s23] `/` — Console Errors : 37 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi29** [galaxy-s23] `/boutique` — Console Errors : 17 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi30** [galaxy-s23] `/produit/savon-visage-orange` — Console Errors : 17 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi31** [galaxy-s23] `/quiz` — Console Errors : 3 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 403 (Forbidden)
- **Mi32** [galaxy-s23] `/connexion` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi33** [galaxy-s23] `/inscription` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi34** [galaxy-s23] `/checkout` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi35** [galaxy-s23] `/wishlist` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi36** [galaxy-s23] `/compte` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi37** [pixel-8] `/` — Console Errors : 39 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi38** [pixel-8] `/boutique` — Console Errors : 17 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi39** [pixel-8] `/produit/savon-visage-orange` — Console Errors : 20 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi40** [pixel-8] `/quiz` — Console Errors : 3 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 403 (Forbidden)
- **Mi41** [pixel-8] `/connexion` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi42** [pixel-8] `/inscription` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi43** [pixel-8] `/checkout` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi44** [pixel-8] `/wishlist` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi45** [pixel-8] `/compte` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi46** [redmi-note] `/` — Console Errors : 40 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi47** [redmi-note] `/boutique` — Console Errors : 17 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi48** [redmi-note] `/produit/savon-visage-orange` — Console Errors : 20 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi49** [redmi-note] `/quiz` — Console Errors : 3 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 403 (Forbidden)
- **Mi50** [redmi-note] `/connexion` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi51** [redmi-note] `/inscription` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi52** [redmi-note] `/checkout` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi53** [redmi-note] `/wishlist` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi54** [redmi-note] `/compte` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi55** [ipad] `/` — Console Errors : 37 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi56** [ipad] `/boutique` — Console Errors : 15 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi57** [ipad] `/produit/savon-visage-orange` — Console Errors : 20 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi58** [ipad] `/quiz` — Console Errors : 3 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 403 (Forbidden)
- **Mi59** [ipad] `/connexion` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi60** [ipad] `/inscription` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi61** [ipad] `/checkout` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi62** [ipad] `/wishlist` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi63** [ipad] `/compte` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi64** [samsung-tab] `/` — Console Errors : 39 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi65** [samsung-tab] `/boutique` — Console Errors : 15 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi66** [samsung-tab] `/produit/savon-visage-orange` — Console Errors : 18 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi67** [samsung-tab] `/quiz` — Console Errors : 3 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 403 (Forbidden)
- **Mi68** [samsung-tab] `/connexion` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi69** [samsung-tab] `/inscription` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi70** [samsung-tab] `/checkout` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi71** [samsung-tab] `/wishlist` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)
- **Mi72** [samsung-tab] `/compte` — Console Errors : 2 erreur(s) console : Failed to load resource: the server responded with a status of 400 (Bad Request) | Failed to load resource: the server responded with a status of 400 (Bad Request)

---

## ⚡ PERFORMANCE MOBILE (iPhone 13 — 3G simulée)

| Page | FCP | TTFB | Transfert |
|------|-----|------|-----------|
| `/` | 712ms | 46ms | 13KB |

> **Seuils Lighthouse Mobile :** FCP < 1.8s (Good) · TTFB < 800ms · Transfert < 2MB

---

## 📊 ACCESSIBILITÉ (axe-core par device)

```
iphone-13-/ → CRITIQUE:0 SÉRIEUX:2 MODÉRÉ:2 MINEUR:1
iphone-13-/boutique → CRITIQUE:0 SÉRIEUX:2 MODÉRÉ:2 MINEUR:0
iphone-13-/produit/savon-visage-orange → CRITIQUE:1 SÉRIEUX:2 MODÉRÉ:2 MINEUR:1
iphone-13-/connexion → CRITIQUE:0 SÉRIEUX:1 MODÉRÉ:5 MINEUR:0
iphone-13-/checkout → CRITIQUE:0 SÉRIEUX:1 MODÉRÉ:5 MINEUR:0
galaxy-s23-/ → CRITIQUE:0 SÉRIEUX:2 MODÉRÉ:2 MINEUR:1
galaxy-s23-/boutique → CRITIQUE:0 SÉRIEUX:2 MODÉRÉ:2 MINEUR:0
galaxy-s23-/produit/savon-visage-orange → CRITIQUE:1 SÉRIEUX:2 MODÉRÉ:2 MINEUR:1
galaxy-s23-/connexion → CRITIQUE:0 SÉRIEUX:1 MODÉRÉ:5 MINEUR:0
galaxy-s23-/checkout → CRITIQUE:0 SÉRIEUX:1 MODÉRÉ:5 MINEUR:0
ipad-/ → CRITIQUE:0 SÉRIEUX:2 MODÉRÉ:2 MINEUR:1
ipad-/boutique → CRITIQUE:0 SÉRIEUX:2 MODÉRÉ:2 MINEUR:0
ipad-/produit/savon-visage-orange → CRITIQUE:1 SÉRIEUX:2 MODÉRÉ:2 MINEUR:1
ipad-/connexion → CRITIQUE:0 SÉRIEUX:1 MODÉRÉ:5 MINEUR:0
ipad-/checkout → CRITIQUE:0 SÉRIEUX:1 MODÉRÉ:5 MINEUR:0
```

---

## ✅ QUICK WINS (< 1 jour chacun)

### QW1. Font-size 16px sur tous les inputs
```css
input, select, textarea {
  font-size: 16px !important; /* Évite zoom iOS Safari */
}
```

### QW2. Meta viewport correct
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

### QW3. Touch targets 44px minimum (WCAG 2.5.5)
```css
button, a, [role="button"] {
  min-height: 44px;
  min-width: 44px;
  display: inline-flex;
  align-items: center;
}
```

### QW4. overflow-x: hidden sur html + body
```css
html, body { overflow-x: hidden; }
```

### QW5. Sticky CTA mobile sur page produit
```tsx
<div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t md:hidden">
  <button className="w-full py-4 bg-primary text-white rounded-xl">Ajouter au panier</button>
</div>
```

---

## 🏆 RECOMMANDATIONS SENIOR (niveau Stripe / Revolut / Airbnb)

### R1. **Safe Area iPhone** (Dynamic Island / Notch)
```css
.sticky-cta {
  padding-bottom: calc(env(safe-area-inset-bottom) + 16px);
}
body { padding-top: env(safe-area-inset-top); }
```

### R2. **Haptic Feedback sur actions critiques** (déjà partiellement implémenté)
Étendre à : ajouter au panier, validation formulaire, erreurs.

### R3. **Input zoom iOS — Solution définitive**
```tsx
// globals.css
@media screen and (max-width: 768px) {
  input, select, textarea { font-size: 16px; }
}
```

### R4. **Skeleton loading sur toutes les listes**
Priorité : grille produits boutique, bestsellers homepage.
Temps de chargement perçu réduit de ~40%.

### R5. **Offline-first partiel** (Service Worker)
```js
// Cacher les pages vues → expérience réseau faible (métro, transport)
workbox.strategies.StaleWhileRevalidate({ cacheName: 'pages-cache' });
```

### R6. **Checkout : un seul champ par écran** (pattern Stripe)
Réduire la charge cognitive = +15-25% completion rate mobile.

### R7. **Images WebP + next/image lazy loading**
Remplacer tout <img> natif par next/image avec sizes adaptatifs.

---

## 🗺️ ROADMAP MOBILE-FIRST

### 🔴 Haute Priorité (Sprint suivant)
- [ ] C1 — [iphone-se] Touch Targets : 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-
- [ ] C2 — [iphone-se] Touch Targets : 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-
- [ ] C3 — [iphone-se] Touch Targets : 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-
- [ ] C4 — [iphone-se] Touch Targets : 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-
- [ ] C5 — [iphone-se] Touch Targets : 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-
- [ ] C6 — [iphone-se] Touch Targets : 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-
- [ ] C7 — [iphone-se] Touch Targets : 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-
- [ ] C8 — [iphone-se] Touch Targets : 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-
- [ ] C9 — [iphone-se] Touch Targets : 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-
- [ ] C10 — [iphone-13] Touch Targets : 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-
- [ ] C11 — [iphone-13] Touch Targets : 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-
- [ ] C12 — [iphone-13] Touch Targets : 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-
- [ ] C13 — [iphone-13] Touch Targets : 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-
- [ ] C14 — [iphone-13] Touch Targets : 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-
- [ ] C15 — [iphone-13] Touch Targets : 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-
- [ ] C16 — [iphone-13] Touch Targets : 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-
- [ ] C17 — [iphone-13] Touch Targets : 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-
- [ ] C18 — [iphone-13] Touch Targets : 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-
- [ ] C19 — [galaxy-s23] Touch Targets : 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-
- [ ] C20 — [galaxy-s23] Touch Targets : 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-
- [ ] C21 — [galaxy-s23] Touch Targets : 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-
- [ ] C22 — [galaxy-s23] Touch Targets : 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-
- [ ] C23 — [galaxy-s23] Touch Targets : 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-
- [ ] C24 — [galaxy-s23] Touch Targets : 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-
- [ ] C25 — [galaxy-s23] Touch Targets : 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-
- [ ] C26 — [galaxy-s23] Touch Targets : 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-
- [ ] C27 — [galaxy-s23] Touch Targets : 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-
- [ ] C28 — [pixel-8] Touch Targets : 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-
- [ ] C29 — [pixel-8] Touch Targets : 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-
- [ ] C30 — [pixel-8] Touch Targets : 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-
- [ ] C31 — [pixel-8] Touch Targets : 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-
- [ ] C32 — [pixel-8] Touch Targets : 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-
- [ ] C33 — [pixel-8] Touch Targets : 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-
- [ ] C34 — [pixel-8] Touch Targets : 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-
- [ ] C35 — [pixel-8] Touch Targets : 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-
- [ ] C36 — [pixel-8] Touch Targets : 15 élément(s) interactif(s) < 44px : a.sr-only.focus:not-sr-only (1×1px) | button.p-2.hover:opacity-
- [ ] C37 — [iphone-se] iOS Zoom : 4 input(s) avec font-size < 16px (déclenche zoom iOS Safari) : input#email.auth-module__Iay1tq__inpu
- [ ] C38 — [iphone-se] iOS Zoom : 6 input(s) avec font-size < 16px (déclenche zoom iOS Safari) : input#prenom.auth-module__Iay1tq__inp
- [ ] C39 — [iphone-se] iOS Zoom : 4 input(s) avec font-size < 16px (déclenche zoom iOS Safari) : input#email.auth-module__Iay1tq__inpu
- [ ] C40 — [iphone-13] iOS Zoom : 4 input(s) avec font-size < 16px (déclenche zoom iOS Safari) : input#email.auth-module__Iay1tq__inpu
- [ ] C41 — [iphone-13] iOS Zoom : 6 input(s) avec font-size < 16px (déclenche zoom iOS Safari) : input#prenom.auth-module__Iay1tq__inp
- [ ] C42 — [iphone-13] iOS Zoom : 4 input(s) avec font-size < 16px (déclenche zoom iOS Safari) : input#email.auth-module__Iay1tq__inpu
- [ ] C43 — [galaxy-s23] iOS Zoom : 4 input(s) avec font-size < 16px (déclenche zoom iOS Safari) : input#email.auth-module__Iay1tq__inpu
- [ ] C44 — [galaxy-s23] iOS Zoom : 6 input(s) avec font-size < 16px (déclenche zoom iOS Safari) : input#prenom.auth-module__Iay1tq__inp
- [ ] C45 — [galaxy-s23] iOS Zoom : 4 input(s) avec font-size < 16px (déclenche zoom iOS Safari) : input#email.auth-module__Iay1tq__inpu
- [ ] C46 — [iphone-13] Performance/CLS : CLS critique : 0.7466 (seuil Google "Good" : <0.1)
- [ ] C47 — [iphone-13] Performance/CLS : CLS critique : 0.5708 (seuil Google "Good" : <0.1)
- [ ] C48 — [iphone-13] Performance/CLS : CLS critique : 0.7356 (seuil Google "Good" : <0.1)
- [ ] C49 — [iphone-13] A11y/button-name : [WCAG] Ensure buttons have discernible text — 1 occurrence(s)
- [ ] C50 — [galaxy-s23] A11y/button-name : [WCAG] Ensure buttons have discernible text — 1 occurrence(s)
- [ ] C51 — [ipad] A11y/button-name : [WCAG] Ensure buttons have discernible text — 1 occurrence(s)
- [ ] C52 — [iphone-se] Checkout/Touch : 15 éléments < 44px dans le tunnel de paiement

### 🟠 Moyenne Priorité (2 semaines)
- [ ] Sticky CTA mobile sur toutes les pages produit
- [ ] Font-size 16px sur tous les inputs (anti-zoom iOS)
- [ ] Optimisation images → WebP + lazy loading
- [ ] Audit safe-area iPhone (notch, Dynamic Island)
- [ ] Réduction bundle JS → code splitting agressif

### 🟡 Basse Priorité (1 mois)
- [ ] Service Worker offline-first partiel
- [ ] Haptic feedback étendu (checkout, wishlist)
- [ ] Refonte checkout mobile (une question par écran)
- [ ] Skeleton loading boutique
- [ ] Analytics mobile (session recording Hotjar / Clarity)

---

## 📸 SCREENSHOTS CAPTURÉS

```
· boutique-bottom-iphone-13.png
· boutique-top-iphone-13.png
· checkout-iphone-se.png
· checkout-keyboard-iphone-se.png
· form-checkout-galaxy-s23.png
· form-checkout-iphone-13.png
· form-checkout-iphone-se.png
· form-login-galaxy-s23.png
· form-login-iphone-13.png
· form-login-iphone-se.png
· form-register-galaxy-s23.png
· form-register-iphone-13.png
· form-register-iphone-se.png
· iphone-13-boutique.png
· iphone-13-checkout.png
· iphone-13-compte.png
· iphone-13-home.png
· iphone-13-login.png
· iphone-13-produit.png
· iphone-13-quiz.png
· iphone-13-register.png
· iphone-13-wishlist.png
· nav-closed-iphone13.png
· nav-open-iphone13.png
· orient-landscape-iphone-13.png
· orient-portrait-iphone-13.png
· orient-return-portrait-iphone-13.png
· pdp-scrolled-iphone-13.png
· pdp-top-iphone-13.png
· quiz-iphone-13.png
· quiz-pixel-8.png
· ref-iphone-13-boutique.png
· ref-iphone-13-checkout.png
· ref-iphone-13-home.png
· tablet-ipad-boutique.png
· tablet-ipad-checkout.png
· tablet-ipad-home.png
· tablet-samsung-tab-boutique.png
· tablet-samsung-tab-checkout.png
· tablet-samsung-tab-home.png
```

---

*Rapport généré automatiquement par Playwright Mobile Audit — SD Cosmétique*
*Auditeur simulé : QA Engineer Senior Mobile × Expert UX Mobile*
