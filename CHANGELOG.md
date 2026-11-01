# Changelog

Release notes for each version. The release workflow copies the section of the tagged version into the GitHub
release and into the in-app update notice, so write it for players. `npm run release X.Y.Z` stops if the section is
missing.

## 0.3.1 — Full Armory

The Arsenal now carries every weapon in the field, with stats from the Helldivers Wiki.

- **145 items**: all primaries, secondaries, support weapons and grenades, plus the stratagems
- **Correct armor penetration** for every weapon (the Eruptor is heavy pen, as every diver knows)
- **Type filter** in every category, so you can show only shotguns, marksman rifles or energy weapons
- **Detail panel** now shows each weapon's designation, its full damage breakdown and its penetration
- Fixed a rare glitch where the whole window could scroll away while moving through a long list with the keyboard

Reload times and damage drop-off curves are approximate and not yet available for every weapon. Weapon data:
Helldivers Wiki (helldivers.wiki.gg), CC BY-NC-SA 4.0.

## 0.3.0 — Armory

The Arsenal is open.

- **Catalog** of primaries, secondaries, support weapons, grenades and stratagems, with search, sorting and the latest buff or nerf on every card
- **Compare** any two items side by side: mirrored stat bars show which one wins, plus both damage drop-off curves and their armor penetration
- **Detail panel** for every item with all stats, its drop-off curve and the latest patch note
- "View in Arsenal" links in the news and the Balance Tracker now open the item directly
- The C-01 permit report now has its own front-line illustration

Weapon values are approximate for now.

## 0.2.1 — Propaganda Desk

- Every news item now carries a picture: a small preview in the list and a large one when you open it
- Items without a photo get their own Super Earth cover art, from Ministry of Defense bulletins to parody ads
- Official news now reads like a real dispatch from High Command and the Ministry of Defense
- Cleaner tags: only PATCH, BREAKING, EVENT and IN-UNIVERSE

## 0.2.0 — Command Deck

The Home tab is live.

- **Major Order** briefing with a live countdown, planet-by-planet progress and the reward, plus a record of past orders
- **Galactic News & Events**: war news side by side with **Super Earth Broadcasts**, in-universe reports, Ministry bulletins and parody ads straight from the propaganda desk
- **Weapon Balance Tracker**: every buff and nerf, grouped by patch, with filters
- **Bounty Board**: the top Anti-Treason Officers and your own position

War data, balance changes and the bounty board are sample data for now; live war data arrives in a later update.

## 0.1.2 — Update Check

A small update that confirms automatic updates work end to end.

- Installed copies update themselves in the background and offer **Restart now** or **On next launch**
- Release notes like these now appear on GitHub and inside the app

No new features in this version.

## 0.1.1 — Maintenance Update

A small maintenance update.

- Installed copies of 0.1.0 can update themselves to this version
- Documentation: notes about Windows SmartScreen and Microsoft Defender warnings for unsigned apps

No new features in this version.

## 0.1.0 — First Deployment

**Super Tracker** is an unofficial, fan-made companion app for Helldivers 2 on Windows. This is the first deployment:
the base of the app is in place, the content tabs arrive in the next updates.

- HUD desktop app with its own title bar, sidebar navigation and three themes (Helldiver Standard, SEAF Fleet, Super Earth High Command)
- First-run screen with the Terms of Use, Privacy Notice, Community Guidelines and the Treason roleplay rules
- Automatic updates: once installed, Super Tracker keeps itself up to date
- Live content channel: game data and texts can be refreshed without reinstalling
- Home, Arsenal, Loadout, Treason, Enemies and SEAF are under construction; Divergram is closed for now
