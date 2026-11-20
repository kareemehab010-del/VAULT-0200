VAULT-020 — VAULT 05 INTEGRATED BUILD
=====================================

INSTALL
1. Back up your current project folder.
2. Extract this ZIP, preserving the folder structure.
3. Open the extracted root (the folder containing index.html) in VS Code.
4. Run index.html using Live Server.

VAULT 05
- Vault 05 is integrated into the existing Vault Complex.
- It unlocks only after Vault 04 is completed.
- Vault 05 contains four archive records, PROJECT ECHO (three easy sequence rounds),
  the revelation scene, final authorization, and a cinematic ending.
- Vault 06 becomes available after the Vault 05 ending completes.
- Progression is session-based: a fresh browser tab/session starts at Vault 01; refreshes within the same tab preserve progress. Closing the tab ends that session.
  No external audio files, downloads, or copyrighted recordings are required.
- Visual artwork is built with isolated CSS illustrations and effects, so image paths
  cannot break after deployment.

FILES
- vault05/vault05.css
- vault05/vault05.js
- index.html (Vault 05 markup and stylesheet/script references)
- vault04/vault04.js (small event hook so the hub refreshes Vault 05 after Vault 04)

IMPORTANT
- Keep all project files and assets together.
- Progress uses localStorage keys already used by this project plus:
  malak_vault05_complete
- To test a fresh run, open the site in a new browser tab. Refreshing the same tab preserves the current run.
- Existing Vaults 01–04 markup and game logic have been preserved, except for a small
  return-to-hub event hook in Vault 04.
