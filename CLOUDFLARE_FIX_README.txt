VAULT-020 — CLOUDFLARE STATIC ASSETS FIX
==========================================

WHAT WAS FIXED
- Added wrangler.jsonc so Cloudflare Workers deploys the complete site as Static Assets.
- The static asset directory is the project root, so index.html, CSS, JavaScript, images,
  MP3 files, and MP4 files are uploaded together.
- Added .assetsignore to keep deployment config and README files out of the public asset set.
- Normalized Vault 02 and Vault 06 media URLs to root-absolute paths.
- Added an explicit media load() call for Vault 02 audio and Vault 06 background music.
- Corrected a stray literal "\\n" in the first stylesheet link in index.html.

HOW TO UPDATE THE EXISTING GITHUB REPOSITORY
1. Back up the current repository contents.
2. Extract this ZIP.
3. Upload/replace the repository files using the extracted folder contents.
   IMPORTANT: wrangler.jsonc and .assetsignore must be in the same root folder as index.html.
   Keep the existing folder structure (assets/, vault04/, vault05/, vault06/).
4. Commit the changes to the main branch.

CLOUDFLARE BUILD SETTINGS
- Root directory: /
- Build command: npx wrangler deploy
- Build output directory: leave empty / None
- The deployment must run from the repository root, where wrangler.jsonc is located.

VERIFY AFTER DEPLOY
Open these URLs in a new tab (replace the host if your Worker URL differs):
- /assets/music/track01.mp3
- /assets/vault06/audio/birthday-song.mp3
- /assets/vault06/videos/meeting.mp4
- /assets/vault06/images/photo01.jpg

Each should load/play rather than return 404.
Then test Vault 02 audio and Vault 06 after completing the earlier Vaults.

NOTES
- The ZIP preserves the original media files and game flow.
- This configuration makes the Worker deploy the static files along with the site.
- Browser autoplay rules still apply: audio/video playback should be initiated by the game's
  user interaction, as implemented in the existing flow.
