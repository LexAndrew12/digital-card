import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const firebaseConfig={apiKey:"AIzaSyB4scm4BHDr_itNL2Ppw3VT1RE3tXkLwfo",authDomain:"sanyi-os.firebaseapp.com",projectId:"sanyi-os",storageBucket:"sanyi-os.firebasestorage.app",messagingSenderId:"957587817233",appId:"1:957587817233:web:f6748d9a518bca9a2742b0"};
const app=initializeApp(firebaseConfig);
const auth=getAuth(app);
const db=getFirestore(app);
const provider=new GoogleAuthProvider();
let user=null;
let cloudWaterings=[];

const fmt=d=>new Intl.DateTimeFormat('hu-HU',{year:'numeric',month:'short',day:'numeric'}).format(d);
function daysUntil(d){return Math.max(0,Math.ceil((d-Date.now())/86400000));}
function renderPlant(){
  const sorted=[...cloudWaterings].sort((a,b)=>b.date-a.date);
  const last=sorted[0]?.date;
  const total=sorted.length;
  const summary=document.getElementById('plantSummary');
  const lastEl=document.getElementById('plantLast');
  const nextEl=document.getElementById('plantNext');
  const totalEl=document.getElementById('pTotal');
  const daysEl=document.getElementById('pDays');
  const coming=document.getElementById('coming');
  if(totalEl) totalEl.textContent=total;
  if(!last){
    if(summary) summary.textContent='Még nincs felhős öntözés rögzítve.';
    if(lastEl) lastEl.textContent='Nincs adat';
    if(nextEl) nextEl.textContent='Következő öntözés még nincs kiszámolva.';
    if(daysEl) daysEl.textContent='—';
    return;
  }
  const next=new Date(last.getTime()+7*86400000);
  const left=daysUntil(next);
  if(summary) summary.textContent=`Utoljára: ${fmt(last)} · következő: ${fmt(next)}`;
  if(lastEl) lastEl.textContent=fmt(last);
  if(nextEl) nextEl.textContent=`Következő öntözés: ${fmt(next)}`;
  if(daysEl) daysEl.textContent=left;
  if(coming) coming.innerHTML=`<div class="item"><div class="ico">🪴</div><div class="grow"><b>Növény öntözés</b><small>${left===0?'Ma esedékes':left+' nap múlva'} · ${fmt(next)}</small></div><span class="tag">Cloud</span></div>`;
}
async function loadWaterings(){
  if(!user) return;
  try{
    const snap=await getDocs(query(collection(db,'plantWaterings'),orderBy('wateredAt','desc')));
    cloudWaterings=snap.docs.map(d=>{const x=d.data();return {id:d.id,date:x.wateredAt?.toDate?.()||new Date(0)}}).filter(x=>x.date.getTime()>0);
    renderPlant();
    const status=document.querySelector('.status'); if(status) status.textContent='● Firebase connected · v0.2';
  }catch(e){console.error(e); if(window.toast) window.toast('Firestore olvasási hiba');}
}
async function ensureUser(){
  if(user) return user;
  const r=await signInWithPopup(auth,provider); user=r.user; return user;
}
window.water=async function(){
  try{
    const u=await ensureUser();
    await addDoc(collection(db,'plantWaterings'),{type:'plant_watering',wateredAt:serverTimestamp(),createdBy:u.uid,source:'sanyi-os-dashboard'});
    if(window.toast) window.toast('🪴 Öntözés mentve a felhőbe');
    setTimeout(loadWaterings,700);
  }catch(e){console.error(e); if(window.toast) window.toast('Nem sikerült menteni');}
};
onAuthStateChanged(auth,u=>{user=u;if(u) loadWaterings(); else {const status=document.querySelector('.status');if(status) status.textContent='● Google login szükséges · v0.2';}});
