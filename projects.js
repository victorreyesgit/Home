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
  "site": {
    "title": "Programming Projects",
    "description": "Visualizations, games and tools I build for fun."
  },
  "sections": [
    {
      "id": "apps",
      "title": "Useful Apps",
      "description": "Useful Apps",
      "visible": true,
      "projects": [
        {
          "title": "Aware",
          "description": "App to be AWARE of your habits",
          "url": "https://victorreyesgit.github.io/Aware/",
          "visible": true
        },
        {
          "title": "LunApp",
          "description": "App that informs of the hour of the next moonset/moonrise",
          "url": "https://victorreyesgit.github.io/LunApp/",
          "visible": true
        }
      ]
    },
    {
      "id": "world_motion",
      "title": "World in Motion",
      "description": "",
      "visible": true,
      "projects": [
        {
          "title": "Orbital",
          "description": "Visualisation to explain the phases of the moon and predicting the hour for moonrise and moonset",
          "url": "https://victorreyesgit.github.io/Orbital/",
          "visible": true
        },
        {
          "title": "Jet d'Eau visualisation",
          "description": "",
          "url": "https://victorreyesgit.github.io/Jet-d-eau/",
          "visible": true
        },
        {
          "title": "New project",
          "description": "",
          "url": "",
          "visible": true
        }
      ]
    },
    {
      "id": "juegos_abuelo",
      "title": "Los juegos del Abuelo ",
      "description": "Juegos para mi abuelo y para quien los quiera",
      "visible": true,
      "projects": []
    },
    {
      "id": "tools",
      "title": "Tools",
      "description": "Little utilities that solve one problem.",
      "visible": true,
      "projects": []
    },
    {
      "id": "cute-webpages",
      "title": "Cute Webpages",
      "description": "Webpages more to show than day to day useful",
      "visible": true,
      "projects": [
        {
          "title": "Special Dates",
          "description": "It searches for \"day-versaries\" e.g. when you will be 10000 days old",
          "url": "https://victorreyesgit.github.io/Special_Dates/",
          "visible": true
        }
      ]
    },
    {
      "id": "invisible",
      "title": "Invisible",
      "description": "Things on work or not public",
      "visible": true,
      "projects": []
    }
  ]
};
