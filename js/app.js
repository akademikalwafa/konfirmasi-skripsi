// Konfirmasi Skripsi — SPA vanilla JS. Navigasi 0ms, optimistic UI, cache lokal, sinkron latar belakang.
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const S={kode:'',boot:null,prodi:'',cur:null,d:null,dec:{},pf:{},tok:localStorage.tok||'',adm:null,det:null,pg:0};
const NF=['nama','nim','tempat','tgl','judul'],FL=[['nama','Nama Lengkap'],['nim','NIM'],['prodi','Program Studi'],['tempat','Tempat Lahir'],['tgl','Tanggal Lahir'],['judul','Judul Skripsi Final']];
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ini=n=>n.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
const tm=w=>w?new Date(w).toLocaleString('id-ID',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}):'-';
const DONE='Sudah Konfirmasi',lat=(r,f)=>r.k[f]||r.a[f],nk=r=>NF.filter(f=>r.k[f]).length;
function toast(m,t){const e=$('#toast');e.textContent=m;e.className='show '+(t||'');clearTimeout(toast.t);toast.t=setTimeout(()=>e.className='',2800)}
function show(id){$$('.view').forEach(v=>v.classList.toggle('active',v.id==='v-'+id));scrollTo(0,0)}
async function api(action,p={}){const r=await fetch(GAS_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,...p})});const j=await r.json();if(!j.success)throw new Error(j.message);return j.data}
const busy=(b,on)=>{b=$(b);b.disabled=on;b.style.opacity=on?.6:1};

// ===== MAHASISWA =====
async function mhsLogin(){const ins=$$('.pin input'),kode=ins.map(x=>x.value).join('');if(kode.length<4)return toast('Masukkan 4 digit kode','err');
 busy('#btnKode',1);try{S.boot=await api('mhsBoot',{kode});S.kode=kode;S.prodi='';ins.forEach(x=>x.value='');$('#btnProdi').disabled=true;renderProdi();show('prodi')}catch(e){toast(e.message,'err')}busy('#btnKode',0)}
function renderProdi(){$('#prodiList').innerHTML=S.boot.prodi.map(p=>`<div class="card sel ${S.prodi===p.n?'on':''}" data-p="${esc(p.n)}"><b>${esc(p.n)}</b><small>${p.total} mahasiswa</small><div class="bar"><i style="width:${p.done/p.total*100}%"></i></div><small>${p.done} selesai · ${p.total-p.done} menunggu</small></div>`).join('');
 $$('#prodiList .sel').forEach(el=>el.onclick=()=>{S.prodi=el.dataset.p;renderProdi();$('#btnProdi').disabled=false})}
function renderNama(){const q=$('#q').value.toLowerCase(),l=S.boot.mhs.filter(m=>m.prodi===S.prodi&&(m.nama+m.nim).toLowerCase().includes(q));
 $('#namaProdi').textContent=S.prodi;$('#namaInfo').textContent=`Menampilkan ${l.length} mahasiswa · ${l.filter(m=>m.status===DONE).length} sudah selesai`;
 $('#namaList').innerHTML=l.map(m=>{const d=m.status===DONE;return`<div class="card nm ${d?'lock':''}" data-id="${m.id}"><span class="av">${ini(m.nama)}</span><div><b>${esc(m.nama)}${d?' 🔒':''}</b><small>NIM: ${esc(m.nim)}</small></div><span class="pill ${d?'ok':'wait'}">${d?'Sudah Dikonfirmasi':'Belum Dikonfirmasi'}</span>${m.ij&&!d?'<small style="grid-column:2">📄 Wajib unggah PDF ijazah</small>':''}${m.nj&&!d?'<small style="grid-column:2;color:#b91c1c">⛔ Judul belum tersedia</small>':''}</div>`}).join('')||'<p class="mut">Tidak ada nama.</p>';
 $$('#namaList .nm').forEach(el=>{const id=el.dataset.id;el.onpointerdown=()=>{if(!el.classList.contains('lock')&&!S.pf[id])S.pf[id]=api('mhsGet',{kode:S.kode,id}).catch(()=>delete S.pf[id])};
  el.onclick=()=>el.classList.contains('lock')?toast('Data ini sudah dikonfirmasi.','err'):openForm(id)})}
async function openForm(id){const m=S.boot.mhs.find(x=>x.id===id);S.cur=m;
 $('#formHead').innerHTML=`<span class="av">${ini(m.nama)}</span><div><b>${esc(m.nama)}</b><small>NIM ${esc(m.nim)}</small></div>`;
 $('#formBody').innerHTML='<div class="skel"></div><div class="skel"></div><div class="skel"></div>';$('#btnSave').disabled=true;show('form');
 try{const r=await(S.pf[id]||api('mhsGet',{kode:S.kode,id}));delete S.pf[id];if(!r)throw new Error('Gagal memuat, coba lagi');
  if(r.locked){m.status=DONE;toast('Data sudah dikonfirmasi','err');renderNama();return show('nama')}S.d=r.d;renderForm()}catch(e){toast(e.message,'err');show('nama')}}
function renderForm(){const d=S.d,dr=JSON.parse(localStorage['dr_'+d.id]||'{}');S.dec={};S.file=null;S.noJudul=0;
 $('#formBody').innerHTML=FL.map(([f,l],i)=>{const v=f==='prodi'?d.prodi:d.a[f];
  if(f==='nim'||f==='prodi')return`<div class="card"><small>${i+1}. ${l} · 🔒 Terkunci</small><div class="val">${esc(v)}</div></div>`;
  if(f==='judul'&&!(d.a.judul||d.k.judul).trim()){S.noJudul=1;return`<div class="card" style="border:2px solid #b91c1c;background:#fff1f1"><small>${i+1}. ${l}</small><div class="val" style="color:#b91c1c">⛔ Judul belum tersedia</div><small>Revisi skripsi Anda belum diisi pada link surat, sehingga judul belum diinput admin. Lengkapi dulu, lalu hubungi admin. Data belum bisa disimpan.</small></div>`}
  const s=dr[f]||{ok:false,val:d.k[f]||''};
  return`<div class="card f" data-f="${f}"><small>${i+1}. ${l}</small><div class="val">${esc(v)}</div><label class="chk"><input type="checkbox" ${s.ok?'checked':''}> Benar</label><input class="fix" placeholder="Tulis ${l} yang benar" value="${esc(s.val)}" ${s.ok?'hidden':''}></div>`}).join('')+(S.cur.ij&&!d.hasFile?'<div class="card" style="border:2px dashed var(--y)"><small>📄 Ijazah belum diserahkan — <b>wajib unggah PDF ijazah</b> (maks. 5 MB)</small><input type="file" id="ijf" accept="application/pdf" class="in"><small id="ijn"></small></div>':'');
 const fi=$('#ijf');if(fi)fi.onchange=()=>{const f=fi.files[0];S.file=null;if(f&&(f.type!=='application/pdf'||f.size>5242880)){fi.value='';toast('File harus PDF, maksimal 5 MB','err')}else if(f){S.file=f;$('#ijn').textContent='✓ '+f.name}calc()};
 $$('#formBody .f').forEach(el=>{const c=el.querySelector('[type=checkbox]'),t=el.querySelector('.fix');const up=()=>{t.hidden=c.checked;S.dec[el.dataset.f]={ok:c.checked,val:t.value};calc()};c.onchange=up;t.oninput=up;S.dec[el.dataset.f]={ok:c.checked,val:t.value}});calc()}
function calc(){const n=2+Object.values(S.dec).filter(x=>x.ok||x.val.trim()).length;$('#cnt').textContent=S.noJudul?'⛔ Judul skripsi belum tersedia':`${n} dari 6 isian diputuskan`;$('#btnSave').disabled=S.noJudul||n<6||(S.cur.ij&&!S.d.hasFile&&!S.file);
 if(S.d)localStorage['dr_'+S.d.id]=JSON.stringify(S.dec)}
const b64=f=>new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(r.result.split(',')[1]);r.onerror=no;r.readAsDataURL(f)});
async function save(){const dec={};for(const f in S.dec)dec[f]={ok:S.dec[f].ok,val:S.dec[f].val.trim()};const m=S.cur,d=S.d,old=m.status;
 if(m.ij&&!d.hasFile){const bt=$('#btnSave');busy('#btnSave',1);bt.textContent='Mengunggah ijazah...';
  try{const r=await api('mhsSave',{kode:S.kode,id:d.id,dec,pdf:await b64(S.file)});m.status=DONE;m.waktu=r.waktu;localStorage.removeItem('dr_'+d.id);renderDone(d,dec,r.waktu);show('done')}catch(e){toast(e.message,'err')}
  bt.textContent='🔒 Simpan Konfirmasi';busy('#btnSave',0);return calc()}
 m.status=DONE;m.waktu=new Date().toISOString();renderDone(d,dec,m.waktu);show('done');   // optimistic: tampil instan
 api('mhsSave',{kode:S.kode,id:d.id,dec}).then(r=>{m.waktu=r.waktu;localStorage.removeItem('dr_'+d.id)}).catch(e=>{m.status=old;toast(e.message,'err');show('form')})}
function renderDone(d,dec,w){const v=f=>f==='prodi'?d.prodi:(dec[f]&&!dec[f].ok?dec[f].val:d.a[f]),k=Object.keys(dec).filter(f=>!dec[f].ok).length;
 $('#doneBox').innerHTML=FL.map(([f,l])=>`<small>${l}</small><div class="val">${esc(v(f))}</div>`).join('')+`<small>Waktu simpan</small><div class="val">${tm(w)}</div><span class="pill">${k?k+' data dikoreksi mandiri':'Semua data sesuai'}</span>`}

// ===== ADMIN =====
const cache=()=>localStorage.adm=JSON.stringify(S.adm),cur=()=>S.adm.rows.find(r=>r.id===S.det);
function enterAdmin(){if(localStorage.adm&&!S.adm)S.adm=JSON.parse(localStorage.adm);show('admin');nav('dash');if(S.adm)renderAdm();refresh()}
async function refresh(){try{S.adm=await api('adminData',{token:S.tok});cache();renderAdm()}catch(e){/Sesi/.test(e.message)?logout():toast(e.message,'err')}}
function logout(){S.tok='';S.adm=null;localStorage.removeItem('tok');localStorage.removeItem('adm');show('home')}
function nav(p){$$('.apage').forEach(x=>x.classList.toggle('on',x.id==='p-'+p));$$('aside a[data-n]').forEach(a=>a.classList.toggle('on',a.dataset.n===(p==='det'?'dash':p)));scrollTo(0,0);if(p==='det')renderDet()}
function renderAdm(){const R=S.adm.rows,dn=R.filter(r=>r.status===DONE).length,n=R.length,pc=n?Math.round(dn/n*100):0;
 $('#stats').innerHTML=`<div class="card stat"><small>TOTAL MAHASISWA</small><b>${n}</b></div><div class="card stat"><small>SUDAH DIKONFIRMASI</small><b style="color:var(--g)">${dn}</b><div class="bar"><i style="width:${pc}%"></i></div></div><div class="card stat"><small>BELUM DIKONFIRMASI</small><b style="color:#b87400">${n-dn}</b><small>${n?100-pc:0}% tertunda</small></div>`;
 const pr={};R.forEach(r=>{const p=pr[r.prodi]=pr[r.prodi]||{t:0,d:0};p.t++;if(r.status===DONE)p.d++});
 $('#charts').innerHTML=`<div class="card"><b>Persentase Status Konfirmasi</b><div class="donut" style="background:conic-gradient(var(--g) 0 ${pc}%,var(--y) 0)"><span>${pc}%</span></div></div><div class="card"><b>Progres per Program Studi</b>${Object.entries(pr).map(([k,p])=>`<p><small style="display:flex;justify-content:space-between"><span>${esc(k)} (${p.t})</span><span>${p.d} selesai (${Math.round(p.d/p.t*100)}%)</span></small></p><div class="bar"><i style="width:${p.d/p.t*100}%"></i></div>`).join('')}</div>`;
 const fp=$('#fp'),v=fp.value;fp.innerHTML='<option value="">Prodi: Semua</option>'+Object.keys(pr).map(k=>`<option ${k===v?'selected':''}>${esc(k)}</option>`).join('');
 tbl();$('#kodeNow').textContent=S.adm.cfg.kode;$('#cu').value=S.adm.cfg.user;if(!$('#sUrl').value)$('#sUrl').value=S.adm.cfg.srcUrl;if(!$('#sTab').value)$('#sTab').value=S.adm.cfg.srcSheet;
 $('#lg').innerHTML=S.adm.log.map(l=>`<tr><td>${tm(l[0])}<td>${esc(l[1])}<td><span class="pill">${esc(l[2])}</span><td>${esc(l[3])}`).join('');
 if($('#p-det').classList.contains('on'))renderDet()}
function tbl(){const q=$('#fq').value.toLowerCase(),p=$('#fp').value,s=$('#fs').value;
 const l=S.adm.rows.filter(r=>(!q||(r.a.nama+lat(r,'nama')+r.a.nim).toLowerCase().includes(q))&&(!p||r.prodi===p)&&(!s||r.status===s));const mx=Math.max(0,Math.ceil(l.length/10)-1);S.pg=Math.min(S.pg,mx);
 $('#tb').innerHTML=l.slice(S.pg*10,S.pg*10+10).map(r=>{const d=r.status===DONE;return`<tr class="r" data-id="${r.id}"><td><b>${esc(lat(r,'nama'))}</b><small>${esc(r.a.nim)}${r.ij?' · 📄 ijazah '+(r.file?'✓':'belum'):''}</small><td>${esc(r.prodi)}<td>${lat(r,'judul')?esc(lat(r,'judul').slice(0,40))+'…':'<span class="pill" style="background:#fee2e2;color:#b91c1c">⛔ Judul kosong</span>'}<td>${nk(r)?`<span class="pill">${nk(r)} koreksi</span>`:'<small>Tidak ada</small>'}<td><span class="pill ${d?'ok':'wait'}">${esc(r.status)}</span><td><small>${tm(r.waktu)}</small>`}).join('')||'<tr><td colspan=6>Belum ada data.';
 $('#pgInfo').textContent=`${l.length} data · hal. ${S.pg+1}/${mx+1}`;$$('#tb .r').forEach(e=>e.onclick=()=>{S.det=e.dataset.id;nav('det')})}
function renderDet(){const r=cur();if(!r)return nav('dash');const d=r.status===DONE;
 $('#p-det').innerHTML=`<button class="btn s w" id="bk">← Kembali ke Dashboard</button><div class="card"><h2 style="margin:0">${esc(lat(r,'nama'))}</h2><small>NIM ${esc(r.a.nim)} · ${esc(r.prodi)}</small><span class="pill ${d?'ok':'wait'}">${esc(r.status)}</span> <small>${d?'Dikonfirmasi '+tm(r.waktu):''}</small></div>
 <div class="card cmp tw"><b>Komparasi Data Asli vs Verifikasi Mahasiswa</b><table><thead><tr><th>ELEMEN<th>DATA ASLI<th>DATA TERBARU</thead>${NF.map(f=>`<tr class="${r.k[f]?'ch':''}"><td>${FL.find(x=>x[0]===f)[1]}<td>${r.k[f]?`<s>${esc(r.a[f])}</s>`:esc(r.a[f])}<td>${esc(lat(r,f))}${r.k[f]?' <span class="pill wait">Dikoreksi</span>':''}`).join('')}</table></div>
 <div class="card"><b>Koreksi Manual Admin</b>${['nama','tempat','tgl','judul'].map(f=>`<small style="margin-top:8px">${FL.find(x=>x[0]===f)[1]}</small><input class="in" id="e_${f}" value="${esc(lat(r,f))}">`).join('')}<small style="margin-top:8px">NIM &amp; Prodi terkunci (ubah lewat impor)</small><label class="chk" style="margin-top:12px"><input type="checkbox" id="e_ij" ${r.ij?'checked':''}> Belum menyerahkan ijazah (wajib unggah PDF)</label>${r.file?`<a href="${esc(r.file)}" target="_blank" rel="noopener">📄 Lihat PDF ijazah</a>`:''}</div>
 <div class="fl"><button class="btn s d" id="bdel">🗑 Hapus Data</button>${d?'<button class="btn s w" id="bcan">🔓 Batalkan Konfirmasi</button>':''}<button class="btn s" id="bsv">✓ Simpan Perubahan</button></div>`;
 $('#bk').onclick=()=>nav('dash');$('#bsv').onclick=admUpd;$('#bdel').onclick=admDel;if($('#bcan'))$('#bcan').onclick=admCan}
function act(fn,a,p,msg){fn();cache();renderAdm();toast(msg);api(a,{token:S.tok,...p}).catch(e=>{toast(e.message,'err');refresh()})}
function admUpd(){const r=cur(),d={},ij=$('#e_ij').checked;['nama','tempat','tgl','judul'].forEach(f=>d[f]=$('#e_'+f).value.trim());
 act(()=>{['nama','tempat','tgl','judul'].forEach(f=>{if(d[f]){if(f==='judul'&&!r.a.judul)r.a.judul=d[f];else r.k[f]=d[f]!==r.a[f]?d[f]:''}});r.ij=ij},'adminUpdate',{id:r.id,d,ij},'Perubahan tersimpan')}
function admCan(){if(!confirm('Batalkan konfirmasi mahasiswa ini? Akses mahasiswa dibuka kembali.'))return;const r=cur();act(()=>{r.status='Belum Konfirmasi';r.waktu=''},'adminCancel',{id:r.id},'Konfirmasi dibatalkan')}
function admDel(){if(!confirm('Hapus data mahasiswa ini secara permanen?'))return;const id=S.det;nav('dash');act(()=>S.adm.rows=S.adm.rows.filter(r=>r.id!==id),'adminDelete',{id},'Data dihapus')}
async function doImp(a,p){busy('#btnSheet',1);try{const r=await api(a,{token:S.tok,reset:$('#reset').checked,...p});toast(`Impor: ${r.ok} berhasil, ${r.bad} bermasalah`);refresh()}catch(e){toast(e.message,'err')}busy('#btnSheet',0)}
const KM={nama:/nama/i,nim:/nim/i,prodi:/prodi|program/i,tempat:/tempat/i,tgl:/tanggal|tgl/i,judul:/judul|skripsi/i};
function xlsFile(file){const rd=new FileReader();rd.onload=()=>{const wb=XLSX.read(rd.result,{type:'array'}),js=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{raw:false,defval:''});
 doImp('adminImport',{rows:js.map(o=>{const x={};for(const f in KM){const k=Object.keys(o).find(h=>KM[f].test(h));x[f]=k?String(o[k]).trim():''}return x})})};rd.readAsArrayBuffer(file)}
function xls(){const R=S.adm.rows;if(!R.length)return toast('Belum ada data','err');
 const rows=R.map((r,i)=>({No:i+1,Prodi:r.prodi,'Nama Lengkap':lat(r,'nama'),NIM:lat(r,'nim'),'Tempat Lahir':lat(r,'tempat'),'Tanggal Lahir':lat(r,'tgl'),'Judul Skripsi Final':lat(r,'judul'),'Nama (Asli)':r.a.nama,'Tempat Lahir (Asli)':r.a.tempat,'Tanggal Lahir (Asli)':r.a.tgl,'Judul (Asli)':r.a.judul,'Wajib Ijazah':r.ij?'Ya':'Tidak','Link Ijazah':r.file||'',Status:r.status,'Waktu Konfirmasi':tm(r.waktu)}));
 const ws=XLSX.utils.json_to_sheet(rows);ws['!cols']=Object.keys(rows[0]).map(k=>({wch:Math.min(60,Math.max(k.length,...rows.map(r=>String(r[k]).length))+2)}));
 const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Data Konfirmasi');XLSX.writeFile(wb,'Konfirmasi_Skripsi.xlsx')}
function tpl(){const H=['Prodi','Nama Lengkap','NIM','Tempat Lahir','Tanggal Lahir','Judul Skripsi Final'];
 const ws=XLSX.utils.aoa_to_sheet([H,['Ekonomi Syariah','Hera Istiana','20190801042','Jakarta','14 Mei 2001','Pengaruh Literasi Keuangan Syariah terhadap Perilaku Menabung'],['Hukum Ekonomi Syariah','Annisa Fitriani','20190801019','Depok','9 Juli 2000','Tinjauan Yuridis Wakaf Produktif']]);
 ws['!cols']=[{wch:24},{wch:26},{wch:14},{wch:16},{wch:16},{wch:60}];
 const pt=XLSX.utils.aoa_to_sheet([['PETUNJUK PENGISIAN'],['1. Hapus 2 baris contoh pada sheet "Data", lalu isi data asli mulai baris ke-2.'],['2. Jangan ubah/hapus baris judul kolom (baris 1). Urutan kolom bebas, nama kolom harus mengandung: Prodi, Nama, NIM, Tempat, Tanggal, Judul.'],['3. Satu mahasiswa per baris. NIM harus unik (dipakai sebagai kunci saat impor ulang).'],['4. Tulis Tanggal Lahir sebagai teks, mis. 14 Mei 2001 (hindari format tanggal otomatis Excel).'],['5. Baris tanpa Prodi, Nama, atau NIM dihitung "bermasalah" dan dilewati.'],['6. Judul Skripsi Final boleh dikosongkan untuk mahasiswa yang belum mengisi revisi di link surat. Mahasiswa tersebut tidak bisa menyimpan konfirmasi sampai admin mengisi judulnya.']]);
 pt['!cols']=[{wch:110}];const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Data');XLSX.utils.book_append_sheet(wb,pt,'Petunjuk');XLSX.writeFile(wb,'Template_Impor_Konfirmasi_Skripsi.xlsx')}
async function admAdd(){const g=i=>$('#n_'+i).value.trim(),L=['prodi','nama','nim','tempat','tgl','judul'],o={};L.forEach(i=>o[i]=g(i));
 if(!o.prodi||!o.nama||!o.nim)return toast('Prodi, Nama, dan NIM wajib diisi','err');
 busy('#btnAddSave',1);try{const r=await api('adminAdd',{token:S.tok,...o,ij:$('#n_ij').checked});S.adm.rows.push(r);cache();renderAdm();L.forEach(i=>$('#n_'+i).value='');$('#n_ij').checked=false;toast('Mahasiswa ditambahkan');nav('dash')}catch(e){toast(e.message,'err')}busy('#btnAddSave',0)}
async function setApi(p,ok){try{await api('adminSettings',{token:S.tok,...p});toast(ok);refresh()}catch(e){toast(e.message,'err')}}

// ===== INIT =====
document.addEventListener('DOMContentLoaded',()=>{
 const ins=$$('.pin input');ins.forEach((el,i)=>{el.oninput=()=>{el.value=el.value.replace(/\D/g,'').slice(-1);if(el.value&&ins[i+1])ins[i+1].focus();if(ins.every(x=>x.value))mhsLogin()};el.onkeydown=e=>{if(e.key==='Backspace'&&!el.value&&ins[i-1])ins[i-1].focus()}});
 $$('[data-go]').forEach(b=>b.onclick=()=>{if(b.dataset.go==='nama')renderNama();show(b.dataset.go)});
 $('#btnKode').onclick=mhsLogin;$('#btnProdi').onclick=()=>{$('#q').value='';renderNama();show('nama')};$('#q').oninput=renderNama;$('#btnSave').onclick=save;
 $('#goAdm').onclick=()=>S.tok?enterAdmin():show('admlogin');
 $('#btnAdm').onclick=async()=>{busy('#btnAdm',1);try{const r=await api('adminLogin',{u:$('#au').value.trim(),p:$('#ap').value});S.tok=localStorage.tok=r.token;$('#ap').value='';enterAdmin()}catch(e){toast(e.message,'err')}busy('#btnAdm',0)};
 $('#ap').onkeydown=e=>{if(e.key==='Enter')$('#btnAdm').click()};
 $$('aside a[data-n]').forEach(a=>a.onclick=()=>nav(a.dataset.n));$('#out').onclick=logout;
 ['fq','fp','fs'].forEach(i=>$('#'+i).oninput=()=>{S.pg=0;tbl()});$('#pv').onclick=()=>{S.pg=Math.max(0,S.pg-1);tbl()};$('#nx').onclick=()=>{S.pg++;tbl()};
 $('#btnRef').onclick=()=>{toast('Menyegarkan...');refresh()};$('#btnXls').onclick=xls;$('#btnTpl').onclick=tpl;$('#btnAddSave').onclick=admAdd;$('#addBk').onclick=()=>nav('dash');$('#btnAdd').onclick=()=>{$('#dlProdi').innerHTML=[...new Set(S.adm.rows.map(r=>r.prodi))].map(p=>`<option value="${esc(p)}">`).join('');nav('add')};
 $('#btnSheet').onclick=()=>doImp('adminImportSheet',{url:$('#sUrl').value,sheet:$('#sTab').value});$('#xf').onchange=e=>e.target.files[0]&&xlsFile(e.target.files[0]);
 $('#btnKd').onclick=()=>setApi({kode:$('#nk').value.trim()},'Kode akses diperbarui');
 $('#btnCr').onclick=()=>setApi({user:$('#cu').value.trim(),oldPass:$('#co').value,newPass:$('#cn').value},'Akun admin diperbarui');
});
