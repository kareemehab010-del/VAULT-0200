
/* =========================================================
   VAULT 04 — THE WASTELAND
   Self-contained game logic. Does not modify Vaults 01–03.
   ========================================================= */
(() => {
  "use strict";
  const COMPLETE_KEY = "malak_vault04_complete";
  const ARCHIVE_KEY = "malak_vault020_archive_complete";
  const screen = document.getElementById("vault04Screen");
  if (!screen) return;

  const $ = (id) => document.getElementById(id);
  const vault4Door = document.getElementById("vault4");
  const vault5Door = document.querySelector('[data-vault="5"]');
  const names = {ada:"ADA-7",boone:"BOONE",pip:"PIP",rook:"ROOK"};
  const stats = {
    ada:{str:5,int:2,lck:2,room:"power"},
    boone:{str:2,int:5,lck:2,room:"water"},
    pip:{str:2,int:2,lck:5,room:"standby"},
    rook:{str:3,int:3,lck:3,room:"standby"}
  };
  const roomInfo = {
    power:{title:"POWER GENERATOR",desc:"The old reactor is holding steady. Its output depends on the strength of the assigned crew.",state:"ONLINE"},
    water:{title:"WATER TREATMENT",desc:"Filtration is active. Intelligence improves the plant's efficiency.",state:"ONLINE"},
    diner:{title:"DINER",desc:"The kitchen is damaged. Restore it to restart the food supply.",state:"DAMAGED"},
    radio:{title:"RADIO STATION",desc:"A sealed communications room. Its antenna may still be able to reach the outside world.",state:"LOCKED"}
  };
  let state = {
    power:60, water:45, food:45, morale:70,
    dinerFixed:false, radioFixed:false, radioActivated:false,
    suppliesSecured:false, eventOne:false, eventTwo:false,
    selectedDweller:null, selectedRoom:null, expeditionDone:false,
    paused:false, started:false
  };
  let team = [];
  let productionReady = {power:true,water:true,food:true};
  let simTimer = null;
  let eventCount = 0;

  function addLog(message) {
    const log = $("v4Log");
    const p = document.createElement("p");
    const stamp = new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
    p.textContent = `${stamp} // ${message}`;
    log.prepend(p);
    while (log.children.length > 7) log.lastElementChild.remove();
  }
  function clamp(n){ return Math.max(0,Math.min(100,n)); }
  function renderResources(){
    ["Power","Water","Food","Morale"].forEach(k => $( "v4"+k ).textContent = state[k.toLowerCase()]);
    $("v4RepairMark").textContent = state.dinerFixed ? "✓" : "○";
    $("v4SupplyMark").textContent = state.suppliesSecured ? "✓" : "○";
    $("v4RadioMark").textContent = state.radioActivated ? "✓" : "○";
    $("v4VaultCondition").textContent = state.radioActivated ? "SIGNAL LOCKED" : state.dinerFixed ? "SYSTEMS RECOVERING" : "SYSTEMS UNSTABLE";
  }
  function roomForDweller(id){ return stats[id].room; }
  function roomLabel(room){ return ({power:"GENERATOR",water:"WATER PLANT",diner:"DINER",radio:"RADIO ROOM",standby:"STANDBY"})[room]; }
  function renderCrew(){
    Object.keys(stats).forEach(id => {
      const el = document.querySelector(`.v4-dweller[data-dweller="${id}"]`);
      if (el) el.querySelector("em").textContent = roomLabel(stats[id].room);
    });
    ["power","water","diner","radio"].forEach(room => {
      const count = Object.values(stats).filter(x=>x.room===room).length;
      const target = $("v4"+room.charAt(0).toUpperCase()+room.slice(1)+"Crew");
      if(target) target.textContent = `${count} DWELLER${count===1?"":"S"}`;
    });
  }
  function renderRooms(){
    $("v4DinerState").textContent = state.dinerFixed ? "OPERATIONAL" : "DAMAGED";
    $("v4RadioState").textContent = state.radioActivated ? "TRANSMITTING" : state.radioFixed ? "READY" : "LOCKED";
    document.querySelector('[data-room="diner"]').classList.toggle("damaged-room",!state.dinerFixed);
    document.querySelector('[data-room="radio"]').classList.toggle("locked-room",!state.suppliesSecured && !state.radioFixed);
    document.querySelector('[data-room="radio"]').disabled = !state.suppliesSecured && !state.radioFixed;
    document.querySelector('[data-room="diner"]').classList.toggle("selected",state.selectedRoom==="diner");
    document.querySelectorAll(".v4-room").forEach(el=>el.classList.toggle("selected",el.dataset.room===state.selectedRoom));
    renderCrew();
  }
  function showPanel(title,desc,actions=[]){
    $("v4RoomTitle").textContent=title;
    $("v4RoomDesc").textContent=desc;
    const box=$("v4RoomActions"); box.innerHTML="";
    actions.forEach(a=>{
      const b=document.createElement("button");
      b.className="v4-action";b.textContent=a.label;b.disabled=!!a.disabled;
      b.addEventListener("click",a.run);box.appendChild(b);
    });
  }
  function inspectRoom(room){
    if(room==="radio"&&!state.suppliesSecured&&!state.radioFixed) return;
    state.selectedRoom=room; renderRooms();
    const crew=Object.entries(stats).filter(([,v])=>v.room===room).map(([id])=>names[id]).join(", ")||"No assigned Dwellers";
    const actions=[];
    if(room==="diner"&&!state.dinerFixed) actions.push({label:"REPAIR DINER // 15 POWER",disabled:state.power<15,run:repairDiner});
    if(room==="radio"&&!state.radioFixed) actions.push({label:"REPAIR RADIO // 20 POWER",disabled:state.power<20,run:repairRadio});
    if(room==="radio"&&state.radioFixed&&!state.radioActivated) actions.push({label:"ACTIVATE LONG-RANGE TRANSMITTER",run:activateRadio});
    if(["power","water","diner"].includes(room) && (room!=="diner"||state.dinerFixed)){
      actions.push({label:"COLLECT PRODUCTION",run:()=>collect(room)});
    }
    actions.push({label:"ASSIGN SELECTED DWELLER HERE",disabled:!state.selectedDweller,run:()=>assignSelected(room)});
    showPanel(roomInfo[room].title,`${roomInfo[room].desc} Crew: ${crew}.`,actions);
  }
  function selectDweller(id){
    state.selectedDweller=id;
    document.querySelectorAll(".v4-dweller").forEach(el=>el.classList.toggle("active",el.dataset.dweller===id));
    $("v4Hint").textContent=`${names[id]} SELECTED // NOW CHOOSE A ROOM.`;
    if(state.selectedRoom) inspectRoom(state.selectedRoom);
  }
  function assignSelected(room){
    const id=state.selectedDweller;
    if(!id || (room==="radio"&&!state.radioFixed) || (room==="diner"&&!state.dinerFixed)) return;
    if(Object.values(stats).filter(x=>x.room===room).length>=2){
      addLog("ROOM AT CAPACITY. MOVE A DWELLER ELSEWHERE."); return;
    }
    stats[id].room=room; state.selectedDweller=null;
    document.querySelectorAll(".v4-dweller").forEach(el=>el.classList.remove("active"));
    renderRooms(); addLog(`${names[id]} reassigned to ${roomLabel(room)}.`);
    inspectRoom(room);
    checkSupplyStatus();
  }
  function repairDiner(){
    if(state.power<15||state.dinerFixed)return;
    state.power-=15;state.dinerFixed=true;renderResources();renderRooms();
    addLog("DINER RESTORED. FOOD PRODUCTION ONLINE.");
    $("v4Hint").textContent="DINER RESTORED. ASSIGN A DWELLER TO START FOOD PRODUCTION.";
    inspectRoom("diner");
    maybeEventOne();
  }
  function repairRadio(){
    if(state.power<20||state.radioFixed)return;
    state.power-=20;state.radioFixed=true;renderResources();renderRooms();
    addLog("RADIO ROOM REPAIRED. TRANSMITTER STANDBY.");
    inspectRoom("radio");
    if(!state.eventTwo) triggerWaterEvent();
  }
  function collect(room){
    if (!productionReady[room]) { addLog(`${roomLabel(room)} IS RECHARGING. WAIT FOR THE NEXT PRODUCTION CYCLE.`); return; }
    const crew=Object.entries(stats).filter(([,v])=>v.room===room).map(([id])=>id);
    if(!crew.length){addLog(`NO CREW ASSIGNED TO ${roomLabel(room)}.`);return;}
    const bonus=crew.reduce((sum,id)=>sum+(room==="power"?stats[id].str:room==="water"?stats[id].int:stats[id].luck),0);
    const amount=Math.max(5,Math.min(24,Math.round(5+bonus*1.5)));
    const key=room==="power"?"power":room==="water"?"water":"food";
    state[key]=clamp(state[key]+amount);
    productionReady[room]=false;
    window.setTimeout(()=>{productionReady[room]=true;if(state.selectedRoom===room)inspectRoom(room);},12000);
    renderResources();addLog(`${roomLabel(room)} produced +${amount} ${key.toUpperCase()}.`);
    checkSupplyStatus();
    if(room==="diner"&&!state.eventOne) maybeEventOne();
    if(room==="power"||room==="water") $("v4Hint").textContent="SUPPLIES RECOVERED. CHECK THE DINER AND RADIO.";
    inspectRoom(room);
  }
  function checkSupplyStatus(){
    const staffed=["power","water","diner"].every(r=>Object.values(stats).some(v=>v.room===r)) && state.dinerFixed;
    if(staffed && state.food>=50 && state.water>=50 && state.power>=20){
      state.suppliesSecured=true;renderResources();renderRooms();
      $("v4Mission").querySelector("h2").textContent="SUPPLIES STABILIZED";
      addLog("PRIMARY SUPPLIES STABILIZED. RADIO ACCESS AUTHORIZED.");
    }
  }
  function showModal(tag,title,text,choices){
    $("v4ModalTag").textContent=tag;$("v4ModalTitle").textContent=title;$("v4ModalText").textContent=text;
    const wrap=$("v4ModalChoices");wrap.innerHTML="";
    choices.forEach(c=>{
      const b=document.createElement("button");b.textContent=c.label;
      b.addEventListener("click",()=>{$("v4Modal").classList.add("hidden");c.run();});
      wrap.appendChild(b);
    });
    $("v4Modal").classList.remove("hidden");
  }
  function maybeEventOne(){
    if(state.eventOne||!state.dinerFixed)return;
    state.eventOne=true;
    showModal("UNEXPECTED GUEST // EVENT 01","SOMEONE IS AT THE INNER DOOR",
      "A small maintenance bot rolls into the room carrying a sealed lunch tin. Its speaker crackles: “I was told to deliver this to whoever fixed the kitchen.”",
      [{label:"ACCEPT THE MYSTERY SUPPLY (+15 FOOD, +5 MORALE)",run:()=>{state.food=clamp(state.food+15);state.morale=clamp(state.morale+5);renderResources();addLog("MYSTERY LUNCH TIN ACCEPTED. FOOD +15.");}},
       {label:"CHECK IT FOR A TRAP FIRST (+5 POWER)",run:()=>{state.power=clamp(state.power+5);renderResources();addLog("TIN SCAN COMPLETE. A SPARE POWER CELL WAS INSIDE.");}}]);
  }
  function triggerWaterEvent(){
    if(state.eventTwo)return;state.eventTwo=true;
    showModal("SYSTEM ALERT // EVENT 02","THE WATER ISN'T CLEAR",
      "The filtration monitor detects an unfamiliar mineral pattern. The water is safe for now, but the filter needs a decision.",
      [{label:"RUN A FULL PURGE (-5 POWER, +10 MORALE)",run:()=>{state.power=Math.max(0,state.power-5);state.morale=clamp(state.morale+10);renderResources();addLog("FILTER PURGE COMPLETE. WATER QUALITY VERIFIED.");}},
       {label:"HAVE BOONE ANALYZE IT (+10 WATER)",run:()=>{state.water=clamp(state.water+10);renderResources();addLog("BOONE IDENTIFIED A SAFE FILTER BYPASS. WATER +10.");}}]);
  }
  function activateRadio(){
    if(!state.radioFixed)return;
    state.radioActivated=true;renderRooms();renderResources();
    addLog("LONG-RANGE SIGNAL ACQUIRED. EXPEDITION COORDINATES FOUND.");
    $("v4Game").classList.add("hidden");$("v4Expedition").classList.remove("hidden");
    $("v4PhaseLabel").textContent="EXPEDITION PREPARATION";
  }
  function updateTeam(){
    document.querySelectorAll(".v4-team-card").forEach(el=>el.classList.toggle("selected",team.includes(el.dataset.team)));
    $("v4TeamHint").textContent=`${team.length} / 2 SELECTED`;
    $("v4Launch").disabled=team.length!==2;
  }
  function launchExpedition(){
    if(team.length!==2)return;
    const strength=team.reduce((n,id)=>n+stats[id].str,0);
    const intelligence=team.reduce((n,id)=>n+stats[id].int,0);
    const luck=team.reduce((n,id)=>n+stats[id].lck,0);
    $("v4Expedition").classList.add("hidden");
    showModal("EXPEDITION // STAGE 01","THE RELAY STATION",
      ` ${names[team[0]]} and ${names[team[1]]} reach the relay station. Strength ${strength}, Intelligence ${intelligence}, Luck ${luck}. A locked service hatch blocks the entrance.`,
      [{label:"USE INTELLIGENCE TO DECODE THE PANEL",run:()=>expeditionChoice("decode",intelligence)},
       {label:"FORCE THE SERVICE HATCH",run:()=>expeditionChoice("force",strength)}]);
  }
  function expeditionChoice(method,score){
    const bonus=method==="decode"?10:5;
    state.food=clamp(state.food+bonus+(score>=7?5:0));
    showModal("EXPEDITION // STAGE 02","A MESSAGE IN THE STATIC",
      "Inside the relay, the team finds a working terminal. It contains a message recorded by the Vault's previous Overseer.",
      [{label:"PLAY THE RECORDING",run:()=>finishExpedition()}]);
  }
  function finishExpedition(){
    state.expeditionDone=true;
    $("v4Expedition").classList.add("hidden");$("v4Game").classList.add("hidden");$("v4Ending").classList.remove("hidden");
    sessionStorage.setItem(COMPLETE_KEY,"true");
    addLog("EXPEDITION COMPLETE. ACHIEVEMENT AWARDED.");
  }
  function begin(){
    state.started=true;$("v4Intro").classList.add("hidden");$("v4Game").classList.remove("hidden");
    renderResources();renderRooms();addLog("OVERSEER CONTROL ACCEPTED.");
    showPanel("VAULT OVERVIEW","Four Dwellers are waiting for instructions. Restore the Diner, stabilize supplies, then bring the radio online.");
    simTimer=window.setInterval(()=>{
      if(state.paused||!state.started||state.expeditionDone)return;
      // Gentle simulation drain, balanced for a short play session.
      state.food=Math.max(0,state.food-1);state.water=Math.max(0,state.water-1);
      if(state.food===0||state.water===0)state.morale=Math.max(0,state.morale-1);
      renderResources();
    },18000);
  }
  function open(){
    if(sessionStorage.getItem(ARCHIVE_KEY)!=="true")return;
    document.querySelectorAll(".screen").forEach(el=>el.classList.add("hidden"));
    screen.classList.remove("hidden");
    window.scrollTo({top:0,behavior:"instant"});
    if(sessionStorage.getItem(COMPLETE_KEY)==="true"){
      $("v4Intro").classList.add("hidden");$("v4Game").classList.add("hidden");$("v4Expedition").classList.add("hidden");$("v4Ending").classList.remove("hidden");
    }
  }
  // Reflect the sequential progression in the existing hub without changing earlier Vault logic.
  const archiveCompleteAtLoad = sessionStorage.getItem(ARCHIVE_KEY)==="true";
  const v4CompleteAtLoad = sessionStorage.getItem(COMPLETE_KEY)==="true";
  if (archiveCompleteAtLoad) {
    const progress = document.getElementById("progressText");
    const completion = document.getElementById("completionCount");
    if (progress) progress.textContent = "4 / 6 VAULTS AVAILABLE";
    if (completion) completion.textContent = v4CompleteAtLoad ? "67%" : "50%";
  }
  if(vault4Door){
    const unlocked=sessionStorage.getItem(ARCHIVE_KEY)==="true";
    vault4Door.disabled=!unlocked;
    if(unlocked){vault4Door.classList.remove("locked");vault4Door.classList.add("unlocked");vault4Door.querySelector(".vault-state").textContent="AVAILABLE";vault4Door.querySelector(".vault-name").textContent="THE WASTELAND";}
    vault4Door.addEventListener("click",open);
  }
  document.querySelectorAll(".v4-room").forEach(el=>el.addEventListener("click",()=>inspectRoom(el.dataset.room)));
  document.querySelectorAll(".v4-dweller").forEach(el=>el.addEventListener("click",()=>selectDweller(el.dataset.dweller)));
  document.querySelectorAll(".v4-team-card").forEach(el=>el.addEventListener("click",()=>{
    const id=el.dataset.team;
    if(team.includes(id))team=team.filter(x=>x!==id);else if(team.length<2)team.push(id);
    updateTeam();
  }));
  $("v4Begin").addEventListener("click",begin);
  $("v4Launch").addEventListener("click",launchExpedition);
  $("v4Return").addEventListener("click",()=>{
    document.querySelectorAll(".screen").forEach(el=>el.classList.add("hidden"));
    document.getElementById("hubScreen").classList.remove("hidden");
    window.scrollTo({top:0,behavior:"instant"});
    window.dispatchEvent(new Event("vault04:returned"));
  });
  $("v4Pause").addEventListener("click",()=>{
    state.paused=!state.paused;$("v4Pause").textContent=state.paused?"RESUME SIMULATION":"PAUSE SIMULATION";
    addLog(state.paused?"SIMULATION PAUSED.":"SIMULATION RESUMED.");
  });
  $("v4Help").addEventListener("click",()=>showModal("FIELD NOTES","OVERSEER QUICK GUIDE",
    "Select a Dweller, then select a room to assign them. Repair the Diner for 15 Power. Assign one Dweller to each production room and collect supplies. Repair the Radio for 20 Power, activate it, choose two explorers, and complete the expedition.",
    [{label:"UNDERSTOOD",run:()=>{}}]));
  // Vault 03 can complete while this script is already loaded; refresh the
  // hub door and progress immediately when its completion event fires.
  function refreshVault04Unlock() {
    const unlocked = sessionStorage.getItem(ARCHIVE_KEY) === "true";
    if (vault4Door) {
      vault4Door.disabled = !unlocked;
      vault4Door.classList.toggle("locked", !unlocked);
      vault4Door.classList.toggle("unlocked", unlocked);
      const stateLabel = vault4Door.querySelector(".vault-state");
      const nameLabel = vault4Door.querySelector(".vault-name");
      if (stateLabel) stateLabel.textContent = unlocked ? "AVAILABLE" : "LOCKED";
      if (nameLabel && unlocked) nameLabel.textContent = "THE WASTELAND";
    }
    if (unlocked) {
      const progress = document.getElementById("progressText");
      const completion = document.getElementById("completionCount");
      if (progress) progress.textContent = "4 / 6 VAULTS AVAILABLE";
      if (completion) completion.textContent =
        sessionStorage.getItem(COMPLETE_KEY) === "true" ? "67%" : "50%";
    }
  }
  window.addEventListener("vault03:completed", refreshVault04Unlock);
  window.addEventListener("vault04:returned", refreshVault04Unlock);

  // Initial state for return visits and archive progression.
  renderResources();renderRooms();
  window.addEventListener("beforeunload",()=>{if(simTimer)clearInterval(simTimer);});
})();
