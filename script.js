function formatTime(ts){
  const d=new Date(ts);
  return d.toLocaleString();
}

function evaluate(values){
  const issues=[];
  const adv=[];
  const t=values.temp;
  const hr=values.hr;
  const s=values.bpS;
  const d=values.bpD;

  if(t!=null){
    if(t>=39) { issues.push('Demam tinggi'); adv.push('Segera konsultasi ke tenaga medis.'); }
    else if(t>=37.5) { issues.push('Demam'); adv.push('Istirahat dan minum banyak cairan.'); }
    else if(t<35) { issues.push('Suhu rendah (hipotermia)'); adv.push('Hangatkan tubuh dan periksa ke fasilitas kesehatan jika perlu.'); }
  }

  if(hr!=null){
    if(hr>100) { issues.push('Tachycardia (denyut cepat)'); adv.push('Pantau, istirahat, konsultasi jika gejala lain muncul.'); }
    else if(hr<60) { issues.push('Bradycardia (denyut lambat)'); adv.push('Periksa riwayat obat/penyakit; konsultasi bila pusing.'); }
  }

  if(s!=null || d!=null){
    if(s>=140 || d>=90){ issues.push('Tekanan darah tinggi'); adv.push('Pertimbangkan pemeriksaan tekanan darah ulang dan konsultasi.'); }
    else if(s<90 || d<60){ issues.push('Tekanan darah rendah'); adv.push('Awasi pusing atau pingsan; minum cairan.'); }
  }

  const result={issues,advice:adv};
  if(issues.length===0){ result.summary='Parameter tampak normal'; }
  else result.summary=issues.join('; ');
  return result;
}

function addHistoryRow(record){
  const tbody=document.querySelector('#history-table tbody');
  const tr=document.createElement('tr');
  const tdTime=document.createElement('td'); tdTime.textContent=formatTime(record.time);
  const tdName=document.createElement('td'); tdName.textContent=record.name||'-';
  const tdTemp=document.createElement('td'); tdTemp.textContent=(record.temp!=null?record.temp:'-');
  const tdHr=document.createElement('td'); tdHr.textContent=(record.hr!=null?record.hr:'-');
  const tdBp=document.createElement('td'); tdBp.textContent=((record.bpS!=null||record.bpD!=null)?((record.bpS||'-')+'/'+(record.bpD||'-')):'-');
  const tdRes=document.createElement('td'); tdRes.textContent=record.result.summary;
  tr.appendChild(tdTime); tr.appendChild(tdName); tr.appendChild(tdTemp); tr.appendChild(tdHr); tr.appendChild(tdBp); tr.appendChild(tdRes);
  tbody.prepend(tr);
}

function showResult(result){
  const el=document.getElementById('result');
  el.className='card';
  if(result.issues.length===0) el.classList.add('result-good');
  else if(result.issues.some(i=>/Tachycardia|Demam tinggi|Tekanan darah tinggi|hipotermia|Tekanan darah rendah|Bradycardia/i.test(i))) el.classList.add('result-bad');
  else el.classList.add('result-warn');

  el.innerHTML=`<strong>${result.summary}</strong>`;
  if(result.advice && result.advice.length){
    const ul=document.createElement('ul');
    result.advice.forEach(a=>{ const li=document.createElement('li'); li.textContent=a; ul.appendChild(li); });
    el.appendChild(ul);
  }
}

document.addEventListener('DOMContentLoaded',()=>{
  const form=document.getElementById('health-form');
  const clearBtn=document.getElementById('clear-history');
  const historyKey='health-check-history';

  // load history from sessionStorage (per session) if available
  const stored=sessionStorage.getItem(historyKey);
  if(stored){
    try{ JSON.parse(stored).forEach(r=>addHistoryRow(r)); }catch(e){}
  }

  form.addEventListener('submit',e=>{
    e.preventDefault();
    const name=form.name.value.trim();
    const age=form.age.value?Number(form.age.value):null;
    const temp=form.temp.value?Number(form.temp.value):null;
    const hr=form.hr.value?Number(form.hr.value):null;
    const bpS=form['bp-s'].value?Number(form['bp-s'].value):null;
    const bpD=form['bp-d'].value?Number(form['bp-d'].value):null;

    const values={name,age,temp,hr,bpS,bpD};
    const result=evaluate(values);
    showResult(result);

    const record={time:Date.now(),name,age,temp,hr,bpS,bpD,result};
    // save to session storage
    let arr=[];
    try{ arr=JSON.parse(sessionStorage.getItem(historyKey))||[]; }catch(e){ arr=[]; }
    arr.push(record);
    sessionStorage.setItem(historyKey,JSON.stringify(arr));

    addHistoryRow(record);
  });

  clearBtn.addEventListener('click',()=>{
    sessionStorage.removeItem(historyKey);
    const tbody=document.querySelector('#history-table tbody'); tbody.innerHTML='';
  });
});
