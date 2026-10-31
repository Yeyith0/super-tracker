# content/

Game content as JSON (weapons, balance changes, enemies, gear, official loadouts, sample news / posts / cases /
players) and the legal texts.

- The app bundles a copy of this folder. From Phase 3 on it also downloads the latest files from the GitHub repo,
  so content can change without a new app release.
- Every file carries `contentVersion` and `schemaVersion` (checked by the content loader from Phase 3 on).
- Sample entries are approximate and marked as sample data.

Files are added by the phase that needs them (legal.json in Phase 2, news.json in Phase 4, weapons.json in Phase 5, …).
