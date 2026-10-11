---
title: Data sources and editorial method
summary: Where each kind of content on this site comes from, how it is processed, its licence, which pages are written by editors and which are generated from public data, and how corrections work.
updated: 2026-10-11
---

World Airport Maps treats airport information as two separate streams — **editorially compiled** and **public data** — and shows an update date for each record. This page explains where every kind of content comes from, where its limits are, and what we do when something is wrong.

## 1. Editorially compiled content (checked by hand)

An airport's **terminal structure, gate ranges, main airlines, annual passenger volume, distance to the city centre, ground transport modes and facility list** are compiled by editors against airport websites, airline terminal information and public traffic reports, then checked item by item before publication.

- This changes as airports are rebuilt (new terminals, renumbered gates, airlines moving terminal), so treat it as a planning aid and confirm with the airport.
- Every record carries an **update date**; the date shown in the interface is the last time it changed.
- The largest international hubs — several dozen airports — are fully compiled today; the rest are data-driven index pages (see sections 3 and 4).

## 2. Airport guides (written by editors)

The long-form "airport guide" on an airport page is written by editors. It focuses on **how terminals map to airline alliances, what matters when transferring between terminals, and the ways into the city**, plus what is specific to that airport (two airports serving one city that are easy to mix up, transfer shuttles that need to be budgeted for). A guide is interpretation and experience, not an official document; prices and timetables follow the operator's published information.

## 3. Data-driven index pages

For airports not yet editorially compiled, the page is generated from public data in the site's own repository and shows **only fields that actually exist**: airport codes, country and city, coordinates, size class, the OpenFlights route set, and nearby airports computed from coordinates. These pages **do not invent** terminal or transport detail — a field that is missing is omitted rather than padded with a guess.

## 4. Public datasets (with licences)

| Data | Source | Licence / notes |
| --- | --- | --- |
| World airport index (coordinates, size, elevation and other base fields) | OurAirports public dataset | Public domain. Coordinates are rounded to four decimals (~10 m) for display and map placement only — **not for navigation** |
| Routes (non-stop destinations and carriers) | OpenFlights, 2014-06 snapshot | **ODbL**. Non-stop services only and dated; the page header prints the snapshot date |
| Airport maps and terminal layout diagrams | OpenStreetMap geometry | **ODbL**. Marked © OpenStreetMap contributors |
| Map basemap | OpenStreetMap tiles (rendered with Leaflet) | **ODbL** |
| Terminal maps (PNG / PDF) | Third-party sources | Source, sha256 and licence notes are recorded in `terminal-maps-manifest.json`; **copyright remains with the rights holders** |
| Country / region flags | Public flag artwork | Used to identify countries and regions |

## 5. Diagrams are not surveyed floor plans

The terminal layout diagram is **drawn automatically from the number of terminals, the gate count and the ground transport node**. It conveys an airport's overall shape and how its terminals relate to one another. It is **not a to-scale surveyed floor plan** and is no substitute for the official plans an airport publishes.

## 6. Corrections

If you find anything wrong, please [contact us](/contact) or email [contact@globalairportmaps.com](mailto:contact@globalairportmaps.com). Include the airport code and a source where you can (the airport's site, an airline terminal map or a recent photo). We check reports against official information, correct the record and advance the page's update date.

## 7. Update cadence

- **Airport base data**: updated as records are entered and corrected; each page shows its own update date.
- **Route data**: a 2014-06 snapshot, not yet refreshed; the snapshot date is printed on the page.
- **The site overall**: the number of editorially compiled airports grows over time.
