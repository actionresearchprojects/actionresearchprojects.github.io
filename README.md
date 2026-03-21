# ARC — Architecture for Resilient Communities

**Developing climate-adaptive architecture in warming climates through collaboration, practice and monitoring.**

[![GitHub Pages](https://img.shields.io/badge/Live_Site-actionresearchprojects.net-blue)](https://actionresearchprojects.net)
[![License](https://img.shields.io/badge/licence-All_Rights_Reserved-lightgrey)](#licence)

---

## About ARC

ARC is an international programme that brings together design practitioners and academics to develop high-performance strategies for **energy-efficient, climate-adaptable buildings** using step-by-step optimised mixed-mode ventilation and in-use feedback loops.

The programme addresses the pressing challenge of achieving thermal comfort in hot and humid climates. It focuses on developing, testing, and disseminating innovative passive cooling solutions that are affordable, sustainable, and adaptable to local needs.

ARC is a team of volunteers led by Andrew Simmonds of **Simmonds Mills**, a UK-based architectural R&D firm, in partnership with the **Al-Mizan Children's Ecovillage** in Tanzania — the first of several ARC-initiated field-testing R&D sites in Africa and Asia.

### Who we serve

The programme targets two key markets:

- **Lower-income self-builders** — affordable, accessible solutions to improve housing quality
- **Higher-income managed self-builders** — passive cooling innovations that integrate with modern building standards

### Our approach

ARC integrates robust R&D with community engagement to support innovative, scalable pathways for improving thermal comfort in buildings — addressing both immediate needs and long-term sustainability goals for people living in environmentally and socio-economically challenging regions. ARC solutions aim to create cool, comfortable indoor environments without the immediate need for mechanical cooling and dehumidification equipment.

---

## Site structure

### Main sections

| Section | Path | Description |
|---|---|---|
| **Home** | `/` | Landing page with project showcase grid |
| **ARC Standard** | `/arc-standard` | Overview of the ARC building standard |
| **Cool Buildings Guide** | `/cool-buildings-guide/` | 8-part practical guide covering air movement, thermal mass, insect protection, and more |
| **Science** | `/science/` | 7-part deep dive into the physics and research behind ARC strategies |
| **Projects** | `/projects/` | Showcase of ARC field projects |
| **Reflections** | `/reflections/` | 4 in-depth case studies and practitioner reflections |
| **People** | `/people` | Team profiles and portraits |
| **Map** | `/map` | Interactive Mapbox map of projects and climate data |
| **Blog** | `/blog/` | News and updates (SPA with hash routing) |
| **Support** | `/support` | How to support the programme |
| **About** | `/about` | Mission, team, and background |
| **Contact** | `/contact` | Contact form |

### Cool Buildings Guide topics

1. Air Movement
2. Avoiding Heat
3. Cooling the Air
4. Drying the Air
5. Environmental Performance
6. Keeping Heat Out
7. Practical Constraints
8. Thermal Mass

### Science topics

1. ARC Standard
2. Physical Factors
3. Keeping Cool
4. Three Zone Concept
5. Resources
6. Insect Protection
7. Citizen Science

---

## Embedded sub-projects

Several interactive features are maintained as independent repositories and automatically synced into this site via GitHub Actions. Each lives in the `embedded/` directory.

| Project | Description | Auto-synced |
|---|---|---|
| **projects-grid** | Visual project showcase grid | Yes |
| **CBG-grid** | Cool Buildings Guide topic grid | Yes |
| **project-map** | Interactive Mapbox map with project pins, weather stations, and Köppen-Geiger climate zones | Yes |
| **arc-people** | Team portrait carousel with biographies | Yes |
| **reflections** | Reflections article grid | Yes |
| **greenspace-initiative** | ARC Greenspace Initiative archive | Yes |
| **science-grid** | Science topic grid | Yes |
| **arc_tz_temp_humid** | Live temperature & humidity dashboard (auto-builds twice daily) | Yes |
| **arc_tz_weather** | Weather data dashboard | Pending |
| **technical-criteria** | Technical criteria PDF viewer | Static |

### How auto-sync works

```
Source repo push
  → notify-main-site.yml sends repository_dispatch to this repo
    → sync-embedded.yml clones source, copies built output into embedded/
      → deploy.yml triggers GitHub Pages deployment
```

Each sub-project repo contains a `notify-main-site.yml` workflow that fires on push to `main`. This repo's `sync-embedded.yml` receives the dispatch, clones the source, strips build artefacts (`.py`, `.md`, `.git`, `__pycache__`, etc.), and copies the output into `embedded/<folder>/`.

---

## Blog & admin system

### Publishing workflow

1. Navigate to `/admin/` and authenticate with a GitHub Personal Access Token (fine-grained, scoped to this repo with Contents read/write)
2. Create a post using the rich text editor (supports bold, italic, headings, lists, links, and image uploads)
3. On publish, the admin page uses the GitHub Contents API to commit post data and images directly to the repository
4. GitHub Pages auto-deploys within 1–2 minutes
5. If LinkedIn cross-posting is enabled, the `linkedin-post.yml` workflow automatically shares the post to the [ARC LinkedIn page](https://www.linkedin.com/company/arc-cool-buildings)

### Blog architecture

```
blog/
├── index.html          ← SPA with hash-based routing (/blog/#post-slug)
├── posts.json          ← Post manifest (loaded client-side)
├── posts/              ← Individual post JSON files
├── images/             ← Uploaded post images
└── authors/            ← Author profile images
```

### LinkedIn cross-posting (optional)

Requires the following repository configuration:

- **Secrets:** `LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_ORG_ID`
- **Variable:** `LINKEDIN_ENABLED` = `true`

The workflow reads new post data, publishes to the LinkedIn organisation page, and saves the resulting LinkedIn URL back to the post JSON.

---

## Live data dashboards

ARC collects environmental data from monitoring equipment at field sites. Two dashboards visualise this data:

| Dashboard | Path | Data |
|---|---|---|
| **Temperature & Humidity** | `/graphs/arc-tz-temp-humid/` | Indoor/outdoor T&H readings from Tanzania site sensors |
| **Weather** | `/graphs/arc-tz-weather` | Local weather station data |

The temperature & humidity dashboard auto-builds twice daily via scheduled GitHub Actions in its source repository, pulling fresh sensor data each cycle.

Dashboard access is password-protected — the `deploy.yml` workflow injects a SHA-256 hash of the `ARC_GRAPHS_PASSWORD` secret at deploy time.

---

## GitHub Actions workflows

| Workflow | Trigger | Purpose |
|---|---|---|
| **deploy.yml** | Push to `main` | Injects password hashes into protected pages, deploys to GitHub Pages |
| **sync-embedded.yml** | `repository_dispatch` | Syncs embedded sub-project files from their source repositories |
| **linkedin-post.yml** | Push to `blog/posts/*.json` | Cross-posts new blog entries to LinkedIn (when enabled) |

---

## Technical details

### Hosting

- **Platform:** GitHub Pages
- **Domain:** [actionresearchprojects.net](https://actionresearchprojects.net) (custom domain via CNAME)
- **Mirror:** [actionresearchprojects.github.io](https://actionresearchprojects.github.io)
- **Deploy:** Automatic on push to `main` (1–2 minute propagation)

### Design

- **Layout:** Fixed-width 1440px design (1366px for support page)
- **Typography:** [Ubuntu](https://fonts.google.com/specimen/Ubuntu) (Google Fonts with woff2 fallback)
- **Responsive scaling:** `<meta name="viewport" content="width=1440">` allows browsers to auto-scale; `fluid-scaling.js` applies dynamic zoom on desktop
- **Orientation:** Mobile devices (≤1024px) are guided to landscape orientation via an overlay prompt

### SEO & metadata

- `sitemap.xml` — 54 indexed URLs
- `robots.txt` — blocks `/admin/` and `/embedded/` from crawlers
- Open Graph and Twitter Card meta tags on all pages
- Canonical URLs set per page

---

## Repository layout

```
.
├── .github/workflows/         GitHub Actions (deploy, sync, LinkedIn)
├── admin/                     Blog post editor (PAT-authenticated)
├── assets/
│   ├── fonts/                 Woff2 web fonts
│   └── images/                Site images, favicons, OG image
├── blog/                      Blog SPA, post data, and images
├── cool-buildings-guide/      8 guide topic pages
├── embedded/                  Auto-synced sub-project sites
│   ├── arc-people/
│   ├── arc_tz_temp_humid/
│   ├── arc_tz_weather/
│   ├── CBG-grid/
│   ├── greenspace-initiative/
│   ├── project-map/
│   ├── projects-grid/
│   ├── reflections/
│   ├── science-grid/
│   └── technical-criteria/
├── graphs/                    Data dashboards
├── projects/                  Project pages
├── reflections/               Case study pages
├── science/                   Science topic pages
├── index.html                 Home page
├── about.html                 About ARC
├── arc-standard.html          ARC Standard overview
├── contact.html               Contact form
├── map.html                   Interactive project map
├── people.html                Team profiles
├── support.html               Support the programme
├── privacy.html               Privacy policy
├── 404.html                   Custom error page
├── CNAME                      Custom domain config
├── robots.txt                 Crawler rules
├── sitemap.xml                Sitemap for search engines
├── fluid-scaling.css          Responsive scaling styles
├── fluid-scaling.js           Dynamic zoom script
└── orientation-lock.css       Mobile orientation overlay
```

---

## Adding a new embedded sub-project

1. Create the repository under the `actionresearchprojects` GitHub organisation
2. Add a `.github/workflows/notify-main-site.yml` workflow that sends a `repository_dispatch` to this repo on push
3. Add the `MAIN_SITE_PAT` secret to the new repo (a GitHub PAT with repo scope)
4. If the repo name differs from the desired `embedded/` folder name, add a mapping in `sync-embedded.yml`'s "Resolve embedded folder name" step

---

## Secrets & environment

| Secret / Variable | Where | Purpose |
|---|---|---|
| `SYNC_PAT` | This repo | PAT used so sync commits trigger the deploy workflow |
| `ARC_GRAPHS_PASSWORD` | This repo | Password for accessing data dashboards (hashed at deploy time) |
| `LINKEDIN_ACCESS_TOKEN` | This repo | OAuth token for LinkedIn API (optional) |
| `LINKEDIN_ORG_ID` | This repo | LinkedIn organisation ID (optional) |
| `LINKEDIN_ENABLED` | This repo (variable) | Enables LinkedIn cross-posting when set to `true` |
| `MAIN_SITE_PAT` | Each sub-repo | PAT used to send dispatch events to this repo |

---

## Connect with ARC

- **Website:** [actionresearchprojects.net](https://actionresearchprojects.net)
- **LinkedIn:** [ARC Cool Buildings](https://www.linkedin.com/company/arc-cool-buildings)

---

## Licence

© 2026 ARC, a programme of Simmonds Mills. All rights reserved.
