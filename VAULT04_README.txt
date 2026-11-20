VAULT-020 — VAULT 04 BUILD
==========================

This ZIP is the complete project snapshot with Vault 04 integrated.

INSTALL
1. Keep a backup of your current project folder.
2. Extract the ZIP, preserving the folder structure.
3. Open the extracted project root (the folder containing index.html) in VS Code.
4. Start index.html using Live Server.
5. Complete Vault 03. Vault 04 becomes available only after the Memory Archive has completed.
6. Open Vault 04 from the Vault Complex.

VAULT 04 FILES
- The Vault 04 screen markup is integrated into the root index.html so it shares the existing navigation.
- vault04/vault04.css contains isolated Vault 04 styling.
- vault04/vault04.js contains the self-contained game logic.
- Existing assets and Vault 01–03 files are included in the snapshot.

NOTES
- Keep the assets, vault04, index.html, script.js, and style.css paths together.
- The game uses browser localStorage for the existing progression flags.
- For a clean test, use a private/incognito window or clear this site's localStorage.
- This is a static website; no server-side setup is required.

PROGRESSION NOTE
Progress is stored in sessionStorage. A new browser tab starts a fresh Vault 01 run; refreshes in the same tab retain progress.
