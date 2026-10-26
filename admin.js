// ===== Settings: change these if your repo differs =====
var OWNER  = "victorreyesgit";
var REPO   = "victorreyesgit.github.io";
var BRANCH = "main";
var FILE   = "projects.js";
// =======================================================

var KEY = "projectsHubToken";
var API = "https://api.github.com/repos/" + OWNER + "/" + REPO + "/contents/" + FILE;
var data = null, sha = null, prefix = "", dirty = false;
var $ = function (id) { return document.getElementById(id); };

function say(msg, kind) { var s = $("status"); s.textContent = msg; s.className = kind || ""; }
function token() { try { return localStorage.getItem(KEY) || ""; } catch (e) { return ""; } }
function hdr(json) {
  var h = { "Authorization": "Bearer " + token(), "Accept": "application/vnd.github+json" };
  if (json) h["Content-Type"] = "application/json";
  return h;
}
function dec(b64) {
  var bin = atob(b64), u = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(u);
}
function enc(str) {
  var u = new TextEncoder().encode(str), bin = "";
  for (var i = 0; i < u.length; i++) bin += String.fromCharCode(u[i]);
  return btoa(bin);
}
async function explain(r) {
  var m = ""; try { m = (await r.json()).message || ""; } catch (e) {}
  if (r.status === 401) return "GitHub rejected the token (401). It may be expired or mistyped. Forget it and paste a new one.";
  if (r.status === 403) return "Access denied (403). Check the token has Contents: Read and write. " + m;
  if (r.status === 404) return "Not found (404). Check OWNER/REPO/BRANCH/FILE at the top of admin.js, and that the token can access this repo.";
  return "GitHub error " + r.status + ". " + m;
}

function showToken() {
  var has = !!token();
  $("tokenNew").hidden = has; $("tokenHave").hidden = !has;
}

async function load() {
  if (!token()) return say("Paste a token first.", "err");
  say("Loading from GitHub…");
  try {
    var r = await fetch(API + "?ref=" + encodeURIComponent(BRANCH), { headers: hdr(), cache: "no-store" });
    if (!r.ok) throw new Error(await explain(r));
    var j = await r.json();
    var txt = dec(j.content);
    var m = /^window\.PROJECTS\s*=/m.exec(txt);
    if (!m) throw new Error("Could not find 'window.PROJECTS =' at the start of a line in " + FILE + ".");
    var a = txt.indexOf("{", m.index), b = txt.lastIndexOf("}");
    var parsed;
    try { parsed = JSON.parse(txt.slice(a, b + 1)); }
    catch (e) { throw new Error(FILE + " is not valid JSON (check quotes and trailing commas). Fix it on github.com, then reload. " + e.message); }
    parsed.sections = parsed.sections || [];
    parsed.sections.forEach(function (s) { s.projects = s.projects || []; });
    data = parsed; sha = j.sha; prefix = txt.slice(0, m.index);
    setDirty(false); render(); $("saveBar").hidden = false;
    say("Loaded " + FILE + " from " + REPO + " (" + BRANCH + ").", "ok");
  } catch (e) { say(e.message || String(e), "err"); }
}

function clean() {
  var out = { sections: data.sections.map(function (s) {
    return { id: s.id, title: s.title, description: s.description || "",
      projects: s.projects.map(function (p) {
        var o = { title: p.title, description: p.description || "", url: p.url || "" };
        if (p.repo) o.repo = p.repo;
        if (p.tags && p.tags.length) o.tags = p.tags;
        return o;
      }) };
  }) };
  return prefix + "window.PROJECTS = " + JSON.stringify(out, null, 2) + ";\n";
}

async function save() {
  say("Saving…");
  $("save").disabled = true;
  try {
    var r = await fetch(API, { method: "PUT", headers: hdr(true), body: JSON.stringify({
      message: "Update projects via admin page", content: enc(clean()), sha: sha, branch: BRANCH }) });
    if (r.status === 409 || r.status === 422) {
      say("Not saved: " + FILE + " changed on GitHub since you loaded it. Click “Reload from GitHub” and redo your edit. (Your unsaved edits would be overwritten otherwise.)", "err");
      $("save").disabled = false; return;
    }
    if (!r.ok) throw new Error(await explain(r));
    sha = (await r.json()).content.sha;
    setDirty(false);
    say("Saved. The site updates in about a minute.", "ok");
  } catch (e) { say(e.message || String(e), "err"); $("save").disabled = false; }
}

function setDirty(d) { dirty = d; $("save").disabled = !d; }
window.addEventListener("beforeunload", function (e) { if (dirty) { e.preventDefault(); e.returnValue = ""; } });

// ---------- editor UI ----------
function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }
function btn(text, fn, cls) { var b = el("button", cls, text); b.type = "button"; b.onclick = fn; return b; }
function field(label, value, set, multi) {
  var w = el("div"), l = el("label", "", label), i = el(multi ? "textarea" : "input");
  i.value = value || "";
  i.oninput = function () { set(i.value); setDirty(true); };
  w.append(l, i); return w;
}
function move(arr, i, d) {
  var j = i + d; if (j < 0 || j >= arr.length) return;
  var t = arr[i]; arr[i] = arr[j]; arr[j] = t; setDirty(true); render();
}
function slug(t) {
  var base = (t || "section").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section", id = base, n = 2;
  while (data.sections.some(function (s) { return s.id === id; })) id = base + "-" + n++;
  return id;
}

function render() {
  var box = $("editor"); box.textContent = "";
  data.sections.forEach(function (s, si) {
    var c = el("div", "card");
    c.append(
      field("Section title", s.title, function (v) { s.title = v; }),
      field("Section id (used in page links)", s.id, function (v) { s.id = v.trim(); }),
      field("Section description", s.description, function (v) { s.description = v; }, true));
    var bar = el("div", "bar");
    bar.append(
      btn("↑ Up", function () { move(data.sections, si, -1); }),
      btn("↓ Down", function () { move(data.sections, si, 1); }),
      btn("Delete section", function () {
        if (confirm("Delete section “" + s.title + "” and its " + s.projects.length + " project(s)?")) {
          data.sections.splice(si, 1); setDirty(true); render(); }
      }, "danger"));
    c.append(bar);

    s.projects.forEach(function (p, pi) {
      var pc = el("div", "card");
      pc.append(
        field("Project title", p.title, function (v) { p.title = v; }),
        field("Description", p.description, function (v) { p.description = v; }, true),
        field("Live URL (https://…)", p.url, function (v) { p.url = v.trim(); }),
        field("Source repo URL (optional)", p.repo, function (v) { p.repo = v.trim(); }),
        field("Tags (comma separated, optional)", (p.tags || []).join(", "), function (v) {
          p.tags = v.split(",").map(function (t) { return t.trim(); }).filter(Boolean); }));
      var sel = el("select");
      data.sections.forEach(function (o, oi) {
        var op = el("option", "", o.title || o.id); op.value = oi; if (oi === si) op.selected = true; sel.append(op);
      });
      sel.onchange = function () {
        data.sections[+sel.value].projects.push(s.projects.splice(pi, 1)[0]); setDirty(true); render(); };
      var ml = el("label", "", "Move to section"); 
      var pb = el("div", "bar");
      pb.append(
        btn("↑ Up", function () { move(s.projects, pi, -1); }),
        btn("↓ Down", function () { move(s.projects, pi, 1); }),
        btn("Delete project", function () {
          if (confirm("Delete project “" + p.title + "”?")) { s.projects.splice(pi, 1); setDirty(true); render(); }
        }, "danger"));
      pc.append(ml, sel, pb); c.append(pc);
    });

    c.append(btn("+ Add project", function () {
      s.projects.push({ title: "New project", description: "", url: "", repo: "", tags: [] }); setDirty(true); render();
    }, "primary"));
    box.append(c);
  });
  box.append(btn("+ Add section", function () {
    var t = prompt("Section title?"); if (!t) return;
    data.sections.push({ id: slug(t), title: t, description: "", projects: [] }); setDirty(true); render();
  }, "primary"));
}

$("saveTok").onclick = function () {
  var t = $("tok").value.trim();
  if (!t) return say("Paste a token first.", "err");
  try { localStorage.setItem(KEY, t); } catch (e) { return say("Could not store the token in this browser.", "err"); }
  $("tok").value = ""; showToken(); load();
};
$("forget").onclick = function () {
  try { localStorage.removeItem(KEY); } catch (e) {}
  data = null; $("editor").textContent = ""; $("saveBar").hidden = true; showToken();
  say("Token removed from this device.", "ok");
};
$("reload").onclick = function () {
  if (dirty && !confirm("Discard unsaved edits and reload?")) return; load();
};
$("save").onclick = save;
showToken();
if (token()) load();
