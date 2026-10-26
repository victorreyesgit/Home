// ============================================================
//  PROJECTS DATA: edit this file to change the site.
//  Keep it valid JSON: double quotes, no comments inside the
//  object, no trailing commas. Keep the line "window.PROJECTS = {".
//
//  "site"      -> page name and short description under it
//  "sections"  -> each has projects[]
//  "visible"   -> true shows it, false hides it (sections and projects)
//
//  Example (copy and paste inside "sections": [ ... ]):
//  {
//    "id": "games",                    short, lowercase, no spaces (used for #links)
//    "title": "Games",
//    "description": "Small games for friends.",
//    "visible": true,
//    "projects": [
//      {
//        "title": "My game",
//        "description": "One line about it.",
//        "url": "https://victorreyesgit.github.io/my-game/",
//        "repo": "https://github.com/victorreyesgit/my-game",   optional
//        "tags": ["Canvas", "Multiplayer"],                      optional
//        "visible": true
//      }
//    ]
//  }
//  Sections with no visible projects are hidden on the public page.
// ============================================================
window.PROJECTS = {
  "site": { "title": "Programming Projects", "description": "Visualizations, games and tools I build for fun." },
  "sections": [
    { "id": "visualizations", "title": "Visualizations", "description": "Interactive explorations you can play with.", "visible": true, "projects": [] },
    { "id": "games", "title": "Games", "description": "Small games for friends.", "visible": true, "projects": [] },
    { "id": "tools", "title": "Tools", "description": "Little utilities that solve one problem.", "visible": true, "projects": [] }
  ]
};
