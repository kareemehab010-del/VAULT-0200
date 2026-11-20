
/* ================================= */
/* VAULT-020 V2 - MAIN SYSTEM */
/* ================================= */

const STORAGE_KEY = "malak_vault020_v2_origin_complete";

const introScreen = document.getElementById("introScreen");
const hubScreen = document.getElementById("hubScreen");
const originScreen = document.getElementById("originScreen");
const musicScreen = document.getElementById("musicScreen");
const archiveScreen = document.getElementById("archiveScreen");

const enterButton = document.getElementById("enterButton");
const vault1 = document.getElementById("vault1");
const vault2 = document.getElementById("vault2");
const vault3 = document.getElementById("vault3");

const startMemoryButton =
    document.getElementById("startMemoryButton");

const originGame = document.getElementById("originGame");
const originCompletion =
    document.getElementById("originCompletion");

const originFeedback =
    document.getElementById("originFeedback");

const originReturnButton =
    document.getElementById("originReturnButton");

const musicReturnButton =
    document.getElementById("musicReturnButton");

const answerButtons =
    document.querySelectorAll(".answer-button");

const progressText =
    document.getElementById("progressText");

const completionCount =
    document.getElementById("completionCount");


/* SCREEN NAVIGATION */

function showScreen(screenToShow) {

    document.querySelectorAll(".screen").forEach((screen) => {
        screen.classList.add("hidden");
    });

    screenToShow.classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "instant"
    });

}


/* SAVE AND LOAD PROGRESS */

function isOriginComplete() {
    return sessionStorage.getItem(STORAGE_KEY) === "true";
}

function updateVaultProgress() {

    const completed = isOriginComplete();

    if (completed) {

        vault2.disabled = false;

        vault2.classList.remove("locked");
        vault2.classList.add("unlocked");

        vault2.querySelector(".vault-state").textContent =
            "AVAILABLE";

        progressText.textContent =
            "2 / 6 VAULTS AVAILABLE";

        completionCount.textContent = "17%";

    } else {

        progressText.textContent =
            "1 / 6 VAULTS AVAILABLE";

        completionCount.textContent = "0%";

    }

}


/* INITIALIZE */

updateVaultProgress();


/* ENTER THE VAULT COMPLEX */

enterButton.addEventListener("click", () => {
    showScreen(hubScreen);
});


/* OPEN VAULT 01 */

vault1.addEventListener("click", () => {
    showScreen(originScreen);
});


/* START MEMORY GAME */

startMemoryButton.addEventListener("click", () => {

    startMemoryButton.classList.add("hidden");

    originGame.classList.remove("hidden");

});


/* ANSWER THE JALATA GAME */

answerButtons.forEach((button) => {

    button.addEventListener("click", () => {

        const answer = button.dataset.answer;

        if (answer === "JALATA") {

            originFeedback.textContent =
                "MATCH FOUND. RESTORING MEMORY...";

            answerButtons.forEach((item) => {
                item.disabled = true;
            });

            setTimeout(() => {

                originGame.classList.add("hidden");

                originCompletion.classList.remove("hidden");

                sessionStorage.setItem(STORAGE_KEY, "true");

                updateVaultProgress();

            }, 1000);

        } else {

            originFeedback.textContent =
                "INCORRECT WORD. TRY AGAIN.";

            button.disabled = true;

        }

    });

});


/* RETURN FROM VAULT 01 */

originReturnButton.addEventListener("click", () => {
    showScreen(hubScreen);
});


/* OPEN VAULT 02 */


/* ================================= */
/* VAULT 02 - THE FREQUENCY SYSTEM */
/* ================================= */

const MUSIC_STORAGE_KEY = "malak_vault020_music_complete";

const musicIntro = document.getElementById("musicIntro");
const musicGame = document.getElementById("musicGame");
const musicCompletion = document.getElementById("musicCompletion");

const startMusicGame = document.getElementById("startMusicGame");

const vaultAudio = document.getElementById("vaultAudio");

const trackCounter = document.getElementById("trackCounter");
const audioTitle = document.getElementById("audioTitle");
const audioStatus = document.getElementById("audioStatus");
const audioTimer = document.getElementById("audioTimer");
const audioProgress = document.getElementById("audioProgress");
const audioInstruction = document.getElementById("audioInstruction");

const audioVisualizer = document.getElementById("audioVisualizer");

const answerSection = document.getElementById("answerSection");
const musicAnswers = document.getElementById("musicAnswers");
const musicFeedback = document.getElementById("musicFeedback");

const correctReveal = document.getElementById("correctReveal");
const revealedSong = document.getElementById("revealedSong");
const revealedArtist = document.getElementById("revealedArtist");

const nextTrackButton = document.getElementById("nextTrackButton");



/* TRACK DATABASE */

const musicTracks = [
    {
        title: "Lightning",
        artist: "Mitski",
        file: "/assets/music/track01.mp3"
    },
    {
        title: "Succession",
        artist: "Nicholas Britell",
        file: "/assets/music/track02.mp3"
    },
    {
        title: "Hysteria",
        artist: "Muse",
        file: "/assets/music/track03.mp3"
    },
    {
        title: "Love You to Death",
        artist: "Type O Negative",
        file: "/assets/music/track04.mp3"
    },
    {
        title: "Gone with the Sin",
        artist: "HIM",
        file: "/assets/music/track05.mp3"
    }
];

const AUDIO_SAMPLE_DURATION = 30;

let currentTrackIndex = 0;
let audioTimerInterval = null;
let sampleEnded = false;
let gameStarted = false;


/* SHUFFLE OPTIONS */

function shuffleArray(array) {

    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[j]] =
            [shuffled[j], shuffled[i]];

    }

    return shuffled;
}


/* FORMAT TIMER */

function formatTime(seconds) {

    const safeSeconds = Math.max(0, Math.ceil(seconds));

    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;

}


/* STOP TIMER */

function stopAudioTimer() {

    clearInterval(audioTimerInterval);

    audioTimerInterval = null;

}


/* OPEN VAULT 02 */

vault2.addEventListener("click", () => {

    if (!isOriginComplete()) return;

    showScreen(musicScreen);

});


/* START GAME */

startMusicGame.addEventListener("click", async () => {

    currentTrackIndex = 0;
    gameStarted = true;

    musicIntro.classList.add("hidden");
    musicCompletion.classList.add("hidden");
    musicGame.classList.remove("hidden");

    await playCurrentTrack();

});


/* PLAY TRACK SAMPLE */

async function playCurrentTrack() {

    stopAudioTimer();

    sampleEnded = false;

    const track = musicTracks[currentTrackIndex];

    answerSection.classList.add("hidden");
    correctReveal.classList.add("hidden");

    audioTitle.textContent = "UNKNOWN FREQUENCY";

    trackCounter.textContent =
        `FILE ${String(currentTrackIndex + 1).padStart(2, "0")} / 05`;

    audioStatus.textContent = "INCOMING TRANSMISSION";

    audioInstruction.textContent =
        "LISTEN CAREFULLY. IDENTIFY THE TRACK.";

    audioTimer.textContent = "00:30";

    audioProgress.style.width = "0%";

    audioVisualizer.classList.remove("playing");

    vaultAudio.pause();

    vaultAudio.src = track.file;

    vaultAudio.load();
    vaultAudio.currentTime = 0;

    try {

        await vaultAudio.play();

        audioVisualizer.classList.add("playing");

        audioStatus.textContent = "TRANSMISSION PLAYING";

        const startTime = Date.now();

        audioTimerInterval = setInterval(() => {

            const elapsed = (Date.now() - startTime) / 1000;

            const remaining = AUDIO_SAMPLE_DURATION - elapsed;

            audioTimer.textContent = formatTime(remaining);

            audioProgress.style.width =
                `${Math.min(elapsed / AUDIO_SAMPLE_DURATION * 100, 100)}%`;

            if (elapsed >= AUDIO_SAMPLE_DURATION) {

                finishAudioSample();

            }

        }, 100);

    } catch (error) {

        stopAudioTimer();

        audioStatus.textContent = "AUDIO PLAYBACK ERROR";

        audioInstruction.textContent =
            "CHECK THE AUDIO FILE PATH AND FORMAT.";

        audioVisualizer.classList.remove("playing");

        console.error("Audio error:", error);

    }

}


/* END 30 SECOND SAMPLE */

function finishAudioSample() {

    if (sampleEnded) return;

    sampleEnded = true;

    stopAudioTimer();

    vaultAudio.pause();

    audioVisualizer.classList.remove("playing");

    audioTimer.textContent = "00:00";

    audioProgress.style.width = "100%";

    audioStatus.textContent = "TRANSMISSION COMPLETE";

    audioInstruction.textContent =
        "IDENTIFY THE UNKNOWN TRACK.";

    showMusicAnswers();

}


/* SHOW FOUR OPTIONS */

function showMusicAnswers() {

    answerSection.classList.remove("hidden");

    musicAnswers.innerHTML = "";

    musicFeedback.textContent = "SELECT THE CORRECT TRACK.";

    const correctTrack = musicTracks[currentTrackIndex];

    const options = shuffleArray(musicTracks);

    options.forEach((track) => {

        const button = document.createElement("button");

        button.className = "music-answer";

        button.textContent = track.title.toUpperCase();

        button.addEventListener("click", () => {

            checkMusicAnswer(button, track, correctTrack);

        });

        musicAnswers.appendChild(button);

    });

}


/* CHECK ANSWER */

function checkMusicAnswer(button, selectedTrack, correctTrack) {

    if (!sampleEnded) return;

    const allButtons =
        musicAnswers.querySelectorAll(".music-answer");

    if (selectedTrack.title === correctTrack.title) {

        allButtons.forEach((item) => {
            item.disabled = true;
        });

        button.classList.add("correct");

        musicFeedback.textContent = "CORRECT. FILE IDENTIFIED.";

        revealCorrectTrack();

    } else {

        button.classList.add("wrong");

        button.disabled = true;

        musicFeedback.textContent =
            "INCORRECT FREQUENCY. TRY AGAIN.";

    }

}


/* CORRECT ANSWER REVEAL */

function revealCorrectTrack() {

    const track = musicTracks[currentTrackIndex];

    musicGame.classList.add("frequency-glitch");

    setTimeout(() => {

        musicGame.classList.remove("frequency-glitch");

        answerSection.classList.add("hidden");

        correctReveal.classList.remove("hidden");

        revealedSong.textContent = track.title;

        revealedArtist.textContent = track.artist;

        audioTitle.textContent = "FILE RESTORED";

        audioStatus.textContent = "IDENTIFICATION CONFIRMED";

    }, 650);

}


/* NEXT TRACK */

nextTrackButton.addEventListener("click", () => {

    currentTrackIndex++;

    if (currentTrackIndex >= musicTracks.length) {

        finishMusicGame();

        return;

    }

    playCurrentTrack();

});


/* COMPLETE VAULT 02 */

function finishMusicGame() {

    stopAudioTimer();

    vaultAudio.pause();

    musicGame.classList.add("hidden");

    musicCompletion.classList.remove("hidden");

    sessionStorage.setItem(MUSIC_STORAGE_KEY, "true");

    unlockVaultThree();

}


/* UNLOCK VAULT 03 */

function unlockVaultThree() {

    const vault3 = document.querySelector('[data-vault="3"]');

    if (!vault3) return;

    vault3.disabled = false;

    vault3.classList.remove("locked");

    vault3.classList.add("unlocked");

    vault3.querySelector(".vault-state").textContent =
        "AVAILABLE";

}


/* RETURN TO HUB */

musicReturnButton.addEventListener("click", () => {

    stopAudioTimer();

    vaultAudio.pause();

    showScreen(hubScreen);

});


/* RESTORE VAULT 03 IF GAME WAS COMPLETED */

if (sessionStorage.getItem(MUSIC_STORAGE_KEY) === "true") {

    unlockVaultThree();

}


/* ================================= */
/* VAULT 03 - THE MEMORY ARCHIVE */
/* ================================= */

const ARCHIVE_STORAGE_KEY = "malak_vault020_archive_complete";
const ARCHIVE_TOTAL = 67;
const ARCHIVE_IMAGE_DURATION = 2000;

const startArchiveButton = document.getElementById("startArchiveButton");
const archiveIntro = document.getElementById("archiveIntro");
const archiveSlideshow = document.getElementById("archiveSlideshow");
const archiveEnding = document.getElementById("archiveEnding");
const archiveImage = document.getElementById("archiveImage");
const archiveCounter = document.getElementById("archiveCounter");
const archiveProgress = document.getElementById("archiveProgress");
const archiveFrame = document.getElementById("archiveFrame");
const archiveAudio = document.getElementById("archiveAudio");
const archiveReturnButton = document.getElementById("archiveReturnButton");

let archiveIndex = 0;
let archiveTimer = null;
let archiveEndingTimer = null;
let archiveFadeTimer = null;
let archiveAudioStartedAt = 0;

function unlockArchiveVault() {
    if (!vault3) return;
    vault3.disabled = false;
    vault3.classList.remove("locked");
    vault3.classList.add("unlocked");
    const state = vault3.querySelector(".vault-state");
    if (state) state.textContent = "AVAILABLE";
}

function openArchiveVault() {
    if (sessionStorage.getItem(MUSIC_STORAGE_KEY) !== "true") return;
    showScreen(archiveScreen);
    archiveIntro.classList.remove("hidden");
    archiveSlideshow.classList.add("hidden");
    archiveEnding.classList.add("hidden");
}

if (vault3) {
    vault3.addEventListener("click", openArchiveVault);
}

function archiveImagePath(index) {
    return `assets/memories/memory${String(index + 1).padStart(2, "0")}.png`;
}

function preloadArchiveImages() {
    for (let i = 1; i <= ARCHIVE_TOTAL; i++) {
        const image = new Image();
        image.src = `assets/memories/memory${String(i).padStart(2, "0")}.png`;
    }
}

function startArchiveRecovery() {
    archiveIndex = 0;
    archiveIntro.classList.add("hidden");
    archiveEnding.classList.add("hidden");
    archiveSlideshow.classList.remove("hidden");

    archiveAudio.pause();
    archiveAudio.currentTime = 0;
    archiveAudio.volume = 0;
    archiveAudioStartedAt = Date.now();

    archiveAudio.play().then(() => {
        let volume = 0;
        const fadeIn = setInterval(() => {
            volume = Math.min(volume + 0.08, 0.75);
            archiveAudio.volume = volume;
            if (volume >= 0.75) clearInterval(fadeIn);
        }, 180);
    }).catch((error) => {
        console.error("Archive audio playback error:", error);
    });

    preloadArchiveImages();
    showArchiveImage();
}

function showArchiveImage() {
    if (archiveIndex >= ARCHIVE_TOTAL) {
        finishArchiveSlideshow();
        return;
    }

    archiveImage.classList.remove("archive-image-in");
    archiveFrame.classList.add("archive-transition");

    window.setTimeout(() => {
        archiveImage.src = archiveImagePath(archiveIndex);
        archiveCounter.textContent =
            `MEMORY ${String(archiveIndex + 1).padStart(2, "0")} / ${ARCHIVE_TOTAL}`;
        archiveProgress.style.width =
            `${((archiveIndex + 1) / ARCHIVE_TOTAL) * 100}%`;

        archiveImage.onload = () => {
            archiveFrame.classList.remove("archive-transition");
            archiveImage.classList.add("archive-image-in");
        };

        archiveImage.onerror = () => {
            console.error("Missing archive image:", archiveImage.src);
            archiveFrame.classList.remove("archive-transition");
        };

        archiveTimer = window.setTimeout(() => {
            archiveIndex++;
            showArchiveImage();
        }, ARCHIVE_IMAGE_DURATION - 180);
    }, 180);
}

function finishArchiveSlideshow() {
    clearTimeout(archiveTimer);
    archiveSlideshow.classList.add("hidden");
    archiveEnding.classList.remove("hidden");

    sessionStorage.setItem(ARCHIVE_STORAGE_KEY, "true");
    // Notify Vault 04 immediately so its door unlocks without a page refresh.
    window.dispatchEvent(new Event("vault03:completed"));

    // The song is 3:03; the slideshow is 2:14.
    // Let the remaining 49 seconds play under the ending, then fade out.
    const elapsed = (Date.now() - archiveAudioStartedAt) / 1000;
    const remaining = Math.max(0, 183 - elapsed);
    const fadeStart = Math.max(0, remaining - 8);

    archiveEndingTimer = window.setTimeout(() => {
        let volume = archiveAudio.volume;
        archiveFadeTimer = window.setInterval(() => {
            volume = Math.max(0, volume - 0.06);
            archiveAudio.volume = volume;
            if (volume <= 0) {
                clearInterval(archiveFadeTimer);
                archiveAudio.pause();
            }
        }, 400);
    }, fadeStart * 1000);
}

function stopArchivePlayback() {
    clearTimeout(archiveTimer);
    clearTimeout(archiveEndingTimer);
    clearInterval(archiveFadeTimer);
    archiveAudio.pause();
    archiveAudio.currentTime = 0;
    archiveAudio.volume = 0.75;
}

startArchiveButton.addEventListener("click", startArchiveRecovery);

archiveReturnButton.addEventListener("click", () => {
    stopArchivePlayback();
    showScreen(hubScreen);
});

if (sessionStorage.getItem(MUSIC_STORAGE_KEY) === "true") {
    unlockArchiveVault();
}
