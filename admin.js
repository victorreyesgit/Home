// ===== Settings: change these if your repo differs =====
var OWNER  = "victorreyesgit";
var REPO   = "Home";
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
    parsed.site = parsed.site || { title: "Programming Projects", description: "" };
    parsed.sections = parsed.sections || [];
    parsed.sections.forEach(function (s) { s.projects = s.projects || []; });
    data = parsed; sha = j.sha; prefix = txt.slice(0, m.index);
    setDirty(false); render(); $("saveBar").hidden = false;
    say("Loaded " + FILE + " from " + REPO + " (" + BRANCH + ").", "ok");
  } catch (e) { say(e.message || String(e), "err"); }
}

function clean() {
  var out = { site: { title: data.site.title || "Programming Projects", description: data.site.description || "" },
    sections: data.sections.map(function (s) {
    return { id: s.id, title: s.title, description: s.description || "", visible: s.visible !== false,
      projects: s.projects.map(function (p) {
        var o = { title: p.title, description: p.description || "", url: p.url || "", visible: p.visible !== false };
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

// ---------- editor UI (mirrors the public page; every text is editable in place) ----------
function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }
function btn(text, fn, cls) { var b = el("button", cls, text); b.type = "button"; b.onclick = fn; return b; }
function grow(t) { t.style.height = "auto"; t.style.height = t.scrollHeight + "px"; }
function changed() { setDirty(true); render(); }

// Borderless input/textarea that looks like the text it edits.
function ed(tag, value, set, placeholder, cls) {
  var i = el(tag, "ed" + (cls ? " " + cls : ""));
  if (tag === "input") i.type = "text"; else i.rows = 1;
  i.value = value || ""; i.placeholder = placeholder || ""; i.setAttribute("aria-label", placeholder || "");
  i.oninput = function () { set(i.value); setDirty(true); if (tag === "textarea") grow(i); };
  return i;
}
function line(label, value, set, placeholder) {
  var w = el("div", "fl"); w.append(el("span", "fl-l", label), ed("input", value, set, placeholder)); return w;
}
function move(arr, i, d) {
  var j = i + d; if (j < 0 || j >= arr.length) return;
  var t = arr[i]; arr[i] = arr[j]; arr[j] = t; changed();
}
function slug(t) {
  var base = (t || "section").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section", id = base, n = 2;
  while (data.sections.some(function (s) { return s.id === id; })) id = base + "-" + n++;
  return id;
}

// ---------- drag and drop (mouse; on touch screens use the ↑ ↓ buttons) ----------
var drag = null, target = null;
function clearMarks() {
  document.querySelectorAll(".mark-before, .mark-after, .drop-in").forEach(function (n) {
    n.classList.remove("mark-before", "mark-after", "drop-in");
  });
}
function dragSource(node, handle, info) {
  handle.addEventListener("mousedown", function () { node.draggable = true; });
  node.addEventListener("dragstart", function (e) {
    if (!node.draggable) return;              // ignore drags that did not start on the handle
    e.stopPropagation();
    drag = info; target = null;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", info.type);
    node.classList.add("dragging");
  });
  node.addEventListener("dragend", function () {
    node.draggable = false; node.classList.remove("dragging"); drag = null; target = null; clearMarks();
  });
}
document.addEventListener("mouseup", function () {
  document.querySelectorAll("[draggable=true]").forEach(function (n) { n.draggable = false; });
});
function dropProject() {
  if (!drag || drag.type !== "project" || !target) return;
  var item = data.sections[drag.si].projects.splice(drag.pi, 1)[0];
  var idx = target.index;
  if (target.si === drag.si && idx > drag.pi) idx--;
  data.sections[target.si].projects.splice(idx, 0, item);
  drag = null; target = null; changed();
}
function dropSection() {
  if (!drag || drag.type !== "section" || !target) return;
  var item = data.sections.splice(drag.si, 1)[0];
  var idx = target.index;
  if (idx > drag.si) idx--;
  data.sections.splice(idx, 0, item);
  drag = null; target = null; changed();
}
function isAfter(e, node) {
  var r = node.getBoundingClientRect();
  return e.clientY > r.top + r.height / 2;
}

// ---------- blocks ----------
function headBlock() {
  var w = el("div", "head-ed"), h = el("h1");
  h.append(ed("input", data.site.title, function (v) { data.site.title = v; }, "Site name"));
  w.append(h, ed("textarea", data.site.description, function (v) { data.site.description = v; },
    "Short description under the title", "tagline"));
  return w;
}

function projectBlock(s, si, p, pi) {
  var row = el("article", "project" + (p.visible === false ? " is-hidden" : ""));
  var text = el("div", "text"), h3 = el("h3");
  h3.append(ed("input", p.title, function (v) { p.title = v; }, "Project name"));
  text.append(h3,
    ed("textarea", p.description, function (v) { p.description = v; }, "Short description"),
    ed("input", (p.tags || []).join(", "), function (v) {
      p.tags = v.split(",").map(function (t) { return t.trim(); }).filter(Boolean); },
      "Tags, comma separated (optional)", "ed-tags"),
    line("Open", p.url, function (v) { p.url = v.trim(); }, "Live URL (https://…)"),
    line("Source", p.repo, function (v) { p.repo = v.trim(); }, "Source repo URL (optional)"));

  var tools = el("div", "ptools"), handle = el("span", "handle", "⠿");
  handle.title = "Drag to move (also to another section)";
  var sel = el("select"); sel.setAttribute("aria-label", "Move to section");
  data.sections.forEach(function (o, oi) {
    var op = el("option", "", "→ " + (o.title || o.id)); op.value = oi; if (oi === si) op.selected = true; sel.append(op);
  });
  sel.onchange = function () {
    data.sections[+sel.value].projects.push(s.projects.splice(pi, 1)[0]); changed(); };
  var arrows = el("div", "tools");
  arrows.append(btn("↑", function () { move(s.projects, pi, -1); }, "sm"),
                btn("↓", function () { move(s.projects, pi, 1); }, "sm"));
  tools.append(handle, arrows,
    btn(p.visible === false ? "Show" : "Hide", function () { p.visible = p.visible === false; changed(); }, "sm"),
    sel,
    btn("Delete", function () {
      if (confirm("Delete project “" + p.title + "”?")) { s.projects.splice(pi, 1); changed(); }
    }, "sm danger"));
  row.append(text, tools);

  dragSource(row, handle, { type: "project", si: si, pi: pi });
  row.addEventListener("dragover", function (e) {
    if (!drag || drag.type !== "project") return;
    e.preventDefault(); e.stopPropagation(); clearMarks();
    var after = isAfter(e, row);
    row.classList.add(after ? "mark-after" : "mark-before");
    target = { si: si, index: pi + (after ? 1 : 0) };
  });
  row.addEventListener("drop", function (e) {
    if (!drag || drag.type !== "project") return;
    e.preventDefault(); e.stopPropagation(); dropProject();
  });
  return row;
}

function sectionBlock(s, si) {
  var sec = el("section", "sec c" + (si % 2) + (s.visible === false ? " is-hidden" : ""));

  var bar = el("div", "sec-bar"), handle = el("span", "handle", "⠿"), h2 = el("h2");
  handle.title = "Drag to reorder section";
  h2.append(ed("input", s.title, function (v) { s.title = v; }, "Section name"));
  var tools = el("div", "tools");
  tools.append(
    btn("↑", function () { move(data.sections, si, -1); }, "sm"),
    btn("↓", function () { move(data.sections, si, 1); }, "sm"),
    btn(s.visible === false ? "Show" : "Hide", function () { s.visible = s.visible === false; changed(); }, "sm"),
    btn("Delete", function () {
      if (confirm("Delete section “" + s.title + "” and its " + s.projects.length + " project(s)?")) {
        data.sections.splice(si, 1); changed(); }
    }, "sm danger"));
  bar.append(handle, h2, tools);

  var idrow = el("div", "idrow");
  idrow.append(el("span", "", "id (used in #links):"), ed("input", s.id, function (v) { s.id = v.trim(); }, "section-id"));

  var list = el("div", "plist");
  s.projects.forEach(function (p, pi) { list.append(projectBlock(s, si, p, pi)); });
  if (!s.projects.length) {
    list.classList.add("empty-drop"); list.textContent = "No projects yet. Drop one here or use + Add project.";
    list.addEventListener("dragover", function (e) {
      if (!drag || drag.type !== "project") return;
      e.preventDefault(); e.stopPropagation(); clearMarks();
      list.classList.add("drop-in"); target = { si: si, index: 0 };
    });
    list.addEventListener("drop", function (e) {
      if (!drag || drag.type !== "project") return;
      e.preventDefault(); e.stopPropagation(); dropProject();
    });
  }

  sec.append(bar,
    ed("input", s.description, function (v) { s.description = v; }, "Short description (optional)", "sec-desc"),
    idrow, list,
    btn("+ Add project", function () {
      s.projects.push({ title: "New project", description: "", url: "", repo: "", tags: [] }); changed();
    }, "primary"));

  dragSource(sec, handle, { type: "section", si: si });
  sec.addEventListener("dragover", function (e) {
    if (!drag || drag.type !== "section") return;
    e.preventDefault(); clearMarks();
    var after = isAfter(e, sec);
    sec.classList.add(after ? "mark-after" : "mark-before");
    target = { index: si + (after ? 1 : 0) };
  });
  sec.addEventListener("drop", function (e) {
    if (!drag || drag.type !== "section") return;
    e.preventDefault(); dropSection();
  });
  return sec;
}

function render() {
  var y = window.scrollY, box = $("editor");
  box.textContent = "";
  box.append(headBlock());
  data.sections.forEach(function (s, si) { box.append(sectionBlock(s, si)); });
  var add = btn("+ Add section", function () {
    var t = prompt("Section title?"); if (!t) return;
    data.sections.push({ id: slug(t), title: t, description: "", projects: [] }); changed();
  }, "primary");
  var wrap = el("div", "sec"); wrap.append(add); box.append(wrap);
  box.querySelectorAll("textarea").forEach(grow);
  window.scrollTo(0, y);
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
