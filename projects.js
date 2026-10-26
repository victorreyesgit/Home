// ============================================================
//  PROJECTS DATA: edit this file to change the site.
//  Keep it valid JSON: double quotes, no comments inside the
//  object, no trailing commas. Keep the line "window.PROJECTS = {".
//
//  Structure:  sections[] -> each has projects[]
//
//  Example (copy and paste inside "sections": [ ... ]):
//  {
//    "id": "games",                    short, lowercase, no spaces (used for #links)
//    "title": "Games",
//    "description": "Small games for friends.",
//    "projects": [
//      {
//        "title": "My game",
//        "description": "One line about it.",
//        "url": "https://victorreyesgit.github.io/my-game/",
//        "repo": "https://github.com/victorreyesgit/my-game",   optional
//        "tags": ["Canvas", "Multiplayer"]                       optional
//      }
//    ]
//  }
//  Sections with no projects are hidden on the public page.
// ============================================================
window.PROJECTS = {
  "sections": [
    { "id": "visualizations", "title": "Visualizations", "description": "Interactive explorations you can play with.", "projects": [] },
    { "id": "games", "title": "Games", "description": "Small games for friends.", "projects": [] },
    { "id": "tools", "title": "Tools", "description": "Little utilities that solve one problem.", "projects": [] }
  ]
};
