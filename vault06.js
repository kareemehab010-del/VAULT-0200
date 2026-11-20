/* VAULT 06 — PROJECT NEBULA */
(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const door = document.querySelector('[data-vault="6"]');
  const screen = $("vault06Screen");
  if (!door || !screen) return;

  const V5_KEY = "malak_vault05_complete";
  const V6_KEY = "malak_vault06_complete";
  const ANSWER = "NEBULA";
  const ROWS = 7, COLS = 6;
  const board = $("v6Board"), keyboard = $("v6Keyboard");
  const feedback = $("v6WordleFeedback");
  const retry = $("v6Retry");
  const wordleScene = $("v6WordleScene");
  const revealScene = $("v6RevealScene");
  const finalScene = $("v6FinalScene");
  const wall = $("v6MemoryWall");
  const video = $("v6Video");
  const song = new Audio("/assets/vault06/audio/birthday-song.mp3");
  song.loop = true;
  song.preload = "auto";
  song.volume = 0.72;
  song.load();

  let current = "";
  let row = 0;
  let locked = false;
  let keyButtons = new Map();
  let videoIndex = 0;
  let photoTimers = [];
  let muted = false;
  let revealStarted = false;
  let videoAdvancePending = false;
  let photosFinished = false;
  let videosFinished = false;
  let completed = sessionStorage.getItem(V6_KEY) === "true";

  function setScene(scene) {
    [wordleScene, revealScene, finalScene].forEach(el => el.classList.add("hidden"));
    scene.classList.remove("hidden");
  }
  function updateDoor() {
    const allowed = sessionStorage.getItem(V5_KEY) === "true";
    door.disabled = !allowed;
    door.classList.toggle("locked", !allowed);
    door.classList.toggle("unlocked", allowed);
    const state = door.querySelector(".vault-state");
    const name = door.querySelector(".vault-name");
    if (state) state.textContent = completed ? "COMPLETED" : (allowed ? "AVAILABLE" : "LOCKED");
    if (name) name.textContent = "PROJECT NEBULA";
  }
  function openVault() {
    if (sessionStorage.getItem(V5_KEY) !== "true") return;
    document.querySelectorAll(".screen").forEach(el => el.classList.add("hidden"));
    screen.classList.remove("hidden");
    window.scrollTo({top:0,behavior:"instant"});
    if (revealStarted) {
      if (finalScene.classList.contains("hidden") && revealScene.classList.contains("hidden")) setScene(revealScene);
    } else {
      resetWordle();
      setScene(wordleScene);
    }
  }

  function buildBoard() {
    board.innerHTML = "";
    for (let r=0;r<ROWS;r++) {
      const line=document.createElement("div"); line.className="v6-word-row";
      for(let c=0;c<COLS;c++){
        const cell=document.createElement("div"); cell.className="v6-cell";
        cell.id=`v6cell-${r}-${c}`; line.appendChild(cell);
      }
      board.appendChild(line);
    }
  }
  const keyboardRows=["QWERTYUIOP","ASDFGHJKL"];
  function buildKeyboard() {
    keyboard.innerHTML=""; keyButtons.clear();
    keyboardRows.forEach(chars=>{
      const line=document.createElement("div");line.className="v6-key-row";
      [...chars].forEach(ch=>addKey(line,ch));
      keyboard.appendChild(line);
    });
    const last=document.createElement("div");last.className="v6-key-row";
    addKey(last,"ENTER",true); [..."ZXCVBNM"].forEach(ch=>addKey(last,ch)); addKey(last,"⌫",true);
    keyboard.appendChild(last);
  }
  function addKey(parent,label,wide=false){
    const b=document.createElement("button");b.type="button";b.className="v6-key"+(wide?" wide":"");b.textContent=label;
    b.addEventListener("click",()=>handleKey(label));
    parent.appendChild(b); if(label.length===1)keyButtons.set(label,b);
  }
  function paintCurrent(){
    for(let c=0;c<COLS;c++){
      const cell=$(`v6cell-${row}-${c}`); cell.textContent=current[c]||"";
      cell.classList.toggle("filled",!!current[c]);
    }
  }
  function handleKey(key){
    if(locked || !wordleScene || wordleScene.classList.contains("hidden"))return;
    if(key==="ENTER"){submitGuess();return;}
    if(key==="⌫" || key==="BACKSPACE"){current=current.slice(0,-1);paintCurrent();return;}
    if(/^[A-Z]$/.test(key) && current.length<COLS){current+=key;paintCurrent();}
  }
  function scoreGuess(guess){
    const result=Array(COLS).fill("absent"), answerChars=ANSWER.split("");
    for(let i=0;i<COLS;i++)if(guess[i]===ANSWER[i]){result[i]="correct";answerChars[i]=null;}
    for(let i=0;i<COLS;i++){
      if(result[i]==="correct")continue;
      const at=answerChars.indexOf(guess[i]);
      if(at!==-1){result[i]="present";answerChars[at]=null;}
    }
    return result;
  }
  function startBackgroundSong(){
    song.loop=true;
    song.muted=muted;
    if(song.paused){
      song.currentTime=0;
      song.play().catch(err=>console.warn("Background song playback blocked:",err));
    }
  }
  function submitGuess(){
    if(current.length!==COLS){feedback.textContent="SIX LETTERS REQUIRED.";return;}
    const guess=current, result=scoreGuess(guess);
    for(let c=0;c<COLS;c++){
      const cell=$(`v6cell-${row}-${c}`);
      cell.textContent=guess[c]; cell.classList.remove("filled");
      cell.classList.add(result[c]);
      const key=keyButtons.get(guess[c]);
      if(key && !key.classList.contains("correct")){
        key.classList.remove("present","absent");
        key.classList.add(result[c]);
      }
    }
    row++; current="";
    if(guess===ANSWER){
      locked=true;feedback.textContent="IDENTITY CONFIRMED // ACCESS GRANTED";
      startBackgroundSong();
      setTimeout(beginReveal,1200);
    } else if(row>=ROWS){
      locked=true;feedback.textContent="ACCESS DENIED // THE IDENTITY IS STILL WITHIN REACH.";
      retry.classList.remove("hidden");
    } else {
      feedback.textContent=`IDENTITY NOT MATCHED // ${ROWS-row} ATTEMPTS REMAINING.`;
    }
  }
  function resetWordle(){
    locked=false;current="";row=0;retry.classList.add("hidden");
    feedback.textContent="ENTER THE SIX-LETTER IDENTITY.";
    buildBoard();buildKeyboard();
  }

  function setSoundButtons(){
    const text=muted?"♫ SOUND OFF":"♫ SOUND ON";
    ["v6SoundToggle","v6SoundToggleFinal"].forEach(id=>{
      const b=$(id);b.textContent=text;b.setAttribute("aria-pressed",String(muted));
    });
    song.muted=muted;
  }
  function toggleSound(){muted=!muted;setSoundButtons();}
  $("v6SoundToggle").addEventListener("click",toggleSound);
  $("v6SoundToggleFinal").addEventListener("click",toggleSound);

  function clearPhotoTimers(){photoTimers.forEach(clearTimeout);photoTimers=[];}
  const PHOTO_TOTAL = 56;
  const PHOTO_WAVES = 4;
  const PHOTOS_PER_WAVE = 14;
  const slotPositions = [
    // Top row: four
    {x:22,y:10},{x:41,y:10},{x:59,y:10},{x:78,y:10},
    // Bottom row: four
    {x:22,y:90},{x:41,y:90},{x:59,y:90},{x:78,y:90},
    // Left side: three
    {x:6,y:29},{x:6,y:50},{x:6,y:71},
    // Right side: three
    {x:94,y:29},{x:94,y:50},{x:94,y:71}
  ];
  let slotImages = [];

  function createMemoryWall(){
    wall.innerHTML="";
    slotImages=[];
    slotPositions.forEach((pos,slot)=>{
      const img=document.createElement("img");
      img.className="v6-memory-photo v6-slot-photo";
      img.alt=`Memory slot ${slot+1}`;
      img.loading="eager";
      img.style.left=`${pos.x}%`;
      img.style.top=`${pos.y}%`;
      img.style.setProperty("--tilt",`${(slot%5-2)*2.1}deg`);
      wall.appendChild(img);
      slotImages.push(img);
    });
  }
  function revealPhotos(){
    clearPhotoTimers();
    let completed = 0;
    const waveGap = 1450;
    const imageGap = 390;
    for(let wave=0;wave<PHOTO_WAVES;wave++){
      for(let slot=0;slot<PHOTOS_PER_WAVE;slot++){
        const index=wave*PHOTOS_PER_WAVE+slot;
        const delay=wave*(PHOTOS_PER_WAVE*imageGap+waveGap)+slot*imageGap;
        const timer=setTimeout(()=>{
          const img=slotImages[slot];
          img.classList.remove("visible");
          const onReady=()=>{
            img.classList.add("visible");
            img.classList.remove("replacing");
          };
          img.onload=onReady;
          img.onerror=()=>{img.classList.add("visible");img.classList.remove("replacing");};
          img.src=`/assets/vault06/images/photo${String(index+1).padStart(2,"0")}.jpg`;
          if(img.complete && img.naturalWidth) onReady();
          $("v6WaveLabel").textContent=`MEMORY WAVE 0${wave+1} / 04`;
          $("v6PhotoCount").textContent=`${String(index+1).padStart(2,"0")} / 56`;
          $("v6WaveProgress").style.width=`${((index+1)/PHOTO_TOTAL)*100}%`;
          completed++;
        },delay);
        photoTimers.push(timer);
      }
    }
    const totalDuration=(PHOTO_WAVES-1)*(PHOTOS_PER_WAVE*imageGap+waveGap)+(PHOTOS_PER_WAVE-1)*imageGap+900;
    const end=setTimeout(()=>{
      $("v6WaveLabel").textContent="ALL FOUR WAVES RECOVERED";
      photosFinished=true;
      buildFinalPhotoStack();
      maybeFinishReveal();
    },totalDuration);
    photoTimers.push(end);
  }
  function buildFinalPhotoStack(){
    // Keep the 14-photo frame layout during playback; only after all waves,
    // gather all 56 memories into layered stacks at their original positions.
    wall.innerHTML="";
    for(let i=0;i<PHOTO_TOTAL;i++){
      const slot=i%PHOTOS_PER_WAVE;
      const layer=Math.floor(i/PHOTOS_PER_WAVE);
      const pos=slotPositions[slot];
      const img=document.createElement("img");
      img.className="v6-memory-photo v6-slot-photo v6-stacked-photo visible";
      img.src=`/assets/vault06/images/photo${String(i+1).padStart(2,"0")}.jpg`;
      img.alt=`Memory ${i+1}`;
      img.style.left=`${pos.x}%`;
      img.style.top=`${pos.y}%`;
      img.style.setProperty("--stack-x",`${(layer-1.5)*5}px`);
      img.style.setProperty("--stack-y",`${(layer-1.5)*-5}px`);
      img.style.setProperty("--stack-tilt",`${(layer-1.5)*2.5 + (slot%3-1)*2}deg`);
      img.style.zIndex=String(10+layer);
      wall.appendChild(img);
    }
    wall.classList.add("v6-wall-stacked");
  }
  const videoFiles=["meeting.mp4",...Array.from({length:14},(_,i)=>`video${String(i+2).padStart(2,"0")}.mp4`)];
  function skipBrokenVideo(index){
    if(videoAdvancePending)return;
    videoAdvancePending=true;
    $("v6VideoStatus").textContent="SKIPPING UNAVAILABLE VIDEO";
    setTimeout(()=>playVideo(index+1),500);
  }
  function playVideo(index){
    videoAdvancePending=false;
    if(index>=videoFiles.length){videosFinished=true;maybeFinishReveal();return;}
    videoIndex=index;
    const label=index===0?"MEETING":`MEMORY VIDEO ${String(index+1).padStart(2,"0")}`;
    $("v6VideoLabel").textContent=`${label} // ${String(index+1).padStart(2,"0")} / 15`;
    $("v6VideoStatus").textContent="PLAYING";
    $("v6VideoOverlay").classList.add("hidden");
    video.pause();video.muted=true;video.src=`/assets/vault06/videos/${videoFiles[index]}`;
    video.currentTime=0;video.load();
    const playAttempt=video.play();
    if(playAttempt && playAttempt.catch)playAttempt.catch(err=>{
      console.warn("Video playback issue:",videoFiles[index],err);
      skipBrokenVideo(index);
    });
  }
  video.addEventListener("ended",()=>{if(!videoAdvancePending)playVideo(videoIndex+1);});
  video.addEventListener("error",()=>{if(video.src)skipBrokenVideo(videoIndex);});
  function maybeFinishReveal(){
    if(photosFinished && videosFinished) finishVideos();
  }
  function finishVideos(){
    if(finalScene.classList.contains("hidden")===false)return;
    video.pause();video.removeAttribute("src");video.load();
    revealScene.classList.add("hidden");
    setScene(finalScene);
    $("v6BirthdayButton").classList.remove("hidden");
  }
  function beginReveal(){
    if(revealStarted)return;
    revealStarted=true;
    setScene(revealScene);
    createMemoryWall();
    revealPhotos();
    photosFinished=false;videosFinished=false;
    startBackgroundSong();
    video.muted=true;
    playVideo(0);
  }
  $("v6Retry").addEventListener("click",resetWordle);
  $("v6Back").addEventListener("click",()=>{
    document.querySelectorAll(".screen").forEach(el=>el.classList.add("hidden"));
    $("hubScreen").classList.remove("hidden");window.scrollTo({top:0,behavior:"instant"});
  });
  $("v6BirthdayButton").addEventListener("click",()=>{
    $("v6BirthdayButton").classList.add("hidden");
    $("v6BirthdayMessage").classList.remove("hidden");
    $("v6ReturnHub").classList.remove("hidden");
    completed=true;sessionStorage.setItem(V6_KEY,"true");updateDoor();
  });
  $("v6ReturnHub").addEventListener("click",()=>{
    song.pause();song.currentTime=0;video.pause();
    document.querySelectorAll(".screen").forEach(el=>el.classList.add("hidden"));
    $("hubScreen").classList.remove("hidden");window.scrollTo({top:0,behavior:"instant"});
  });
  door.addEventListener("click",openVault);
  document.addEventListener("keydown",e=>{
    if(wordleScene.classList.contains("hidden") || screen.classList.contains("hidden"))return;
    if(e.key==="Enter"){e.preventDefault();handleKey("ENTER");}
    else if(e.key==="Backspace"){e.preventDefault();handleKey("BACKSPACE");}
    else if(/^[a-zA-Z]$/.test(e.key))handleKey(e.key.toUpperCase());
  });
  buildBoard();buildKeyboard();setSoundButtons();updateDoor();
  window.addEventListener("vault05:completed",updateDoor);
})();
