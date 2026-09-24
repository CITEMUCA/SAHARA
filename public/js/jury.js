(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const KEY = "sic_jury_token";
  const TRACKS = { idea: "IDEA", lab: "LAB", scale: "SCALE" };
  let token = sessionStorage.getItem(KEY);
  let juror = null;
  let current = null;
  let fileUrl = null;

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
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("is-visible");
    clearTimeout(t._t);
    t._t = setTimeout(() => t.classList.remove("is-visible"), 2400);
  }
  const avg = (n) => (n == null ? `<span class="avg is-empty">-</span>` : `<span class="avg">${Number(n).toFixed(1)}<small> / 5</small></span>`);

  $("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    $("#loginError").hidden = true;
    const res = await fetch("/api/jury/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: $("#email").value, password: $("#password").value }),
    });
    const data = await res.json().catch(() => ({}));
    if (!data.ok) {
      $("#loginError").hidden = false;
      return;
    }
    token = data.token;
    juror = data.juror;
    sessionStorage.setItem(KEY, token);
    sessionStorage.setItem(KEY + "_who", JSON.stringify(juror));
    start();
  });

  function logout() {
    token = null;
    sessionStorage.removeItem(KEY);
    $("#app").hidden = true;
    $("#login").hidden = false;
  }
  $("#logoutBtn").addEventListener("click", logout);

  async function loadList() {
    const data = await (await api("/api/jury/registrations")).json();
    $("#listIntro").textContent = `Parcours ${TRACKS[data.track] || data.track}. Vous ne voyez que les projets de ce parcours.`;
    $("#empty").hidden = data.items.length > 0;
    $("#body").innerHTML = data.items
      .map(
        (r) => `<tr data-id="${r.id}">
          <td class="t-title">${esc(r.title)}<small>${esc(r.ref)}</small></td>
          <td>${esc(r.leader_name)}</td>
          <td>${esc(r.institution || "-")}</td>
          <td>C${r.challenge}</td>
          <td>${avg(r.mine)}</td>
          <td>${avg(r.avg)}</td>
        </tr>`
      )
      .join("");
  }

  async function openProject(id) {
    const data = await (await api(`/api/jury/registrations/${id}`)).json();
    current = data.item;
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    fileUrl = null;
    const marks = data.mine ? data.mine.scores : [];
    const p = current.payload.project;
    $("#pageView").innerHTML = `
      <header class="main__head">
        <div>
          <button type="button" class="btn btn--outline" id="back"><i class="fa-solid fa-arrow-left"></i> Retour aux projets</button>
          <p class="ref" style="margin-top:14px">${esc(current.ref)}</p>
          <h1>${esc(current.title)}</h1>
          <p>${esc(current.institution || "")} · ${esc(current.leader_name)}</p>
        </div>
      </header>
      <div class="case">
        <div>
          <section class="d-section">
            <h3>Résumé</h3>
            <p>${esc(p.summary)}</p>
            <h3>Défi ou opportunité</h3>
            <p>${esc(p.problem)}</p>
            <h3>Solution</h3>
            <p>${esc(p.solution)}</p>
          </section>
          <section class="d-section">
            <div class="score-head"><h3>Ma grille</h3><span class="avg">${data.mine ? Number(data.mine.avg).toFixed(1) + " / 5" : "Pas encore noté"}</span></div>
            ${data.criteria
              .map(
                (label, i) => `<div class="criterion-row"><span>${esc(label)}</span><span class="marks">${[1, 2, 3, 4, 5]
                  .map((n) => `<button type="button" data-i="${i}" data-n="${n}" class="${marks[i] === n ? "is-on" : ""}">${n}</button>`)
                  .join("")}</span></div>`
              )
              .join("")}
            <textarea id="comment" rows="3" placeholder="Commentaire (facultatif)">${esc(data.mine ? data.mine.comment : "")}</textarea>
            <button class="btn btn--primary" id="saveScore" type="button" style="margin-top:12px"><i class="fa-solid fa-check"></i> Enregistrer ma note</button>
            <p class="muted-empty">La moyenne affichée aux organisateurs est la moyenne de tous les jurys de ce parcours.</p>
          </section>
        </div>
        <aside class="reader">
          <h3>Présentation</h3>
          <p class="muted-empty">${esc(current.file_original || "")}</p>
          <iframe id="pdfFrame" title="Présentation" hidden></iframe>
          <p class="muted-empty" id="pptNote" hidden>PowerPoint : utilisez le téléchargement, la lecture à l'écran est réservée au PDF.</p>
          <button class="btn btn--outline" id="dl" type="button"><i class="fa-solid fa-download"></i> Télécharger</button>
        </aside>
      </div>`;
    $("#listView").hidden = true;
    $("#pageView").hidden = false;
    window.scrollTo(0, 0);
    if ((current.file_original || "").toLowerCase().endsWith(".pdf")) {
      const file = await api(`/api/jury/registrations/${id}/file?inline=1`);
      if (file.ok) {
        fileUrl = URL.createObjectURL(await file.blob());
        const frame = $("#pdfFrame");
        frame.hidden = false;
        frame.src = fileUrl;
      }
    } else $("#pptNote").hidden = false;
  }

  $("#body").addEventListener("click", (e) => {
    const tr = e.target.closest("tr[data-id]");
    if (tr) openProject(Number(tr.dataset.id));
  });

  $("#pageView").addEventListener("click", async (e) => {
    const mark = e.target.closest(".marks button");
    if (mark) {
      mark.parentElement.querySelectorAll("button").forEach((b) => b.classList.toggle("is-on", b === mark));
      return;
    }
    if (e.target.closest("#back")) {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
      fileUrl = null;
      $("#pageView").hidden = true;
      $("#listView").hidden = false;
      loadList();
      return;
    }
    if (e.target.closest("#dl") && current) {
      const res = await api(`/api/jury/registrations/${current.id}/file`);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = current.file_original || current.ref;
      a.click();
      return;
    }
    if (!e.target.closest("#saveScore") || !current) return;
    const scores = [...$("#pageView").querySelectorAll(".criterion-row")].map((row) => {
      const on = row.querySelector(".marks button.is-on");
      return on ? Number(on.dataset.n) : 0;
    });
    if (scores.some((n) => n < 1)) return toast("Notez les 8 critères, de 1 à 5");
    const res = await api(`/api/jury/registrations/${current.id}/score`, {
      method: "PUT",
      body: JSON.stringify({ scores, comment: $("#comment").value }),
    });
    if (!res.ok) return toast("Note non enregistrée");
    toast("Note enregistrée");
    openProject(current.id);
  });

  async function start() {
    juror = juror || JSON.parse(sessionStorage.getItem(KEY + "_who") || "null");
    $("#login").hidden = true;
    $("#app").hidden = false;
    if (juror) $("#juryWho").textContent = `${juror.name} · parcours ${TRACKS[juror.track] || ""}`;
    try {
      await loadList();
    } catch {
      /* retour connexion */
    }
  }
  if (token) start();
})();
