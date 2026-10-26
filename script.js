// Builds the public page from window.PROJECTS (see projects.js).
(function () {
  var data = window.PROJECTS || { sections: [] };
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

  var sections = (data.sections || []).filter(function (s) {
    return s.projects && s.projects.length;
  });

  if (!sections.length) {
    main.appendChild(el("p", "empty", "Nothing here yet. Projects will appear soon."));
    return;
  }

  sections.forEach(function (s, i) {
    var id = "s-" + (s.id || i);
    var a = el("a", "chip", s.title);
    a.href = "#" + id;
    nav.appendChild(a);

    var sec = el("section", "sec");
    sec.id = id;
    sec.appendChild(el("h2", "", s.title));
    if (s.description) sec.appendChild(el("p", "sec-desc", s.description));

    s.projects.forEach(function (p) {
      var row = el("article", "project");
      var text = el("div", "text");
      text.appendChild(el("h3", "", p.title));
      if (p.description) text.appendChild(el("p", "", p.description));
      if (p.tags && p.tags.length) text.appendChild(el("p", "tags", p.tags.join(", ")));
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
