(() => {
  "use strict";

  const I18N = window.SIC_I18N;
  const CONFIG = window.SIC_CONFIG;
  const LANGS = ["fr", "en", "ar"];
  const DEFAULT_DEADLINE = "2026-10-18T23:59:59+01:00";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  /* ------------------------------------------------------------------ */
  /* Langue                                                              */
  /* ------------------------------------------------------------------ */
  function detectLang() {
    const fromUrl = new URLSearchParams(location.search).get("lang");
    if (LANGS.includes(fromUrl)) return fromUrl;
    const saved = localStorage.getItem("sic_lang");
    return LANGS.includes(saved) ? saved : "fr";
  }

  const SIC = {
    lang: detectLang(),
    config: { registrationOpen: true, deadline: DEFAULT_DEADLINE, maxFileMb: 5 },
    dict() {
      return I18N[this.lang];
    },
    t(key, vars) {
      let s = I18N[this.lang][key] ?? I18N.fr[key] ?? key;
      if (vars && typeof s === "string") s = s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ""));
      return s;
    },
    esc,
  };
  window.SIC = SIC;

  function applyLang(lang) {
    SIC.lang = lang;
    localStorage.setItem("sic_lang", lang);
    const d = I18N[lang];
    document.documentElement.lang = lang;
    document.documentElement.dir = d.dir;
    document.title = d["meta.title"];
    $('meta[name="description"]').setAttribute("content", d["meta.desc"]);

    $$("[data-i18n]").forEach((el) => (el.textContent = SIC.t(el.dataset.i18n)));
    $$("[data-i18n-html]").forEach((el) => (el.innerHTML = SIC.t(el.dataset.i18nHtml)));
    $$("[data-i18n-placeholder]").forEach((el) => (el.placeholder = SIC.t(el.dataset.i18nPlaceholder)));
    $$("[data-i18n-region]").forEach((el) => (el.textContent = d.regions[el.dataset.i18nRegion]));
    $$("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));

    renderAll();
    document.dispatchEvent(new CustomEvent("sic:lang", { detail: { lang } }));
  }

  /* ------------------------------------------------------------------ */
  /* Rendus dynamiques                                                   */
  /* ------------------------------------------------------------------ */
  function renderAssets() {
    const box = $("#assets");
    if (!box) return;
    box.innerHTML = SIC.dict()["territory.assets"]
      .map(
        (a) => `<article class="asset reveal">
          <i class="fa-solid ${a.icon}" aria-hidden="true"></i>
          <div><h3>${esc(a.title)}</h3><p>${esc(a.text)}</p></div>
        </article>`
      )
      .join("");
  }

  function renderChallenges() {
    $("#challengeGrid").innerHTML = SIC.dict()
      .challenges.map(
        (c) => `<article class="challenge reveal" style="--c:${c.color}">
          <div class="challenge__top">
            <span class="challenge__num">0${c.n}</span>
            <span class="challenge__icon"><i class="fa-solid ${c.icon}" aria-hidden="true"></i></span>
          </div>
          <h3>${esc(c.title)}</h3>
          <p>${esc(c.short)}</p>
          <ul class="tags">${c.tags.slice(0, 4).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
          <button type="button" class="challenge__more" data-challenge="${c.n}">
            ${esc(SIC.t("challenges.more"))} <i class="fa-solid fa-arrow-right dir-icon" aria-hidden="true"></i>
          </button>
        </article>`
      )
      .join("");
  }

  function renderTracks() {
    $("#trackGrid").innerHTML = SIC.dict()
      .tracks.map(
        (t) => `<article class="track track--${t.key} reveal">
          <div class="track__head">
            <span class="track__icon"><i class="fa-solid ${t.icon}" aria-hidden="true"></i></span>
            <div>
              <h3>${esc(t.name)}</h3>
              <p class="track__tagline">${esc(t.tagline)}</p>
            </div>
          </div>
          <p class="track__flow" dir="ltr">${esc(t.flow)}</p>
          <div class="track__maturity">
            <span>${esc(SIC.t("tracks.maturity"))}</span>
            <div class="gauge">${[1, 2, 3].map((i) => `<i class="${i <= t.level ? "on" : ""}"></i>`).join("")}</div>
          </div>
          <h4>${esc(SIC.t("tracks.for"))}</h4>
          <p>${esc(t.audience)}</p>
          <p class="track__desc">${esc(t.desc)}</p>
          <h4>${esc(SIC.t("tracks.forms"))}</h4>
          <ul class="tags">${t.forms.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
          <a class="btn btn--outline btn--block" href="#register" data-preselect-track="${t.key}">
            ${esc(SIC.t("tracks.apply"))} ${esc(t.key.toUpperCase())}
          </a>
        </article>`
      )
      .join("");
  }

  function renderCriteria() {
    $("#criteriaGrid").innerHTML = SIC.dict()
      .criteria.map(
        (c, i) => `<div class="criterion reveal">
          <span class="criterion__n">${String(i + 1).padStart(2, "0")}</span>
          <i class="fa-solid ${c.icon}" aria-hidden="true"></i>
          <p>${esc(c.text)}</p>
        </div>`
      )
      .join("");
  }

  function renderPrizes() {
    const icons = { IDEA: "fa-lightbulb", LAB: "fa-flask", SCALE: "fa-rocket" };
    $("#prizeMain").innerHTML = SIC.dict()
      .prizesMain.map(
        (p) => `<article class="prize prize--${p.track.toLowerCase()} reveal">
          <span class="prize__track"><i class="fa-solid ${icons[p.track]}" aria-hidden="true"></i> Prix ${p.track}</span>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.text)}</p>
        </article>`
      )
      .join("");
    const chIcons = SIC.dict().challenges.map((c) => c.icon);
    $("#prizeThematic").innerHTML = SIC.dict()
      .prizesThematic.map((p, i) => `<li><i class="fa-solid ${chIcons[i]}" aria-hidden="true"></i> ${esc(p)}</li>`)
      .join("");
  }

  function renderContinuum() {
    $("#pipeline").innerHTML = SIC.dict()
      .continuum.map((s, i) => `<li style="--i:${i}"><span>${i + 1}</span><em>${esc(s)}</em></li>`)
      .join("");
    $("#supportList").innerHTML = SIC.dict()
      .support.map((s) => `<li><i class="fa-solid fa-circle-check" aria-hidden="true"></i> ${esc(s)}</li>`)
      .join("");
  }

  function renderTimeline() {
    $("#timeline").innerHTML = SIC.dict()
      .programme.map(
        (p) => `<article class="tl reveal" id="tl-${p.id}">
          <div class="tl__date">
            <strong>${esc(p.day)}</strong>
            <span>${esc(p.month)}</span>
            <small>${esc(p.weekday)}</small>
          </div>
          <div class="tl__dot"><i class="fa-solid ${p.icon}" aria-hidden="true"></i></div>
          <div class="tl__card">
            <div class="tl__badges"><span class="badge">${esc(p.time)}</span><span class="badge badge--accent">${esc(p.tag)}</span></div>
            <h3>${esc(p.title)}</h3>
            ${p.text ? `<p>${esc(p.text)}</p>` : ""}
            <ul>${p.items.map((it) => `<li>${esc(it)}</li>`).join("")}</ul>
            ${p.mode ? `<p class="tl__meta"><b>${esc(SIC.t("programme.mode"))} :</b> ${esc(p.mode)}</p>` : ""}
            ${p.goal ? `<p class="tl__meta tl__meta--goal"><b>${esc(SIC.t("programme.goal"))} :</b> ${esc(p.goal)}</p>` : ""}
          </div>
        </article>`
      )
      .join("");

    $("#calendarList").innerHTML = SIC.dict()
      .calendar.map(
        (c) => `<li>
          <i class="fa-solid ${c.icon}" aria-hidden="true"></i>
          <time>${esc(c.date)}</time>
          <span>${esc(c.title)}</span>
        </li>`
      )
      .join("");
  }

  function renderFaq() {
    $("#faqList").innerHTML = SIC.dict()
      .faq.map(
        (f) => `<details class="acc">
          <summary>${esc(f.q)}<i class="fa-solid fa-plus" aria-hidden="true"></i></summary>
          <p>${esc(f.a)}</p>
        </details>`
      )
      .join("");
  }

  function renderRules() {
    $("#rulesBody").innerHTML = SIC.dict()
      .rules.map((r) => `<section><h3>${esc(r.t)}</h3><p>${esc(r.p)}</p></section>`)
      .join("");
  }

  function renderPartners() {
    const items = CONFIG.partners.map(
      (p) => `<a class="partner partner--${esc(p.tier || "silver")}" href="${esc(p.url || "#")}" target="_blank" rel="noopener">
        <img src="${esc(p.logo)}" alt="${esc(p.name)}" loading="lazy">
      </a>`
    );
    const slots = Math.max(0, CONFIG.partnerSlots - items.length);
    for (let i = 0; i < slots; i++) {
      items.push(`<a class="partner partner--slot" href="#contact" data-subject="partner"><i class="fa-regular fa-image" aria-hidden="true"></i><span>${esc(SIC.t("partners.slot"))}</span></a>`);
    }
    $("#partnerGrid").innerHTML = items.join("");
  }

  function renderContact() {
    const a = $("#contactEmail");
    if (!a) return;
    a.textContent = CONFIG.contactEmail;
    a.href = `mailto:${CONFIG.contactEmail}`;
    const socials = $("#socials");
    if (!socials) return;
    socials.innerHTML = CONFIG.socials
      .map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.label)}"><i class="${esc(s.icon)}"></i></a>`)
      .join("");
  }

  function renderAll() {
    renderAssets();
    renderChallenges();
    renderTracks();
    renderCriteria();
    renderPrizes();
    renderContinuum();
    renderTimeline();
    renderFaq();
    renderRules();
    renderPartners();
    renderContact();
    observeReveal();
  }

  /* ------------------------------------------------------------------ */
  /* Apparition au défilement & compteurs                                */
  /* ------------------------------------------------------------------ */
  const revealObserver =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (!e.isIntersecting) return;
              e.target.classList.add("is-visible");
              revealObserver.unobserve(e.target);
            });
          },
          { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
        )
      : null;

  function observeReveal() {
    $$(".reveal:not(.is-visible)").forEach((el) => {
      if (!revealObserver || reduceMotion) el.classList.add("is-visible");
      else revealObserver.observe(el);
    });
  }

  function initCounters() {
    const els = $$("[data-count]");
    const run = (el) => {
      const target = Number(el.dataset.count);
      if (reduceMotion) return (el.textContent = target);
      const start = performance.now();
      const dur = 1400;
      const tick = (now) => {
        const p = Math.min(1, (now - start) / dur);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if (!("IntersectionObserver" in window)) return els.forEach(run);
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          run(e.target);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.6 });
    els.forEach((el) => obs.observe(el));
  }

  /* ------------------------------------------------------------------ */
  /* Compte à rebours                                                    */
  /* ------------------------------------------------------------------ */
  let cdTimer;
  function initCountdown() {
    const deadline = new Date(SIC.config.deadline).getTime();
    const box = $("#countdown");
    const set = (k, v) => ($(`[data-cd="${k}"]`, box).textContent = String(v).padStart(2, "0"));
    const tick = () => {
      const diff = deadline - Date.now();
      if (diff <= 0) {
        clearInterval(cdTimer);
        box.classList.add("is-closed");
        $(".countdown__label", box).dataset.i18n = "hero.closed";
        $(".countdown__label", box).textContent = SIC.t("hero.closed");
        $(".countdown__grid", box).hidden = true;
        return;
      }
      set("d", Math.floor(diff / 864e5));
      set("h", Math.floor((diff / 36e5) % 24));
      set("m", Math.floor((diff / 6e4) % 60));
      set("s", Math.floor((diff / 1e3) % 60));
    };
    clearInterval(cdTimer);
    tick();
    cdTimer = setInterval(tick, 1000);
  }

  /* ------------------------------------------------------------------ */
  /* Ciel étoilé                                                         */
  /* ------------------------------------------------------------------ */
  function initStars() {
    const canvas = $("#stars");
    const ctx = canvas.getContext("2d");
    let stars = [];
    let shooting = null;
    let w, h, dpr;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round((w * h) / 5200);
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h * 0.85,
        r: Math.random() * 1.3 + 0.2,
        a: Math.random() * Math.PI * 2,
        s: 0.004 + Math.random() * 0.018,
        gold: Math.random() < 0.12,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const st of stars) {
        st.a += st.s;
        const o = 0.35 + Math.sin(st.a) * 0.35 + 0.3;
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fillStyle = st.gold ? `rgba(244,201,93,${o})` : `rgba(255,255,255,${o})`;
        ctx.fill();
      }
      if (!shooting && Math.random() < 0.004) {
        shooting = { x: Math.random() * w * 0.7 + w * 0.2, y: Math.random() * h * 0.3, l: 0 };
      }
      if (shooting) {
        shooting.l += 14;
        const dirX = document.documentElement.dir === "rtl" ? 1 : -1;
        const x2 = shooting.x + dirX * shooting.l;
        const y2 = shooting.y + shooting.l * 0.45;
        const g = ctx.createLinearGradient(shooting.x + dirX * (shooting.l - 120), y2 - 54, x2, y2);
        g.addColorStop(0, "rgba(255,255,255,0)");
        g.addColorStop(1, "rgba(255,236,190,.9)");
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(x2 - dirX * 120, y2 - 54);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        if (shooting.l > 420) shooting = null;
      }
      if (!reduceMotion) requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    draw();
  }

  /* ------------------------------------------------------------------ */
  /* En-tête, navigation, modales                                        */
  /* ------------------------------------------------------------------ */
  function initHeader() {
    const toTop = $("#toTop");
    const onScroll = () => {
      const y = window.scrollY;
      document.body.classList.toggle("is-scrolled", y > 40);
      toTop.classList.toggle("is-visible", y > 900);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

    const burger = $("#burger");
    const nav = $("#nav");
    const close = () => {
      document.body.classList.remove("nav-open");
      burger.setAttribute("aria-expanded", "false");
    };
    burger.addEventListener("click", () => {
      const open = !document.body.classList.contains("nav-open");
      document.body.classList.toggle("nav-open", open);
      burger.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", (e) => e.target.closest("a") && close());

    const links = $$("a", nav);
    const sections = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);
    if ("IntersectionObserver" in window) {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${e.target.id}`));
          });
        },
        { rootMargin: "-45% 0px -50% 0px" }
      );
      sections.forEach((s) => obs.observe(s));
    }

    $$("[data-lang]").forEach((b) => b.addEventListener("click", () => applyLang(b.dataset.lang)));
  }

  function openModal(dlg) {
    if (typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "");
    document.body.classList.add("modal-open");
  }
  function closeModal(dlg) {
    if (typeof dlg.close === "function") dlg.close();
    else dlg.removeAttribute("open");
    document.body.classList.remove("modal-open");
  }

  function openChallenge(n) {
    const c = SIC.dict().challenges.find((x) => x.n === n);
    if (!c) return;
    $("#modalBody").innerHTML = `
      <div class="modal__hero" style="--c:${c.color}">
        <span class="modal__icon"><i class="fa-solid ${c.icon}" aria-hidden="true"></i></span>
        <p class="modal__kicker">${esc(SIC.t("challenges.label"))} ${c.n}</p>
        <h2 id="modalTitle">${esc(c.title)}</h2>
      </div>
      <div class="modal__content">
        ${c.long.map((p) => `<p>${esc(p)}</p>`).join("")}
        <ul class="tags tags--lg">${c.tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
        <a class="btn btn--primary" href="#register" data-preselect-challenge="${c.n}">
          ${esc(SIC.t("challenges.apply"))} <i class="fa-solid fa-arrow-right dir-icon" aria-hidden="true"></i>
        </a>
      </div>`;
    openModal($("#challengeModal"));
  }

  function initDelegation() {
    document.addEventListener("click", (e) => {
      const more = e.target.closest("[data-challenge]");
      if (more) return openChallenge(Number(more.dataset.challenge));

      const rules = e.target.closest("[data-open-rules]");
      if (rules) {
        e.preventDefault();
        return openModal($("#rulesModal"));
      }
      if (e.target.closest("[data-open-story]")) return openModal($("#storyModal"));

      if (e.target.closest("[data-close]")) return closeModal(e.target.closest("dialog"));

      const preCh = e.target.closest("[data-preselect-challenge]");
      const preTr = e.target.closest("[data-preselect-track]");
      if (preCh || preTr) {
        const dlg = e.target.closest("dialog");
        if (dlg) closeModal(dlg);
        document.dispatchEvent(
          new CustomEvent("sic:preselect", {
            detail: {
              challenge: preCh ? Number(preCh.dataset.preselectChallenge) : null,
              track: preTr ? preTr.dataset.preselectTrack : null,
            },
          })
        );
      }

      const subj = e.target.closest("[data-subject]");
      if (subj) $("#c_subject").value = subj.dataset.subject;
    });

    $$("dialog").forEach((dlg) => {
      dlg.addEventListener("click", (e) => e.target === dlg && closeModal(dlg));
      dlg.addEventListener("close", () => document.body.classList.remove("modal-open"));
    });

    document.addEventListener("toggle", (e) => {
      if (!e.target.matches || !e.target.matches("details.acc") || !e.target.open) return;
      $$("details.acc").forEach((d) => d !== e.target && (d.open = false));
    }, true);
  }

  /* ------------------------------------------------------------------ */
  /* Formulaire de contact                                               */
  /* ------------------------------------------------------------------ */
  function initContact() {
    const form = $("#contactForm");
    if (!form) return;
    const alertBox = $("#contactAlert");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      alertBox.hidden = true;
      let ok = true;
      $$("[required]", form).forEach((el) => {
        const valid = el.checkValidity();
        el.closest(".field").classList.toggle("has-error", !valid);
        if (!valid) ok = false;
      });
      if (!ok) return;
      const btn = $("button[type=submit]", form);
      btn.disabled = true;
      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(new FormData(form))),
        });
        const data = await res.json();
        alertBox.hidden = false;
        if (data.ok) {
          alertBox.className = "form-alert form-alert--ok";
          alertBox.textContent = SIC.t("contact.success");
          form.reset();
        } else {
          alertBox.className = "form-alert";
          alertBox.textContent = SIC.t(data.error === "rate_limited" ? "err.rate_limited" : "err.check");
        }
      } catch {
        alertBox.hidden = false;
        alertBox.className = "form-alert";
        alertBox.textContent = SIC.t("err.network");
      } finally {
        btn.disabled = false;
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Démarrage                                                           */
  /* ------------------------------------------------------------------ */
  async function loadConfig() {
    try {
      const res = await fetch("/api/config");
      if (res.ok) Object.assign(SIC.config, await res.json());
    } catch {
      /* site statique : valeurs par défaut */
    }
    document.dispatchEvent(new CustomEvent("sic:config", { detail: SIC.config }));
    initCountdown();
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyLang(SIC.lang);
    initHeader();
    initDelegation();
    initCounters();
    initStars();
    initContact();
    initCountdown();
    loadConfig();
  });
})();
