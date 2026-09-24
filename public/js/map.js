(() => {
  "use strict";

  const MAP = window.MOROCCO_MAP;
  const SIC = window.SIC;
  const holder = document.getElementById("mapCanvas");
  const tooltip = document.getElementById("mapTooltip");
  if (!MAP || !holder) return;

  const NS = "http://www.w3.org/2000/svg";
  const LABEL_RIGHT = new Set(["fes", "marrakech", "smara", "guelmim"]);

  function el(name, attrs = {}, parent) {
    const node = document.createElementNS(NS, name);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    if (parent) parent.appendChild(node);
    return node;
  }

  function build() {
    holder.innerHTML = "";
    const d = SIC.dict();
    const svg = el("svg", {
      viewBox: `-190 -10 ${MAP.width + 210} ${MAP.height + 20}`,
      class: "map__svg",
      role: "img",
      "aria-label": SIC.t("territory.title"),
    });

    const defs = el("defs", {}, svg);
    const grad = el("linearGradient", { id: "goldGrad", gradientUnits: "userSpaceOnUse", x1: "0", y1: "0", x2: "0", y2: MAP.height }, defs);
    el("stop", { offset: "0", "stop-color": "#FFE3A0" }, grad);
    el("stop", { offset: ".45", "stop-color": "#F4C95D" }, grad);
    el("stop", { offset: "1", "stop-color": "#D98A45" }, grad);
    const glow = el("filter", { id: "mapGlow", x: "-20%", y: "-20%", width: "140%", height: "140%" }, defs);
    el("feGaussianBlur", { stdDeviation: "10", result: "b" }, glow);
    const merge = el("feMerge", {}, glow);
    el("feMergeNode", { in: "b" }, merge);
    el("feMergeNode", { in: "SourceGraphic" }, merge);
    // Halo du contour national
    const halo = el("g", { class: "map__halo", filter: "url(#mapGlow)" }, svg);
    MAP.regions.forEach((r) => el("path", { d: r.d }, halo));

    // Régions
    const regions = el("g", { class: "map__regions" }, svg);
    MAP.regions.forEach((r) => {
      const name = d.regions[r.id];
      const p = el("path", {
        d: r.d,
        class: `region${r.south ? " region--south" : ""}`,
        tabindex: "0",
        "data-id": r.id,
        "aria-label": name,
      }, regions);
      const show = (evt) => showTip(evt, name);
      p.addEventListener("mousemove", show);
      p.addEventListener("focus", show);
      p.addEventListener("click", show);
      p.addEventListener("mouseleave", hideTip);
      p.addEventListener("blur", hideTip);
    });

    // Villes
    const cities = el("g", { class: "map__cities" }, svg);
    MAP.cities.forEach((c) => {
      const g = el("g", { class: `city city--${c.kind}`, transform: `translate(${c.x} ${c.y})` }, cities);
      if (c.kind === "host") {
        el("circle", { r: 26, class: "city__pulse" }, g);
        el("path", { d: "M0,-15L4.4,-4.6L15,-4.6L6.5,2L9.5,13L0,6.5L-9.5,13L-6.5,2L-15,-4.6L-4.4,-4.6Z", class: "city__star" }, g);
      } else {
        if (c.kind === "south") el("circle", { r: 14, class: "city__pulse city__pulse--south" }, g);
        el("circle", { r: c.kind === "capital" ? 7 : 5.5, class: "city__dot" }, g);
      }
      const right = LABEL_RIGHT.has(c.id);
      const label = el("text", {
        x: right ? 16 : -16,
        y: 7,
        "text-anchor": right ? "start" : "end",
        class: "city__label",
      }, g);
      label.textContent = d.cities[c.id];
    });

    holder.appendChild(svg);
  }

  function showTip(evt, name) {
    const box = holder.getBoundingClientRect();
    let x;
    let y;
    if (evt.clientX) {
      x = evt.clientX - box.left;
      y = evt.clientY - box.top;
    } else {
      const r = evt.target.getBoundingClientRect();
      x = r.left + r.width / 2 - box.left;
      y = r.top + r.height / 2 - box.top;
    }
    tooltip.innerHTML = `<strong>${SIC.esc(name)}</strong>`;
    tooltip.style.left = `${Math.max(80, Math.min(box.width - 80, x))}px`;
    tooltip.style.top = `${y}px`;
    tooltip.classList.add("is-visible");
    holder.querySelectorAll(".region.is-hover").forEach((p) => p.classList.remove("is-hover"));
    evt.target.classList.add("is-hover");
  }

  function hideTip(evt) {
    tooltip.classList.remove("is-visible");
    evt.target.classList.remove("is-hover");
  }

  document.addEventListener("sic:lang", build);
})();
