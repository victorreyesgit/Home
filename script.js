// Builds the public page from window.PROJECTS (see projects.js).
(function () {
  var data = window.PROJECTS || { sections: [] };
  var site = data.site || {};
  var nav = document.getElementById("nav");
  var main = document.getElementById("sections");

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }
  function link(text, url, cls) {
    if (!/^https?:\/\//i.test(url || "")) return null; // only http(s) links
    var a = el("a", cls, text);
    a.href = url; a.target = "_blank"; a.rel = "noopener";
    return a;
  }

  if (site.title) {
    document.getElementById("title").textContent = site.title;
    document.title = site.title;
  }
  if (site.description) {
    var tg = document.getElementById("tagline");
    tg.textContent = site.description; tg.hidden = false;
  }

  var shown = [];
  (data.sections || []).forEach(function (s) {
    if (s.visible === false) return;
    var ps = (s.projects || []).filter(function (p) { return p.visible !== false; });
    if (ps.length) shown.push({ s: s, ps: ps });
  });

  if (!shown.length) {
    main.appendChild(el("p", "empty", "Nothing here yet. Projects will appear soon."));
    return;
  }

  shown.forEach(function (x, i) {
    var s = x.s, id = "s-" + (s.id || i);
    var a = el("a", "chip c" + (i % 2), s.title);
    a.href = "#" + id;
    nav.appendChild(a);

    var sec = el("section", "sec c" + (i % 2));
    sec.id = id;
    sec.appendChild(el("h2", "", s.title));
    if (s.description) sec.appendChild(el("p", "sec-desc", s.description));

    x.ps.forEach(function (p) {
      var row = el("article", "project");
      var text = el("div", "text");
      text.appendChild(el("h3", "", p.title));
      if (p.description) text.appendChild(el("p", "", p.description));
      if (p.tags && p.tags.length) {
        var tags = el("p", "tags");
        p.tags.forEach(function (t) { tags.appendChild(el("span", "tag", t)); });
        text.appendChild(tags);
      }
      var links = el("p", "links");
      var open = link("Open", p.url, "button");
      var src = link("Source", p.repo, "source");
      if (open) links.appendChild(open);
      if (src) links.appendChild(src);
      row.appendChild(text);
      row.appendChild(links);
      sec.appendChild(row);
    });
    main.appendChild(sec);
  });
})();
