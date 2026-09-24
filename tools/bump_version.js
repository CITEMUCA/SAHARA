/* Ajoute ?v=<horodatage> aux CSS/JS/SVG locaux pour forcer le rechargement après une mise à jour.
   Usage : node tools/bump_version.js */
const fs = require("fs");
const v = Date.now().toString(36);
for (const f of ["public/index.html", "public/admin.html"]) {
  const s = fs.readFileSync(f, "utf8");
  const out = s.replace(/((?:href|src)="\/(?:css|js|assets\/map|assets\/brand)\/[^"?]+\.(?:css|js|svg))(?:\?v=[^"]*)?"/g, `$1?v=${v}"`);
  fs.writeFileSync(f, out);
  console.log(f, "v=" + v);
}
