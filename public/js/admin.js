(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  const TOKEN_KEY = "sic_admin_token";
  const CHALLENGES = {
    1: ["Océan, Port & Économie bleue", "#1E9BD7"],
    2: ["Eau, Énergies renouvelables & Transition verte", "#1B8A4B"],
    3: ["Agriculture, Alimentation & Bioressources", "#C98B2B"],
    4: ["Mobilité, Logistique & Territoires intelligents", "#5B5FC7"],
    5: ["Art, Culture, Tourisme, Sport & Expérience", "#C1272D"],
    6: ["Entrepreneuriat, Investissement & Chaînes de valeur", "#B8652F"],
  };
  const TRACKS = { idea: ["IDEA", "#E8A93B"], lab: ["LAB", "#1E9BD7"], scale: ["SCALE", "#B8652F"] };
  const STATUSES = {
    received: ["Reçue", "#6D7290"],
    review: ["En évaluation", "#1E9BD7"],
    shortlisted: ["Présélectionnée", "#E8A93B"],
    finalist: ["Finaliste", "#5B3FC7"],
    winner: ["Lauréate", "#1B8A4B"],
    rejected: ["Non retenue", "#C1272D"],
  };
  const LABELS = {
    profile: {
      student: "Étudiant(e)",
      researcher: "Enseignant-chercheur",
      startup: "Startup / Entrepreneur(e)",
    },
    level: { licence: "Licence", master: "Master", doctorate: "Doctorat", engineer: "Cycle d'ingénieur" },
  };

  let token = sessionStorage.getItem(TOKEN_KEY);
  let current = null;
  let searchTimer;

  async function api(path, opts = {}) {
    const res = await fetch(path, {
      ...opts,
      headers: { ...(opts.body ? { "Content-Type": "application/json" } : {}), Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
    });
    if (res.status === 401) {
      logout();
      throw new Error("unauthorized");
    }
    return res;
  }

  async function download(path, fallbackName) {
    const res = await api(path);
    if (!res.ok) return toast("Export impossible");
    const blob = await res.blob();
    const cd = res.headers.get("Content-Disposition") || "";
    const m = cd.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = m ? decodeURIComponent(m[1]) : fallbackName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("is-visible");
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove("is-visible"), 2400);
  }

  const fmtDate = (iso) => new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  const status = (s) => `<span class="st st--${s}">${esc(STATUSES[s]?.[0] || s)}</span>`;
  const trackPill = (t) => `<span class="pill pill--${t}">${esc(TRACKS[t]?.[0] || t)}</span>`;
  const item = (label, value, full = false) =>
    value || value === 0 ? `<div class="d-item${full ? " d-item--full" : ""}"><dt>${esc(label)}</dt><dd>${value}</dd></div>` : "";
  const txt = (v) => (v ? esc(v) : "");

  $("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    $("#loginError").hidden = true;
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: $("#password").value }),
    });
    const data = await res.json().catch(() => ({}));
    if (!data.ok) {
      $("#loginError").textContent = res.status === 429 ? "Trop de tentatives, réessayez plus tard." : "Mot de passe incorrect.";
      $("#loginError").hidden = false;
      return;
    }
    token = data.token;
    sessionStorage.setItem(TOKEN_KEY, token);
    start();
  });

  function logout() {
    if (token) fetch("/api/admin/logout", { method: "POST", headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    token = null;
    sessionStorage.removeItem(TOKEN_KEY);
    $("#app").hidden = true;
    $("#login").hidden = false;
  }
  $("#logoutBtn").addEventListener("click", logout);

  function showView(name) {
    $$(".side__nav button").forEach((b) => b.classList.toggle("is-active", b.dataset.view === name));
    $$(".view").forEach((v) => v.classList.toggle("is-active", v.dataset.view === name));
    if (name === "registrations") loadRegistrations();
    if (name === "dashboard") loadStats();
    if (name === "exports") renderExports();
  }
  $$(".side__nav button").forEach((b) => b.addEventListener("click", () => showView(b.dataset.view)));
  $$("[data-refresh]").forEach((b) => b.addEventListener("click", () => showView($(".view.is-active").dataset.view)));

  function bars(el, rows, dict) {
    const max = Math.max(1, ...rows.map((r) => r.n));
    const keys = Object.keys(dict);
    const byKey = Object.fromEntries(rows.map((r) => [String(r.k), r.n]));
    el.innerHTML = keys
      .map((k) => {
        const n = byKey[k] || 0;
        return `<div class="bar" style="--c:${dict[k][1]}">
          <span class="bar__label" title="${esc(dict[k][0])}">${esc(dict[k][0])}</span>
          <span class="bar__track"><span class="bar__fill" style="width:${(n / max) * 100}%"></span></span>
          <span class="bar__value">${n}</span>
        </div>`;
      })
      .join("");
  }

  async function loadStats() {
    const s = await (await api("/api/admin/stats")).json();
    $("#kTotal").textContent = s.total;
    $("#kPeople").textContent = s.participants;
    $("#countReg").textContent = s.total;
    bars($("#chartTrack"), s.byTrack, TRACKS);
    bars($("#chartStatus"), s.byStatus, STATUSES);
    bars($("#chartChallenge"), s.byChallenge, CHALLENGES);
    const max = Math.max(1, ...s.byDay.map((d) => d.n), 1);
    $("#chartDay").innerHTML = s.byDay.length
      ? s.byDay
          .map(
            (d) => `<div class="spark__col" title="${d.k} : ${d.n}">
              <b>${d.n}</b>
              <div class="spark__bar" style="height:${(d.n / max) * 100}%"></div>
              <small>${d.k.slice(8, 10)}/${d.k.slice(5, 7)}</small>
            </div>`
          )
          .join("")
      : `<p class="muted-empty">Aucune candidature pour le moment.</p>`;
  }

  function initFilters() {
    $("#fChallenge").insertAdjacentHTML(
      "beforeend",
      Object.entries(CHALLENGES)
        .map(([k, [l]]) => `<option value="${k}">${k}. ${esc(l)}</option>`)
        .join("")
    );
    const opts = Object.entries(STATUSES)
      .map(([k, [l]]) => `<option value="${k}">${esc(l)}</option>`)
      .join("");
    $("#fStatus").insertAdjacentHTML("beforeend", opts);
    window.SIC_STATUS_OPTS = opts;
    ["#fTrack", "#fChallenge", "#fStatus"].forEach((s) => $(s).addEventListener("change", loadRegistrations));
    $("#fQ").addEventListener("input", () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(loadRegistrations, 250);
    });
  }

  async function loadRegistrations() {
    const qs = new URLSearchParams({
      q: $("#fQ").value,
      track: $("#fTrack").value,
      challenge: $("#fChallenge").value,
      status: $("#fStatus").value,
    });
    const { items } = await (await api(`/api/admin/registrations?${qs}`)).json();
    $("#resultCount").textContent = items.length;
    $("#regEmpty").hidden = items.length > 0;
    $("#regBody").innerHTML = items
      .map(
        (r) => `<tr data-id="${r.id}">
          <td><span class="ref">${esc(r.ref)}</span></td>
          <td>${esc(fmtDate(r.created_at))}</td>
          <td class="t-title">${esc(r.title)}<small>${esc(r.email)}</small></td>
          <td>${esc(r.leader_name)}</td>
          <td>${esc(r.institution || "-")}</td>
          <td>${trackPill(r.track)}</td>
          <td><span class="ch" style="--c:${CHALLENGES[r.challenge]?.[1]}">${r.challenge}</span></td>
          <td>${r.team_size}</td>
          <td>${status(r.status)}</td>
        </tr>`
      )
      .join("");
  }

  $("#regBody").addEventListener("click", (e) => {
    const tr = e.target.closest("tr[data-id]");
    if (tr) openDetail(Number(tr.dataset.id));
  });

  async function openDetail(id) {
    const { item: r } = await (await api(`/api/admin/registrations/${id}`)).json();
    current = r;
    const { leader: l, members, project: p, consents } = r.payload;
    const titleLine = p.acronym ? `${esc(r.title)} <small>(${esc(p.acronym)})</small>` : esc(r.title);
    $("#candidatureView").innerHTML = `
      <header class="main__head">
        <div>
          <button type="button" class="btn btn--outline" id="backList"><i class="fa-solid fa-arrow-left"></i> Retour à la liste</button>
          <p class="ref" style="margin-top:14px">${esc(r.ref)} · ${esc(fmtDate(r.created_at))}</p>
          <h1 id="dTitle">${titleLine}</h1>
        </div>
      </header>
      <div class="case case--solo">
        <section class="d-section">
          <h3>Projet</h3>
          <dl class="d-grid">
            ${item("Parcours", trackPill(r.track))}
            ${item("Challenge", `${r.challenge}. ${esc(CHALLENGES[r.challenge]?.[0])}`)}
            ${item("Acronyme du projet", txt(p.acronym))}
            ${item("Acronyme de l'équipe", txt(p.team_acronym))}
            ${item("Présentation du projet", txt(p.summary), true)}
          </dl>
        </section>
        <section class="d-section">
          <h3>Porteur de projet</h3>
          <dl class="d-grid">
            ${item("Nom", esc(`${l.first_name} ${l.last_name}`))}
            ${item("Email", `<a href="mailto:${esc(l.email)}">${esc(l.email)}</a>`)}
            ${item("Téléphone", `<a href="tel:${esc(l.phone)}">${esc(l.phone)}</a>`)}
            ${item("Ville / Région", txt(l.city || r.city))}
            ${item("Profil", txt(LABELS.profile[l.profile]))}
            ${item("Niveau d'études", txt(LABELS.level[l.study_level]))}
            ${item("Intitulé de formation", txt(l.training_title))}
            ${item("Établissement", txt(l.institution || r.institution))}
          </dl>
        </section>
        <section class="d-section">
          <h3>Équipe : ${r.team_size} personne(s)${p.team_acronym ? ` · ${esc(p.team_acronym)}` : ""}</h3>
          <div class="d-members">
            ${
              members.length
                ? members
                    .map(
                      (m, i) => `<div class="d-member">
                        <strong>Membre ${i + 2} · ${esc(m.name)}</strong>
                        <small>${[
                          LABELS.profile[m.profile],
                          LABELS.level[m.study_level],
                          m.training_title,
                          m.institution,
                        ]
                          .filter(Boolean)
                          .map(esc)
                          .join(" · ")}</small>
                      </div>`
                    )
                    .join("")
                : `<p class="muted-empty">Candidature individuelle.</p>`
            }
          </div>
        </section>
        <section class="d-section">
          <h3>Engagements</h3>
          <dl class="d-grid">
            ${item("Exactitude / participation", consents.rules ? "Oui" : "Non")}
            ${item("Communication du projet", consents.data ? "Oui" : "Non")}
            ${item("Droit à l'image", consents.media ? "Oui" : "Non")}
            ${item("Langue", txt((r.lang || "").toUpperCase()))}
          </dl>
        </section>
        <section class="d-section case-actions">
          <div class="field"><label for="dStatus">Statut</label><select id="dStatus">${window.SIC_STATUS_OPTS || ""}</select></div>
          <div class="field field--grow"><label for="dNote">Note interne</label><textarea id="dNote" rows="2">${esc(r.admin_note || "")}</textarea></div>
          <div class="drawer__actions">
            <button class="btn btn--danger" id="dDelete" type="button"><i class="fa-regular fa-trash-can"></i></button>
            <button class="btn btn--primary" id="dSave" type="button"><i class="fa-solid fa-check"></i> Enregistrer</button>
          </div>
        </section>
      </div>`;
    $("#dStatus").value = r.status;
    showView("candidature");
    window.scrollTo(0, 0);
  }

  function leaveDetail() {
    current = null;
    showView("registrations");
  }

  $("#candidatureView").addEventListener("click", async (e) => {
    if (e.target.closest("#backList")) return leaveDetail();
    if (e.target.closest("#dSave") && current) {
      await api(`/api/admin/registrations/${current.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: $("#dStatus").value, admin_note: $("#dNote").value }),
      });
      toast("Candidature mise à jour");
      loadRegistrations();
      return;
    }
    if (e.target.closest("#dDelete") && current && confirm(`Supprimer définitivement la candidature ${current.ref} ?`)) {
      await api(`/api/admin/registrations/${current.id}`, { method: "DELETE" });
      toast("Candidature supprimée");
      leaveDetail();
      loadRegistrations();
      loadStats();
    }
  });

  function exportUrl(track, challenge) {
    const qs = new URLSearchParams();
    if (track) qs.set("track", track);
    if (challenge) qs.set("challenge", String(challenge));
    const q = qs.toString();
    return `/api/admin/export.xlsx${q ? `?${q}` : ""}`;
  }

  function renderExports() {
    $("#exportTracks").innerHTML = Object.keys(TRACKS)
      .map(
        (t) =>
          `<button type="button" class="btn btn--outline" data-track="${t}" data-challenge=""><i class="fa-solid fa-file-excel"></i> ${TRACKS[t][0]}</button>`
      )
      .join("");
    $("#exportChallenges").innerHTML = Object.entries(CHALLENGES)
      .map(
        ([n, [title]]) =>
          `<button type="button" class="btn btn--outline" data-track="" data-challenge="${n}"><i class="fa-solid fa-file-excel"></i> ${n}. ${esc(title)}</button>`
      )
      .join("");
    $("#exportMatrix").innerHTML = Object.keys(TRACKS)
      .flatMap((t) =>
        Object.keys(CHALLENGES).map(
          (n) =>
            `<button type="button" class="btn btn--ghost btn--sm" data-track="${t}" data-challenge="${n}">${TRACKS[t][0]} · C${n}</button>`
        )
      )
      .join("");
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-export], [data-track]");
    if (!btn || !token) return;
    if (btn.id === "exportAllBtn" || btn.dataset.export === "all") {
      download(exportUrl(), "sic2026-candidatures.xlsx");
      return;
    }
    if (btn.hasAttribute("data-track")) {
      const track = btn.dataset.track || "";
      const challenge = btn.dataset.challenge || "";
      const name = ["sic2026", track && track.toUpperCase(), challenge && `challenge-${String(challenge).padStart(2, "0")}`]
        .filter(Boolean)
        .join("-");
      download(exportUrl(track, challenge), `${name || "sic2026-candidatures"}.xlsx`);
    }
  });

  function start() {
    $("#login").hidden = true;
    $("#app").hidden = false;
    initFilters();
    renderExports();
    showView("dashboard");
  }

  if (token) start();
})();
