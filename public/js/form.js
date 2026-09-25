(() => {
  "use strict";

  const SIC = window.SIC;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = SIC.esc;

  const form = $("#regForm");
  if (!form) return;

  const DRAFT_KEY = "sic26_draft";
  const TOTAL = 4;
  const ALLOWED = [".pdf", ".ppt", ".pptx"];
  const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;
  const PHONE_RE = /^\+?[0-9 ().-]{8,20}$/;
  const FIELD_STEP = {
    full_name: 1, email: 1, phone: 1, institution: 1, institution_other: 1, uni_group: 1, city: 1, profile: 1, study_level: 1, training_title: 1, startup_name: 1,
    track: 2, challenge: 2, title: 2, acronym: 2, summary: 2, problem: 2,
    team_size: 3,
    consent_rules: 4, consent_data: 4, consent_media: 4,
  };

  let step = 1;
  let members = [];
  let file = null;
  let saveTimer;

  const els = {
    steps: $$(".step", form),
    stepper: $$("#stepper li"),
    bar: $("#progressBar"),
    prev: $("#prevBtn"),
    next: $("#nextBtn"),
    submit: $("#submitBtn"),
    alert: $("#formAlert"),
    stepOf: $("#stepOf"),
    draft: $("#draftStatus"),
    teamSize: $("#team_size"),
    members: $("#members"),
    solo: $("#soloHint"),
    trl: $("#trl"),
    trlOut: $("#trlOut"),
    drop: $("#dropzone"),
    fileInput: $("#project_file"),
  };

  /* ------------------------------------------------------------------ */
  /* Choix parcours & challenge                                          */
  /* ------------------------------------------------------------------ */
  function renderChoices() {
    const d = SIC.dict();
    const track = selectedValue("track");
    const challenge = selectedValue("challenge");
    $("#trackChoices").innerHTML = d.tracks
      .map(
        (t) => `<label class="choice choice--${t.key}">
          <input type="radio" name="track" value="${t.key}" ${track === t.key ? "checked" : ""} required>
          <span class="choice__body">
            <i class="fa-solid ${t.icon}" aria-hidden="true"></i>
            <strong>${esc(t.key.toUpperCase())}</strong>
            <small>${esc(t.tagline)}</small>
          </span>
        </label>`
      )
      .join("");
    $("#challengeChoices").innerHTML = d.challenges
      .map(
        (c) => `<label class="choice choice--ch" style="--c:${c.color}">
          <input type="radio" name="challenge" value="${c.n}" ${String(challenge) === String(c.n) ? "checked" : ""} required>
          <span class="choice__body">
            <i class="fa-solid ${c.icon}" aria-hidden="true"></i>
            <small class="choice__n">${c.n}</small>
            <span>${esc(c.title)}</span>
          </span>
        </label>`
      )
      .join("");
    updateConditional();
  }

  function selectedValue(name) {
    const el = form.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : "";
  }

  const AUTRE_INST = "__autre__";

  function profileAllowed(box, profile) {
    const allowed = (box.dataset.showFor || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return allowed.includes(profile);
  }

  function isAutreInstitution(value) {
    return value === AUTRE_INST || value === "autre";
  }

  function updateConditional() {
    const profile = selectedValue("profile");
    $$(".conditional", form).forEach((box) => {
      if (box.closest(".member")) return;
      box.classList.toggle("is-shown", profileAllowed(box, profile));
    });
    const academic = profile === "student" || profile === "researcher";
    const student = profile === "student";
    const startup = profile === "startup";
    const group = ($("#uni_group") || {}).value || "";
    const instValue = ($("#institution") || {}).value || "";
    const showSelect = academic && (group === "uca" || group === "other");
    const showOther = showSelect && isAutreInstitution(instValue);

    const uniGroup = $("#uni_group");
    const institution = $("#institution");
    const institutionOther = $("#institution_other");
    const institutionWrap = $("#institutionWrap");
    const institutionOtherWrap = $("#institutionOtherWrap");
    const training = $("#training_title");
    const startupName = $("#startup_name");

    if (uniGroup) uniGroup.required = academic;
    if (institutionWrap) {
      institutionWrap.hidden = !showSelect;
      institutionWrap.style.display = showSelect ? "" : "none";
    }
    if (institutionOtherWrap) {
      institutionOtherWrap.hidden = !showOther;
      institutionOtherWrap.style.display = showOther ? "" : "none";
    }
    if (institution) institution.required = showSelect;
    if (institutionOther) {
      institutionOther.required = showOther;
      if (!showOther) institutionOther.value = "";
    }
    if (training) training.required = student;
    if (startupName) startupName.required = startup;
  }

  /* ------------------------------------------------------------------ */
  /* Équipe                                                              */
  /* ------------------------------------------------------------------ */
  function syncMembersFromDom() {
    if (!els.members) return;
    $$(".member", els.members).forEach((box, i) => {
      members[i] = {
        name: $("[data-m=name]", box).value,
        uni: ($("[data-m=uni]", box) || {}).value || "",
        institution: ($("[data-m=institution]", box) || {}).value || "",
        institution_other: ($("[data-m=institution_other]", box) || {}).value || "",
        profile: ($("input[data-m=profile]:checked", box) || {}).value || "",
        study_level: ($("input[data-m=study_level]:checked", box) || {}).value || "",
        training_title: ($("[data-m=training]", box) || {}).value || "",
        startup_name: ($("[data-m=startup_name]", box) || {}).value || "",
      };
    });
  }

  function memberOptions(group, current) {
    const list = group === "uca" ? UCA : group === "other" ? OTHER : [];
    const opts = [`<option value="">${esc(SIC.t("form.choose"))}</option>`]
      .concat(list.map((name) => `<option value="${esc(name)}"${name === current ? " selected" : ""}>${esc(name)}</option>`))
      .concat([`<option value="${AUTRE_INST}"${isAutreInstitution(current) ? " selected" : ""}>${esc(SIC.t("f.uni.autre"))}</option>`]);
    return { list, html: opts.join("") };
  }

  function memberInstitutionLabel(m) {
    if (isAutreInstitution(m.institution)) return (m.institution_other || "").trim();
    return (m.institution || "").trim();
  }

  function renderMembers() {
    if (!els.teamSize || !els.members) return;
    const size = Number(els.teamSize.value);
    const count = Math.max(0, size - 1);
    members = members.slice(0, count);
    while (members.length < count) {
      members.push({ name: "", uni: "", institution: "", institution_other: "", profile: "", study_level: "", training_title: "", startup_name: "" });
    }
    els.members.innerHTML = members
      .map((m, i) => {
        const academic = m.profile === "student" || m.profile === "researcher";
        const student = m.profile === "student";
        const startup = m.profile === "startup";
        const showSelect = academic && (m.uni === "uca" || m.uni === "other");
        const showOther = showSelect && isAutreInstitution(m.institution);
        const built = memberOptions(m.uni, m.institution);
        const pill = (value, label) => `<label class="pill"><input type="radio" data-m="profile" name="mprofile${i}" value="${value}" ${m.profile === value ? "checked" : ""}><span>${esc(label)}</span></label>`;
        const level = (value, label) => `<label class="pill"><input type="radio" data-m="study_level" name="mlevel${i}" value="${value}" ${m.study_level === value ? "checked" : ""}><span>${esc(label)}</span></label>`;
        return `<div class="member">
          <p class="member__title"><i class="fa-regular fa-user" aria-hidden="true"></i> ${esc(SIC.t("f.member"))} ${i + 2}</p>
          <div class="grid-2">
            <div class="field field--full"><label>${esc(SIC.t("f.member_name"))} *</label><input data-m="name" value="${esc(m.name)}" maxlength="120" required></div>
            <div class="field field--full">
              <label>${esc(SIC.t("f.profile"))} *</label>
              <div class="pills">
                ${pill("student", SIC.t("f.profile.student"))}
                ${pill("researcher", SIC.t("f.profile.researcher"))}
                ${pill("startup", SIC.t("f.profile.startup"))}
              </div>
            </div>
          </div>
          <div class="conditional ${academic ? "is-shown" : ""}" data-member-academic>
            <div class="grid-2">
              <div class="field">
                <label>${esc(SIC.t("f.establishment"))} *</label>
                <select data-m="uni" ${academic ? "required" : ""}>
                  <option value="">${esc(SIC.t("form.choose"))}</option>
                  <option value="uca"${m.uni === "uca" ? " selected" : ""}>${esc(SIC.t("f.uni.uca"))}</option>
                  <option value="other"${m.uni === "other" ? " selected" : ""}>${esc(SIC.t("f.uni.other"))}</option>
                </select>
              </div>
              <div class="field"${showSelect ? "" : " hidden"}>
                <label>${esc(SIC.t("f.establishment_name"))} *</label>
                <select data-m="institution" ${showSelect ? "required" : ""} ${built.list.length || showSelect ? "" : "disabled"}>${built.html}</select>
              </div>
              <div class="field field--full"${showOther ? "" : " hidden"}>
                <label>${esc(SIC.t("f.establishment_other"))} *</label>
                <input data-m="institution_other" value="${esc(m.institution_other || "")}" maxlength="200" placeholder="${esc(SIC.t("f.establishment_other.ph"))}" ${showOther ? "required" : ""}>
              </div>
            </div>
          </div>
          <div class="conditional ${student ? "is-shown" : ""}" data-member-student>
            <div class="field">
              <label>${esc(SIC.t("f.study_level"))} *</label>
              <div class="pills">
                ${level("licence", SIC.t("f.level.licence"))}
                ${level("master", SIC.t("f.level.master"))}
                ${level("doctorate", SIC.t("f.level.doctorate"))}
                ${level("engineer", SIC.t("f.level.engineer"))}
              </div>
            </div>
            <div class="field"><label>${esc(SIC.t("f.training"))} *</label><input data-m="training" value="${esc(m.training_title || "")}" maxlength="160" ${student ? "required" : ""}></div>
          </div>
          <div class="conditional ${startup ? "is-shown" : ""}" data-member-startup>
            <div class="field field--full">
              <label>${esc(SIC.t("f.startup_name"))} *</label>
              <input data-m="startup_name" value="${esc(m.startup_name || "")}" maxlength="150" placeholder="${esc(SIC.t("f.startup_name.ph"))}" ${startup ? "required" : ""}>
            </div>
          </div>
        </div>`;
      })
      .join("");
    els.solo.hidden = count > 0;
  }

  /* ------------------------------------------------------------------ */
  /* Fichier                                                             */
  /* ------------------------------------------------------------------ */
  function formatSize(bytes) {
    return bytes > 1048576 ? `${(bytes / 1048576).toFixed(1)} Mo` : `${Math.round(bytes / 1024)} Ko`;
  }

  function setFile(f) {
    if (!els.drop || !els.fileInput) {
      file = f || null;
      return;
    }
    const field = els.drop.closest(".field");
    clearError(field);
    if (!f) {
      file = null;
      els.fileInput.value = "";
      $(".dropzone__empty", els.drop).hidden = false;
      $(".dropzone__file", els.drop).hidden = true;
      return;
    }
    const ext = f.name.slice(f.name.lastIndexOf(".")).toLowerCase();
    const maxMb = SIC.config.maxFileMb || 5;
    if (!ALLOWED.includes(ext)) return setError(field, SIC.t("err.file_type"));
    if (f.size > maxMb * 1048576) return setError(field, SIC.t("err.file_size", { mb: maxMb }));
    file = f;
    $("#fileName").textContent = f.name;
    $("#fileSize").textContent = formatSize(f.size);
    $(".dropzone__empty", els.drop).hidden = true;
    $(".dropzone__file", els.drop).hidden = false;
  }

  function initDropzone() {
    if (!els.drop || !els.fileInput) return;
    const dz = els.drop;
    els.fileInput.addEventListener("change", () => setFile(els.fileInput.files[0]));
    ["dragenter", "dragover"].forEach((t) =>
      dz.addEventListener(t, (e) => {
        e.preventDefault();
        dz.classList.add("is-drag");
      })
    );
    ["dragleave", "drop"].forEach((t) =>
      dz.addEventListener(t, (e) => {
        e.preventDefault();
        dz.classList.remove("is-drag");
      })
    );
    dz.addEventListener("drop", (e) => setFile(e.dataTransfer.files[0]));
    dz.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        els.fileInput.click();
      }
    });
    $("#fileRemove").addEventListener("click", (e) => {
      e.stopPropagation();
      setFile(null);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Validation                                                          */
  /* ------------------------------------------------------------------ */
  function setError(field, msg) {
    if (!field) return;
    field.classList.add("has-error");
    let m = $(".field__error", field);
    if (!m) {
      m = document.createElement("p");
      m.className = "field__error";
      field.appendChild(m);
    }
    m.textContent = msg;
  }

  function clearError(field) {
    if (!field) return;
    field.classList.remove("has-error");
    const m = $(".field__error", field);
    if (m) m.remove();
  }

  function wordCount(v) {
    const t = String(v || "").trim();
    return t ? t.split(/\s+/).length : 0;
  }

  function validateInput(input) {
    const field = input.closest(".field") || input.closest(".check");
    const v = input.value.trim();
    if (input.type === "checkbox") {
      if (input.required && !input.checked) return setError(field, SIC.t("err.required")), false;
      clearError(field);
      return true;
    }
    if (input.required && !v) return setError(field, SIC.t("err.required")), false;
    if (v) {
      if (input.type === "email" && !EMAIL_RE.test(v)) return setError(field, SIC.t("err.email")), false;
      if (input.type === "tel" && !PHONE_RE.test(v)) return setError(field, SIC.t("err.phone")), false;
      if (input.type === "url" && !/^https?:\/\/\S+\.\S+/.test(v)) return setError(field, SIC.t("err.url")), false;
      if (input.minLength > 0 && v.length < input.minLength) return setError(field, SIC.t("err.min", { n: input.minLength })), false;
      if (input.dataset.words && wordCount(v) > Number(input.dataset.words)) return setError(field, SIC.t("err.words", { n: input.dataset.words })), false;
    }
    clearError(field);
    return true;
  }

  function validateStep(n) {
    const box = els.steps[n - 1];
    let ok = true;
    $$("input, select, textarea", box).forEach((input) => {
      if (input.type === "radio" || input.name === "territories" || input.name === "needs" || input.type === "file") return;
      if (input.disabled || input.closest("[hidden]")) return;
      if (input.closest(".conditional") && !input.closest(".conditional").classList.contains("is-shown")) return;
      if (input.closest(".hp")) return;
      if (!validateInput(input)) ok = false;
    });
    if (n === 1 && !selectedValue("profile")) {
      setError($("#profileField"), SIC.t("err.required"));
      ok = false;
    } else if (n === 1) clearError($("#profileField"));
    if (n === 1 && selectedValue("profile") === "student" && !selectedValue("study_level")) {
      const studyField = $("#studentBox .field");
      setError(studyField, SIC.t("err.required"));
      ok = false;
    }
    if (n === 3) {
      $$(".member", box).forEach((member) => {
        const profile = $("input[data-m=profile]:checked", member);
        const field = $(".pills", member).closest(".field");
        if (!profile) {
          setError(field, SIC.t("err.required"));
          ok = false;
        } else clearError(field);
        if (profile && profile.value === "student" && !$("input[data-m=study_level]:checked", member)) {
          setError($("[data-member-student] .field", member), SIC.t("err.required"));
          ok = false;
        }
      });
    }
    if (n === 2) {
      ["track", "challenge"].forEach((name) => {
        const field = $(`#${name}Choices`).closest(".field");
        if (!selectedValue(name)) {
          setError(field, SIC.t("err.required"));
          ok = false;
        } else clearError(field);
      });
    }
    if (!ok) {
      showAlert(SIC.t("err.check"));
      const first = $(".has-error", box);
      if (first) first.scrollIntoView({ behavior: "smooth", block: "center" });
    } else hideAlert();
    return ok;
  }

  function showAlert(msg, kind = "") {
    els.alert.hidden = false;
    els.alert.className = `form-alert ${kind}`;
    els.alert.textContent = msg;
  }
  function hideAlert() {
    els.alert.hidden = true;
  }

  /* ------------------------------------------------------------------ */
  /* Navigation entre étapes                                             */
  /* ------------------------------------------------------------------ */
  function goTo(n, scroll = true) {
    step = Math.max(1, Math.min(TOTAL, n));
    els.steps.forEach((s, i) => s.classList.toggle("is-active", i === step - 1));
    els.stepper.forEach((li, i) => {
      li.classList.toggle("is-active", i === step - 1);
      li.classList.toggle("is-done", i < step - 1);
    });
    els.bar.style.width = `${(step / TOTAL) * 100}%`;
    const last = step === TOTAL;
    els.prev.hidden = step === 1;
    els.next.hidden = last;
    els.submit.hidden = !last;
    els.prev.style.display = step === 1 ? "none" : "";
    els.next.style.display = last ? "none" : "";
    els.submit.style.display = last ? "" : "none";
    els.stepOf.textContent = SIC.t("form.stepof", { n: step });
    if (last) renderRecap();
    if (scroll) $("#formCard").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function leaderInstitution() {
    const inst = ($("#institution") || {}).value || "";
    if (isAutreInstitution(inst)) return ($("#institution_other") || {}).value || "";
    return inst;
  }

  function renderRecap() {
    const d = SIC.dict();
    const track = d.tracks.find((t) => t.key === selectedValue("track"));
    const ch = d.challenges.find((c) => String(c.n) === selectedValue("challenge"));
    const profile = selectedValue("profile");
    const rows = [
      [SIC.t("f.full_name"), $("#full_name").value],
      [SIC.t("f.email"), $("#email").value],
      [SIC.t("f.profile"), SIC.t(`f.profile.${profile}`) || profile],
      [SIC.t("f.city"), $("#city").value],
    ];
    if (profile === "student" || profile === "researcher") {
      rows.push([SIC.t("f.establishment"), leaderInstitution()]);
    }
    if (profile === "startup") {
      rows.push([SIC.t("f.startup_name"), ($("#startup_name") || {}).value || ""]);
    }
    rows.push(
      [SIC.t("f.title"), $("#title").value],
      [SIC.t("f.track"), track ? `${track.key.toUpperCase()} · ${track.tagline}` : ""],
      [SIC.t("f.challenge"), ch ? `${ch.n}. ${ch.title}` : ""],
      [SIC.t("f.team_size"), $("#team_size").value]
    );
    $("#recap").innerHTML = `<h4><i class="fa-solid fa-list-check" aria-hidden="true"></i> ${esc(SIC.t("form.recap"))}</h4>
      <dl>${rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v || "-")}</dd></div>`).join("")}</dl>`;
  }

  /* ------------------------------------------------------------------ */
  /* Brouillon local                                                     */
  /* ------------------------------------------------------------------ */
  function collect() {
    syncMembersFromDom();
    const data = {};
    $$("input, select, textarea", form).forEach((el) => {
      if (!el.name || el.type === "file" || el.closest(".hp")) return;
      if (el.type === "checkbox") {
        if (el.name === "territories" || el.name === "needs") {
          data[el.name] = data[el.name] || [];
          if (el.checked) data[el.name].push(el.value);
        } else data[el.name] = el.checked;
      } else if (el.type === "radio") {
        if (el.checked) data[el.name] = el.value;
      } else data[el.name] = el.value;
    });
    data.members = members.filter((m) => m.name.trim());
    return data;
  }

  function saveDraft() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const data = collect();
      data._step = step;
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
      els.draft.textContent = `✓ ${SIC.t("form.draft.saved")}`;
    }, 500);
  }

  function restoreDraft() {
    let data;
    try {
      data = JSON.parse(localStorage.getItem(DRAFT_KEY));
    } catch {
      data = null;
    }
    if (!data) return false;
    $$("input, select, textarea", form).forEach((el) => {
      if (!el.name || el.type === "file" || !(el.name in data)) return;
      if (el.type === "checkbox") {
        el.checked = Array.isArray(data[el.name]) ? data[el.name].includes(el.value) : Boolean(data[el.name]);
      } else if (el.type === "radio") {
        el.checked = data[el.name] === el.value;
      } else el.value = data[el.name];
    });
    members = Array.isArray(data.members) ? data.members : [];
    pendingRadios = { track: data.track, challenge: data.challenge };
    els.draft.textContent = `✓ ${SIC.t("form.draft.restored")}`;
    return true;
  }

  let pendingRadios = null;
  function applyPendingRadios() {
    if (!pendingRadios) return;
    for (const [name, value] of Object.entries(pendingRadios)) {
      const r = form.querySelector(`input[name="${name}"][value="${value}"]`);
      if (r) r.checked = true;
    }
    pendingRadios = null;
    updateConditional();
  }

  /* ------------------------------------------------------------------ */
  /* Envoi                                                               */
  /* ------------------------------------------------------------------ */
  function buildFormData() {
    const data = collect();
    const fd = new FormData();
    for (const [k, v] of Object.entries(data)) {
      if (k === "members" || k === "territories" || k === "needs") fd.append(k, JSON.stringify(v));
      else if (typeof v === "boolean") fd.append(k, String(v));
      else if (k === "trl" && data.track !== "lab") continue;
      else fd.append(k, v);
    }
    fd.append("website_hp", $('input[name="website_hp"]', form).value);
    fd.append("lang", SIC.lang);
    const parts = ($("#full_name").value || "").trim().split(/\s+/);
    fd.set("first_name", parts[0] || "");
    fd.set("last_name", parts.slice(1).join(" ") || parts[0] || "");
    const inst = leaderInstitution().trim();
    if (inst) fd.set("institution", inst);
    else fd.delete("institution");
    const membersPayload = (data.members || []).map((m) => ({
      name: m.name,
      profile: m.profile,
      study_level: m.study_level,
      training_title: m.training_title,
      institution: memberInstitutionLabel(m),
      startup_name: m.startup_name || "",
    }));
    fd.set("members", JSON.stringify(membersPayload));
    if (file) fd.append("project_file", file, file.name);
    return fd;
  }

  function send(fd, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/register");
      xhr.upload.addEventListener("progress", (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100)));
      xhr.onload = () => {
        let body = {};
        try {
          body = JSON.parse(xhr.responseText);
        } catch {
          /* réponse non JSON */
        }
        resolve({ status: xhr.status, body });
      };
      xhr.onerror = () => reject(new Error("network"));
      xhr.send(fd);
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    for (let n = 1; n <= TOTAL; n++) {
      if (!validateStep(n)) {
        if (n !== step) goTo(n);
        return;
      }
    }
    const label = $("span", els.submit);
    els.submit.disabled = true;
    els.prev.disabled = true;
    label.textContent = SIC.t("form.sending");
    try {
      const { status, body } = await send(buildFormData(), (p) => (label.textContent = `${SIC.t("form.sending")} ${p}%`));
      if (body.ok) return onSuccess(body.ref);
      if (status === 422 && body.fields) {
        let firstStep = TOTAL;
        for (const key of Object.keys(body.fields)) {
          const s = FIELD_STEP[key] || (key.startsWith("member_") ? 2 : TOTAL);
          firstStep = Math.min(firstStep, s);
          const input = form.querySelector(`[name="${key}"]`) || $(`#${key}Choices`);
          if (input) setError(input.closest(".field") || input.closest(".check"), SIC.t("err.required"));
        }
        goTo(firstStep);
        showAlert(SIC.t("err.check"));
        return;
      }
      const map = { rate_limited: "err.rate_limited", duplicate: "err.duplicate", closed: "err.closed", file_too_large: "err.file_size", bad_file_type: "err.file_type" };
      showAlert(SIC.t(map[body.error] || "err.server", { ref: body.ref, mb: SIC.config.maxFileMb }));
    } catch {
      showAlert(SIC.t("err.network"));
    } finally {
      els.submit.disabled = false;
      els.prev.disabled = false;
      label.textContent = SIC.t("form.submit");
    }
  }

  function onSuccess(ref) {
    localStorage.removeItem(DRAFT_KEY);
    renderRecap();
    $("#refCode").textContent = ref;
    const success = $("#formSuccess");
    const recap = $("#recap").cloneNode(true);
    recap.id = "";
    recap.classList.add("recap--print");
    $(".recap--print", success)?.remove();
    const next = $(".muted", success);
    if (next) success.insertBefore(recap, next);
    else success.appendChild(recap);
    form.hidden = true;
    success.hidden = false;
    $("#formCard").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetForm() {
    localStorage.removeItem(DRAFT_KEY);
    form.reset();
    members = [];
    setFile(null);
    if (els.teamSize) els.teamSize.value = 1;
    renderMembers();
    renderChoices();
    fillEstablishments();
    $$(".has-error", form).forEach(clearError);
    hideAlert();
    els.draft.textContent = "";
    if (els.trlOut && els.trl) els.trlOut.textContent = els.trl.value;
    goTo(1, false);
  }

  /* ------------------------------------------------------------------ */
  /* Compteurs de caractères                                             */
  /* ------------------------------------------------------------------ */
  function initCounters() {
    $$("textarea[data-words]", form).forEach((ta) => {
      const c = document.createElement("span");
      c.className = "counter";
      ta.after(c);
      const upd = () => {
        const n = wordCount(ta.value);
        const max = Number(ta.dataset.words);
        c.textContent = `${n} / ${max} ${SIC.t("f.words")}`;
        c.classList.toggle("is-low", n > max);
      };
      ta.addEventListener("input", upd);
      upd();
      ta._updateCounter = upd;
    });
  }

  /* ------------------------------------------------------------------ */
  /* Initialisation                                                      */
  /* ------------------------------------------------------------------ */
  els.next.addEventListener("click", () => {
    if (step === TOTAL) {
      form.requestSubmit ? form.requestSubmit() : els.submit.click();
      return;
    }
    if (validateStep(step)) goTo(step + 1);
  });
  els.prev.addEventListener("click", () => goTo(step - 1));
  form.addEventListener("submit", onSubmit);
  form.addEventListener("input", (e) => {
    if (e.target.closest(".has-error")) validateInput(e.target);
    saveDraft();
  });
  form.addEventListener("change", (e) => {
    if (e.target.name === "profile" || e.target.name === "uni_group" || e.target.name === "institution") updateConditional();
    if (e.target.name === "track" || e.target.name === "challenge") clearError(e.target.closest(".field"));
    if (e.target.name === "territories") {
      clearError($("#territoriesField"));
      if (e.target.value === "all" && e.target.checked) {
        $$('input[name="territories"]', form).forEach((c) => c.value !== "all" && (c.checked = false));
      } else if (e.target.checked) {
        $('input[name="territories"][value="all"]', form).checked = false;
      }
    }
    saveDraft();
  });

  $$("[data-team]", form).forEach((b) =>
    b.addEventListener("click", () => {
      syncMembersFromDom();
      els.teamSize.value = Math.max(1, Math.min(5, Number(els.teamSize.value) + Number(b.dataset.team)));
      renderMembers();
      saveDraft();
    })
  );
  if (els.members) {
    els.members.addEventListener("change", (e) => {
      const box = e.target.closest(".member");
      if (!box) return;
      if (e.target.dataset.m === "profile" || e.target.dataset.m === "uni" || e.target.dataset.m === "institution") {
        syncMembersFromDom();
        renderMembers();
        saveDraft();
        return;
      }
      syncMembersFromDom();
    });
  }
  if (els.trl) els.trl.addEventListener("input", () => (els.trlOut.textContent = els.trl.value));

  $("#resetDraft").addEventListener("click", resetForm);
  $("#copyRef").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText($("#refCode").textContent);
      $("#copyRef span").textContent = SIC.t("success.copied");
      setTimeout(() => ($("#copyRef span").textContent = SIC.t("success.copy")), 1800);
    } catch {
      /* presse-papiers indisponible */
    }
  });

  document.addEventListener("sic:preselect", (e) => {
    const { challenge, track } = e.detail;
    if (challenge) {
      const r = form.querySelector(`input[name="challenge"][value="${challenge}"]`);
      if (r) r.checked = true;
    }
    if (track) {
      const r = form.querySelector(`input[name="track"][value="${track}"]`);
      if (r) r.checked = true;
    }
    updateConditional();
    saveDraft();
  });

  document.addEventListener("sic:config", (e) => {
    const cfg = e.detail;
    const hint = $("#fileHint");
    if (hint) hint.textContent = SIC.t("file.hint", { mb: cfg.maxFileMb });
    if (!cfg.registrationOpen) {
      form.hidden = true;
      $("#formClosed").hidden = false;
    }
  });

  document.addEventListener("sic:lang", () => {
    syncMembersFromDom();
    renderChoices();
    applyPendingRadios();
    renderMembers();
    const hint = $("#fileHint");
    if (hint) hint.textContent = SIC.t("file.hint", { mb: SIC.config.maxFileMb });
    els.stepOf.textContent = SIC.t("form.stepof", { n: step });
    if (step === TOTAL) renderRecap();
    $$(".has-error", form).forEach(clearError);
  });

  initDropzone();
  initCounters();
  const restored = restoreDraft();
  if (restored) $$("textarea[data-counter]", form).forEach((ta) => ta._updateCounter && ta._updateCounter());
  if (els.trlOut && els.trl) els.trlOut.textContent = els.trl.value;
  const UCA = [
    "Faculté des Sciences Semlalia, Marrakech",
    "Faculté d'Économie et de Gestion, Marrakech",
    "Faculté des Sciences Juridiques et Politiques, Marrakech",
    "Faculté des Lettres et des Sciences Humaines, Marrakech",
    "École Nationale de Commerce et de Gestion, Marrakech",
    "Faculté de Médecine et de Pharmacie, Marrakech",
    "Faculté des Sciences et Techniques, Marrakech",
    "École Nationale des Sciences Appliquées, Marrakech",
    "École Normale Supérieure, Marrakech",
    "Faculté de Langue Arabe, Marrakech",
    "Faculté des Sciences Appliquées, Safi",
    "Faculté des Sciences Humaines et Sociales, Safi",
    "Faculté des Langues, Lettres et Arts, Safi",
    "Faculté d'Économie et de Gestion, Safi",
    "Faculté des Sciences Juridiques et Politiques, Safi",
    "École Nationale des Sciences Appliquées, Safi",
    "École Supérieure de Technologie, Safi",
    "École Supérieure de Technologie, Essaouira",
    "Faculté des Sciences Juridiques et Politiques, El Kelaâ des Sraghna",
    "Faculté d'Économie et de Gestion, El Kelaâ des Sraghna",
    "École Supérieure de Technologie, El Kelaâ des Sraghna",
  ];
  const OTHER = [
    "Université Ibn Zohr",
    "Université Sultan Moulay Slimane",
    "Université Hassan II",
    "Université Chouaïb Doukkali",
    "Université Sidi Mohamed Ben Abdellah",
    "Université Ibn Tofail",
    "Université Moulay Ismail",
    "Université Mohammed Ier",
    "Université Mohammed V",
    "Université Hassan Ier",
    "Université Abdelmalek Essaâdi",
    "Université Internationale de Rabat (UIR)",
    "Université Mohammed VI Polytechnique (UM6P), Ben Guerir",
    "Université Internationale de Casablanca (UIC)",
    "Université Mohammed VI des Sciences de Santé (UM6SS), Casablanca",
    "Université Privée de Marrakech (UPM)",
    "Université Internationale d'Agadir (Universiapolis)",
    "Université Euro-méditerranéenne de Fès (UEMF)",
    "Université Privée de Fès (UPF)",
    "Université Mundiapolis, Casablanca",
    "ISGA (Institut Supérieur d'Ingénierie et des Affaires)",
    "EMSI (École Marocaine des Sciences de l'Ingénieur)",
    "École Polytechnique d'Agadir, Universiapolis",
    "ECINE, UIR",
    "EIGSICA",
    "ESGB, UM6SS",
    "École d'Ingénieurs Abulcasis",
    "SUP'MANAGEMENT",
    "SAAE, UIR",
    "Mundiapolis, École d'ingénierie",
    "E2IM, UPM",
    "EMG Rabat",
    "ESCA École de Management",
    "HEM (Institut des Hautes Études de Management)",
    "Rabat Business School, UIR",
    "ISGA Management",
    "SUPMTI",
    "SUP'RH",
    "Fès Business School, UPF",
    "Mundiapolis, Business School",
    "Sup de Co Marrakech",
  ];
  function fillEstablishments() {
    const group = $("#uni_group");
    const select = $("#institution");
    if (!group || !select) return;
    const current = select.value;
    const list = group.value === "uca" ? UCA : group.value === "other" ? OTHER : [];
    select.disabled = !list.length;
    select.innerHTML =
      `<option value="">${esc(SIC.t("form.choose"))}</option>` +
      list.map((name) => `<option value="${esc(name)}">${esc(name)}</option>`).join("") +
      (list.length ? `<option value="${AUTRE_INST}">${esc(SIC.t("f.uni.autre"))}</option>` : "");
    if (list.includes(current) || isAutreInstitution(current)) select.value = isAutreInstitution(current) ? AUTRE_INST : current;
    updateConditional();
  }
  $("#uni_group").addEventListener("change", () => {
    $("#institution").value = "";
    if ($("#institution_other")) $("#institution_other").value = "";
    fillEstablishments();
  });
  $("#institution").addEventListener("change", updateConditional);
  document.addEventListener("sic:lang", fillEstablishments);
  fillEstablishments();
  renderMembers();
  if (restored) {
    try {
      const saved = JSON.parse(localStorage.getItem(DRAFT_KEY));
      if (saved) {
        if (saved.uni_group === "autre") {
          $("#uni_group").value = "other";
          fillEstablishments();
          $("#institution").value = AUTRE_INST;
          if ($("#institution_other")) $("#institution_other").value = saved.institution_other || saved.institution || "";
        } else {
          if (saved.institution) $("#institution").value = saved.institution;
          if (saved.institution_other && $("#institution_other")) $("#institution_other").value = saved.institution_other;
        }
        updateConditional();
      }
    } catch { /* brouillon illisible */ }
  }
  goTo(1, false);
})();
