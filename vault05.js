
/* =========================================================
   VAULT 05 — CLASSIFIED / PROJECT LAST KEY
   Isolated module. Original procedural audio is synthesized
   with Web Audio; no third-party music or external assets.
   ========================================================= */
(() => {
  "use strict";
  const V4_KEY = "malak_vault04_complete";
  const V5_KEY = "malak_vault05_complete";
  const screen = document.getElementById("vault05Screen");
  const door5 = document.querySelector('[data-vault="5"]');
  const door6 = document.querySelector('[data-vault="6"]');
  if (!screen || !door5 || !door6) return;
  const $ = id => document.getElementById(id);
  const scenes = ["v5Intro","v5Archives","v5Echo","v5Revelation","v5Authorization","v5Ending"];
  const FILES = [
    ["VAULT 01 // THE BEGINNING","A geology exam in 2023. One ordinary joke about a teacher's name became the first recovered fragment: JALATA."],
    ["VAULT 02 // THE SOUND","Five tracks were identified by listening. Different sounds, shared taste, and a frequency archive that only the operator could complete."],
    ["VAULT 03 // THE ARCHIVE","Sixty-seven recovered screenshots. Conversations, games, and tiny moments that became a memory archive."],
    ["VAULT 04 // THE SURVIVAL","Four Dwellers, a restored Vault, and a signal beyond the safe zone. The previous Overseer left more behind than expected."]
  ];
  const sequences = [[0,2,1],[1,3,0,2],[2,0,3,1,2]];
  let opened = new Set(JSON.parse(sessionStorage.getItem("malak_vault05_files") || "[]"));
  let round = Number(sessionStorage.getItem("malak_vault05_echo_round") || "0");
  let inputIndex = 0, playing = false, currentSequence = [];
  let audioCtx = null, master = null, audioMuted = false, musicTimer = null;
  let endingTimers = [];

  function setScene(id) {
    scenes.forEach(s => $(s).classList.toggle("hidden", s !== id));
    window.scrollTo({top:0,behavior:"instant"});
  }
  function updateHub() {
    const v4Done = sessionStorage.getItem(V4_KEY) === "true";
    const v5Done = sessionStorage.getItem(V5_KEY) === "true";
    door5.disabled = !v4Done;
    door5.classList.toggle("locked",!v4Done);
    door5.classList.toggle("unlocked",v4Done);
    door5.querySelector(".vault-state").textContent = v4Done ? (v5Done ? "COMPLETED" : "AVAILABLE") : "LOCKED";
    door5.querySelector(".vault-name").textContent = "CLASSIFIED";
    door6.disabled = !v5Done;
    door6.classList.toggle("locked",!v5Done);
    door6.classList.toggle("unlocked",v5Done);
    door6.querySelector(".vault-state").textContent = v5Done ? "AVAILABLE" : "LOCKED";
    door6.querySelector(".vault-name").textContent = v5Done ? "THE FINAL PROTOCOL" : "UNDISCOVERED";
    const p = $("progressText"), c = $("completionCount");
    if(p) p.textContent = v5Done ? "6 / 6 VAULTS AVAILABLE" : v4Done ? "5 / 6 VAULTS AVAILABLE" : "4 / 6 VAULTS AVAILABLE";
    if(c) c.textContent = v5Done ? "83%" : v4Done ? "67%" : "50%";
  }

  // Original, lightweight synthesized soundtrack: low ambient bed + upbeat pulse.
  function initAudio() {
    if (audioCtx) { if(audioCtx.state==="suspended") audioCtx.resume(); master.gain.setTargetAtTime(audioMuted?0:.22,audioCtx.currentTime,.08); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return;
    audioCtx = new AC();
    master = audioCtx.createGain(); master.gain.value = audioMuted ? 0 : 0.22; master.connect(audioCtx.destination);
    const drone = audioCtx.createOscillator(), droneGain = audioCtx.createGain();
    drone.type="triangle"; drone.frequency.value=55; droneGain.gain.value=.10;
    drone.connect(droneGain); droneGain.connect(master); drone.start();
    const shimmer = audioCtx.createOscillator(), shimmerGain=audioCtx.createGain();
    shimmer.type="sine"; shimmer.frequency.value=110; shimmerGain.gain.value=.025;
    shimmer.connect(shimmerGain); shimmerGain.connect(master); shimmer.start();
  }
  function tone(freq,duration=.12,type="sine",volume=.12,delay=0) {
    if(!audioCtx || audioMuted) return;
    const t=audioCtx.currentTime+delay, o=audioCtx.createOscillator(), g=audioCtx.createGain();
    o.type=type;o.frequency.setValueAtTime(freq,t);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(volume,t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+duration);
    o.connect(g);g.connect(master);o.start(t);o.stop(t+duration+.03);
  }
  function sfx(kind) {
    const notes = kind==="unlock"?[392,523,659]:kind==="error"?[180,145]:kind==="success"?[523,659,784]:[330,440];
    notes.forEach((n,i)=>tone(n,.14,"triangle",.12,i*.09));
  }
  function startPulse() {
    stopPulse();
    const notes=[220,277,330,440,330,277,247,330];
    let i=0;
    musicTimer=setInterval(()=>{tone(notes[i%notes.length],.18,"sawtooth",.045);if(i%2===0)tone(notes[i%notes.length]*2,.10,"square",.018,.05);i++;},230);
  }
  function stopPulse(){if(musicTimer){clearInterval(musicTimer);musicTimer=null;}}
  function stopAudio(){stopPulse();if(audioCtx){master.gain.setTargetAtTime(0,audioCtx.currentTime,.18);}}
  function toggleMute(){
    audioMuted=!audioMuted;
    if(master&&audioCtx)master.gain.setTargetAtTime(audioMuted?0:.22,audioCtx.currentTime,.04);
    $("v5Mute").textContent=audioMuted?"♫ SOUND: OFF":"♫ SOUND: ON";
    $("v5Mute").setAttribute("aria-pressed",String(audioMuted));
  }

  function openVault() {
    if(sessionStorage.getItem(V4_KEY)!=="true") return;
    document.querySelectorAll(".screen").forEach(el=>el.classList.add("hidden"));
    screen.classList.remove("hidden");
    initAudio();
    if(sessionStorage.getItem(V5_KEY)==="true") { setScene("v5Ending"); $("v5EndingText").textContent="ALL SYSTEMS VERIFIED."; $("v5FinalTitle").classList.remove("hidden"); $("v5Return").classList.remove("hidden"); }
    else setScene("v5Intro");
  }
  function renderFileCount(){
    $("v5ArchiveCount").textContent=`${opened.size} / 4 RECORDS REVIEWED`;
    sessionStorage.setItem("malak_vault05_files",JSON.stringify([...opened]));
    document.querySelectorAll(".v5-file").forEach(b=>b.classList.toggle("opened",opened.has(Number(b.dataset.file))));
    $("v5ToEcho").disabled=opened.size!==4;
  }
  function showFile(i){
    opened.add(i);
    $("v5RecordTag").textContent=`RECOVERED RECORD // VAULT 0${i+1}`;
    $("v5RecordTitle").textContent=FILES[i][0];
    $("v5RecordText").textContent=FILES[i][1];
    $("v5Record").classList.remove("hidden");
    document.querySelectorAll(".v5-file").forEach(b=>b.classList.toggle("opened",opened.has(Number(b.dataset.file))));
    renderFileCount();sfx("click");
  }
  function beginEcho(){
    round=Math.min(2,Number(sessionStorage.getItem("malak_vault05_echo_round") || "0"));
    startPulse();setScene("v5Echo");prepareRound();
  }
  function lightNode(n,on){
    const b=document.querySelector(`.v5-node[data-node="${n}"]`);
    if(!b)return;
    b.classList.toggle("active",on);
  }
  function prepareRound(){
    playing=true;inputIndex=0;currentSequence=sequences[round].slice();
    $("v5RoundLabel").textContent=`ROUND 0${round+1} / 03`;
    $("v5EchoStatus").textContent="SIGNAL INCOMING";
    $("v5EchoStep").textContent=`SIGNAL: 0 / ${currentSequence.length}`;
    $("v5EchoHint").textContent="OBSERVE THE PATTERN";
    $("v5EchoInstruction").textContent="Watch the signal sequence. When it ends, repeat it in the same order.";
    $("v5SequenceProgress").style.width="0%";
    $("v5EchoContinue").disabled=true;$("v5Replay").disabled=true;
    document.querySelectorAll(".v5-node").forEach(b=>b.disabled=true);
    let idx=0;
    const show=()=>{
      if(idx>=currentSequence.length){
        playing=false;document.querySelectorAll(".v5-node").forEach(b=>b.disabled=false);
        $("v5EchoStatus").textContent="YOUR TURN";$("v5EchoHint").textContent="REPEAT THE SIGNAL";
        $("v5Replay").disabled=false;return;
      }
      const n=currentSequence[idx];lightNode(n,true);tone([330,392,440,523][n],.22,"sine",.13);
      setTimeout(()=>lightNode(n,false),390);idx++;setTimeout(show,650);
    };
    setTimeout(show,650);
  }
  function nodeClick(n){
    if(playing || $("v5EchoContinue").disabled===false) return;
    lightNode(n,true);setTimeout(()=>lightNode(n,false),180);
    tone([330,392,440,523][n],.12,"triangle",.12);
    if(currentSequence[inputIndex]!==n){
      $("v5EchoStatus").textContent="SIGNAL MISMATCH";
      $("v5EchoHint").textContent="NO PENALTY // TRY AGAIN";
      sfx("error");inputIndex=0;$("v5SequenceProgress").style.width="0%";
      $("v5EchoStep").textContent=`SIGNAL: 0 / ${currentSequence.length}`;
      setTimeout(()=>{$("v5EchoStatus").textContent="YOUR TURN";$("v5EchoHint").textContent="YOU CAN DO THIS";},700);
      return;
    }
    inputIndex++;
    $("v5SequenceProgress").style.width=`${inputIndex/currentSequence.length*100}%`;
    $("v5EchoStep").textContent=`SIGNAL: ${inputIndex} / ${currentSequence.length}`;
    if(inputIndex===currentSequence.length){
      $("v5EchoStatus").textContent="SEQUENCE VERIFIED";$("v5EchoHint").textContent="CALIBRATION COMPLETE";
      $("v5EchoContinue").disabled=false;sfx("success");
    }
  }
  function nextRound(){
    round++;
    sessionStorage.setItem("malak_vault05_echo_round",String(round));
    if(round<3){prepareRound();return;}
    sessionStorage.setItem("malak_vault05_echo_complete","true");
    stopPulse();$("v5HiddenNode").classList.remove("hidden");sfx("unlock");
    setTimeout(()=>setScene("v5Revelation"),1500);
  }
  function runEnding(){
    setScene("v5Ending");$("v5Ending").classList.add("reveal");
    const lines=["You have completed every test.","But the final one...","Was never inside this facility."];
    const target=$("v5EndingText");target.textContent="";
    let line=0;
    function typeLine(){
      if(line>=lines.length){
        $("v5FinalTitle").classList.remove("hidden");
        $("v5Return").classList.remove("hidden");
        sessionStorage.setItem(V5_KEY,"true");updateHub();sfx("unlock");return;
      }
      const text=lines[line];let char=0;
      const timer=setInterval(()=>{
        target.textContent+=text[char++]||"";
        if(char>text.length){clearInterval(timer);target.textContent+="\n";line++;setTimeout(typeLine,850);}
      },42);
      endingTimers.push(timer);
    }
    typeLine();
  }

  window.addEventListener("vault04:returned",updateHub);
  door5.addEventListener("click",openVault);
  $("v5Enter").addEventListener("click",()=>{initAudio();tone(220,.3,"triangle",.1);setScene("v5Archives");});
  $("v5Mute").addEventListener("click",toggleMute);
  document.querySelectorAll(".v5-file").forEach(b=>b.addEventListener("click",()=>showFile(Number(b.dataset.file))));
  $("v5CloseRecord").addEventListener("click",()=>$("v5Record").classList.add("hidden"));
  $("v5ToEcho").addEventListener("click",beginEcho);
  document.querySelectorAll(".v5-node").forEach(b=>b.addEventListener("click",()=>nodeClick(Number(b.dataset.node))));
  $("v5Replay").addEventListener("click",prepareRound);
  $("v5EchoContinue").addEventListener("click",nextRound);
  $("v5Authorize").addEventListener("click",()=>setScene("v5Authorization"));
  $("v5Choices").querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{
    if(b.dataset.answer==="PROJECT LAST KEY"){
      $("v5AuthFeedback").textContent="IDENTITY CONFIRMED // LEVEL 06 CLEARANCE GRANTED";
      sfx("success");setTimeout(runEnding,1100);
    } else {
      $("v5AuthFeedback").textContent="ACCESS DENIED // REVIEW THE RECOVERED FILES AND TRY AGAIN.";
      sfx("error");
    }
  }));
  $("v5Return").addEventListener("click",()=>{
    stopAudio();
    document.querySelectorAll(".screen").forEach(el=>el.classList.add("hidden"));
    $("hubScreen").classList.remove("hidden");window.scrollTo({top:0,behavior:"instant"});
  });
  window.addEventListener("beforeunload",stopPulse);
  renderFileCount();
  updateHub();
})();
