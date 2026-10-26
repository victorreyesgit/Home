# Victor Reyes: Projects hub

A static page (plain HTML/CSS/JS, no build step) that lists your projects by section.
All content lives in `projects.js`. Opening `index.html` by double-click works.

## Files
- `index.html`, `style.css`, `script.js`: the public page
- `projects.js`: all content (sections and projects)
- `admin.html`, `admin.js`: private editing page (not linked from the site)

## 1. Upload and publish (GitHub Pages)
1. Your repo is `victorreyesgit.github.io`. If it already exists, back up what is in it; this site replaces its `index.html` and `style.css`.
2. On github.com open the repo, **Add file → Upload files**, drag in all files from this zip, then **Commit changes** (branch `main`).
3. **Settings → Pages**: Source = **Deploy from a branch**, branch `main`, folder `/ (root)`. Save.
4. After about a minute the site is at `https://victorreyesgit.github.io/`.
   The admin page is at `https://victorreyesgit.github.io/admin.html` (bookmark it; nothing links to it).

Cloudflare Pages also works (connect the repo, no build command, output directory `/`). The admin settings in `admin.js` still point to the GitHub repo.

## 2. Create the token (once, then every time it expires)
1. GitHub → your profile picture → **Settings**.
2. Bottom of the left menu: **Developer settings → Personal access tokens → Fine-grained tokens**.
3. **Generate new token**. Name: `projects-hub-admin`.
4. **Expiration**: pick a short one (30 or 90 days). Avoid "no expiration".
5. **Resource owner**: `victorreyesgit`.
6. **Repository access → Only select repositories** → choose `victorreyesgit.github.io`.
7. **Permissions → Repository permissions → Contents: Read and write**. Leave everything else as "No access" (Metadata read-only is added automatically).
8. **Generate token** and copy it (starts with `github_pat_`). GitHub shows it only once.

## 3. Use the admin page
1. Open `admin.html`, paste the token, click **Save token and load**.
2. Edit: add, rename, delete and reorder sections (↑ ↓); add, edit, delete and reorder projects; use **Move to section** to move a project.
3. Click **Save to GitHub**. A green message confirms the commit; the site updates in about a minute.
4. If you see "changed on GitHub since you loaded it", someone (you, by hand) edited the file meanwhile: click **Reload from GitHub** and redo the edit. Nothing is overwritten.
5. **Forget token** removes it from that device. Do this on shared computers.

`OWNER`, `REPO`, `BRANCH` and `FILE` are constants at the top of `admin.js`.

## 4. Edit `projects.js` by hand
Open `projects.js` on github.com, click the pencil, edit, **Commit changes**. The comment at the top has a copy-paste example. Rules: valid JSON inside the braces (double quotes, no trailing commas, no comments inside) and keep the line `window.PROJECTS = {`. The admin page needs this to read the file; if it is broken, the admin tells you.
Sections with no projects are hidden on the public page.

## Security trade-offs of keeping the token in the browser (honest version)
- The token sits in `localStorage` unencrypted. Anyone with access to your unlocked browser profile, or any script running on the same origin, can read it.
- **Same-origin risk:** on a GitHub user site, all your project pages (`victorreyesgit.github.io/Manifold-Balls/` etc.) share one origin with `admin.html`. Any of them, including third-party scripts they load, could read the stored token. If you worry about that, host the hub on its own origin (e.g. Cloudflare Pages `*.pages.dev` or a separate domain), or use a private/incognito window and Forget token afterwards.
- What a leaked token can do: write files in this one repo. That means defacing the site or adding malicious JavaScript to it. It cannot touch your other repos or account settings. A short expiry limits the time window.
- Mitigations already in place: one repo only, Contents permission only, `admin.html` has a Content-Security-Policy limiting network calls to `api.github.com`, and the token is never in the repo.
- If a token may have leaked: delete it in GitHub Developer settings; it stops working immediately.
