VAULT 06 — PROJECT NEBULA
========================

ASSETS VERIFIED
- 56 images: assets/vault06/images/photo01.jpg through photo56.jpg
- 15 videos: assets/vault06/videos/meeting.mp4 and video02.mp4 through video15.mp4
- Background song: assets/vault06/audio/birthday-song.mp3

EXPERIENCE
1. Wordle-style identity check: NEBULA, 6 letters, 7 attempts.
2. On correct answer, background song starts and loops continuously.
3. Four memory waves reveal 14 photos each (56 total). Photos accumulate and remain visible.
4. The first video is meeting.mp4, followed by video02.mp4 through video15.mp4.
5. All videos are muted. The background song remains the only audio and continues through the final birthday message.
6. After all photos and all videos finish, the final screen appears with a button to reveal the birthday message.
7. The Vault 06 completion flag is stored in sessionStorage when the birthday message is revealed.

TESTING
- Extract the entire ZIP, preserving folder structure.
- Run index.html with VS Code Live Server (or another local HTTP server).
- Complete Vaults 01–05 in sequence before testing Vault 06.
- A fresh browser tab starts a new progression session, as configured in the existing project.
- Browser autoplay policies can affect audio in unusual environments; the song is started directly from the successful Wordle interaction.
