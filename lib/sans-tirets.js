// Passe progressive anti-motifs IA (10/10/2026) : sur les pages listées dans sans-tirets.json, chaque segment de texte qui
// portait un tiret long est remplacé par sa version retouchée sur le Mac (~/.claude/lib/passe_progressive.py, retouches sûres
// de passe_humaine.py, garde des faits). Rien d'autre ne change : scripts (JSON-LD), attributs et avis cités restent tels
// quels. Un segment qui ne se retrouve plus à l'identique (données rafraîchies) reste inchangé : la tâche du Mac le reprend.
const fs = require('fs'), path = require('path');
module.exports = function sansTirets(out) {
  let t;
  try { t = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'sans-tirets.json'), 'utf8')); } catch (e) { return 0; }
  let n = 0;
  for (const [p, ids] of Object.entries(t.pages || {})) {
    const f = path.join(out, p, 'index.html');
    if (!fs.existsSync(f)) continue;
    const avant = fs.readFileSync(f, 'utf8');
    let h = avant;
    for (const i of ids) { const [a, b] = t.paires[i]; h = h.split(a).join(b); }
    if (h !== avant) { fs.writeFileSync(f, h); n++; }
  }
  return n;
};
