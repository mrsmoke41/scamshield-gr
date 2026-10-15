(() => {
  "use strict";
  const messageEl = document.getElementById("message");
  const countEl = document.getElementById("char-count");
  const resultEl = document.getElementById("result");
  const analyzeBtn = document.getElementById("analyze-btn");
  const clearBtn = document.getElementById("clear-btn");
  const notifyBtn = document.getElementById("notify-btn");
  const notifyNote = document.getElementById("notify-note");

  const examples = {
    parcel: "Το δέμα σας έχει κρατηθεί. Πληρώστε 1,99€ εντός 2 ωρών για να ολοκληρωθεί η παράδοση: https://parcel-check.example.invalid/pay",
    bank: "ΕΠΕΙΓΟΝ: Ο τραπεζικός σας λογαριασμός θα κλειδωθεί σήμερα. Επιβεβαιώστε άμεσα τους κωδικούς σας εδώ: https://bank-secure.example.invalid/login",
    prize: "ΣΥΓΧΑΡΗΤΗΡΙΑ! Κερδίσατε ένα νέο κινητό. Πατήστε τώρα για να παραλάβετε το δώρο σας και πληρώστε μόνο τα έξοδα αποστολής.",
    link: "Επιβεβαιώστε τον λογαριασμό σας: https://bit.ly/example-login",
    normal: "Γεια σου! Θα αργήσω 10 λεπτά. Τα λέμε έξω από το καφέ."
  };

  const rules = [
    {id:"urgency",points:2,title:"Πίεση για άμεση ενέργεια",terms:["επείγον","άμεσα","εντός 2 ωρών","εντός 24 ωρών","σήμερα","τώρα","τελευταία ευκαιρία","θα κλειδωθεί","θα απενεργοποιηθεί","λήγει σε","άμεση ενέργεια","τελευταία ειδοποίηση"],explanation:"Η αίσθηση επείγοντος μπορεί να σε εμποδίσει να ελέγξεις ψύχραιμα το αίτημα."},
    {id:"payment",points:2,title:"Αίτημα πληρωμής ή τέλους",terms:["πληρώστε","πληρωμή","χρέωση","τέλη αποστολής","έξοδα αποστολής","οφειλή","εκκρεμεί πληρωμή","καταθέστε","μεταφορά χρημάτων","πληρώστε μόνο"],explanation:"Μη αναμενόμενες χρεώσεις ή αιτήματα μεταφοράς χρημάτων χρειάζονται ανεξάρτητη επαλήθευση."},
    {id:"credentials",points:4,title:"Αίτημα κωδικών ή ευαίσθητων στοιχείων",terms:["κωδικούς σας","κωδικό πρόσβασης","pin","κωδικός μιας χρήσης","στοιχεία κάρτας","cvv","κωδικούς ebanking","επιβεβαιώστε τους κωδικούς","κωδικούς τραπέζης"],explanation:"Μην κοινοποιείς PIN, κωδικούς πρόσβασης ή κωδικούς μιας χρήσης μέσω μηνυμάτων ή συνδέσμων."},
    {id:"link",points:1,title:"Υπάρχει σύνδεσμος",pattern:/https?:\/\/|www\./i,explanation:"Η παρουσία συνδέσμου δεν αποδεικνύει απάτη. Έλεγξε τον αποστολέα και το domain ανεξάρτητα."},
    {id:"shortlink",points:2,title:"Συντομευμένος σύνδεσμος",pattern:/https?:\/\/(?:bit\.ly|tinyurl\.com|t\.co|is\.gd|cutt\.ly|rb\.gy)\//i,explanation:"Οι συντομευμένοι σύνδεσμοι κρύβουν τον τελικό προορισμό. Μην τους ανοίγεις αν δεν μπορείς να επαληθεύσεις τον αποστολέα."},
    {id:"ipurl",points:3,title:"Σύνδεσμος με αριθμητική διεύθυνση IP",pattern:/https?:\/\/(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?(?:\/|$)/i,explanation:"Οι σύνδεσμοι με αριθμητική IP είναι ασυνήθιστοι σε πολλά νόμιμα μηνύματα. Μην τους ανοίγεις χωρίς ανεξάρτητη επιβεβαίωση."},
    {id:"punycode",points:3,title:"Domain με κωδικοποίηση punycode",pattern:/https?:\/\/[^/\s]*xn--[^/\s]*/i,explanation:"Το 'xn--' μπορεί να χρησιμοποιείται σε διεθνή ονόματα domain. Σε ύποπτο μήνυμα, έλεγξε προσεκτικά την ακριβή διεύθυνση."},
    {id:"prize",points:2,title:"Υπόσχεση δώρου ή κέρδους",terms:["κερδίσατε","συγχαρητήρια","δωρεάν δώρο","έχετε επιλεγεί","παραλάβετε το δώρο","μεγάλο βραβείο","κερδισμένος"],explanation:"Απρόσμενα δώρα που απαιτούν κλικ, στοιχεία ή πληρωμή είναι συχνό μοτίβο παραπλάνησης."},
    {id:"authority",points:2,title:"Επίκληση τράπεζας ή δημόσιας υπηρεσίας",terms:["τραπεζικός λογαριασμός","λογαριασμός θα κλειδωθεί","φορολογική δήλωση","gov.gr","αστυνομία","εφορία","τελωνείο","λογαριασμό σας"],explanation:"Απατεώνες μπορεί να μιμούνται τράπεζες ή δημόσιες υπηρεσίες. Χρησιμοποίησε την επίσημη εφαρμογή ή διεύθυνση που γνωρίζεις."},
    {id:"remote",points:3,title:"Αίτημα εγκατάστασης ή απομακρυσμένης πρόσβασης",terms:["εγκαταστήστε την εφαρμογή","απομακρυσμένη πρόσβαση","anydesk","teamviewer","μοιραστείτε την οθόνη"],explanation:"Μην εγκαθιστάς εφαρμογές ή δίνεις απομακρυσμένη πρόσβαση επειδή το ζητά ένα απρόσμενο μήνυμα."},
    {id:"odd-domain",points:2,title:"Πιθανή παραπλανητική μορφή domain",pattern:/https?:\/\/[^/\s]*(?:secure|verify|account|login|support|delivery|parcel|bank)[^/\s]*\.(?:xyz|top|click|info|vip|shop)(?:\/|\b)/i,explanation:"Ο συνδυασμός λέξεων που μιμούνται υπηρεσίες και ασυνήθιστης κατάληξης μπορεί να αξίζει έλεγχο. Η κατάληξη μόνη της δεν αποδεικνύει απάτη."}
  ];

  function escapeHTML(value) {
    return value.replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  }
  function analyze(text) {
    const normalized = text.toLocaleLowerCase("el-GR");
    const found = [];
    let score = 0;
    for (const rule of rules) {
      const matched = rule.pattern ? rule.pattern.test(text) : rule.terms.some(term => normalized.includes(term));
      if (matched && !found.some(x => x.id === rule.id)) { found.push(rule); score += rule.points; }
    }
    score = Math.min(score, 10);
    let level,title,summary,color,icon,width;
    if(score>=7){level="high";title="Πολλές ύποπτες ενδείξεις";summary="Το μήνυμα περιέχει αρκετά σημάδια που αξίζουν ιδιαίτερη προσοχή.";color="#c24141";icon="!";width=Math.max(score*10,70);}
    else if(score>=3){level="medium";title="Χρειάζεται προσοχή";summary="Βρέθηκαν ενδείξεις που καλό είναι να ελέγξεις πριν ενεργήσεις.";color="#b7791f";icon="⚠";width=score*10;}
    else if(score>0){level="low";title="Λίγες ενδείξεις εντοπίστηκαν";summary="Εντοπίστηκε τουλάχιστον ένα στοιχείο που αξίζει να ελεγχθεί.";color="#4263c7";icon="i";width=25;}
    else{level="none";title="Δεν εντοπίστηκαν γνωστές ενδείξεις";summary="Οι απλοί κανόνες δεν βρήκαν κάποιο από τα μοτίβα που αναζητούν.";color="#138a61";icon="✓";width=12;}
    return {found,score,level,title,summary,color,icon,width};
  }
  function renderResult(text) {
    if(!text.trim()){resultEl.innerHTML='<p class="result-summary">Γράψε ή επικόλλησε πρώτα το μήνυμα που θέλεις να ελέγξεις.</p>';resultEl.classList.remove("hidden");messageEl.focus();return;}
    const r=analyze(text);
    const list=r.found.length?r.found.map(item=>`<li><span class="bullet">✓</span><span><b>${escapeHTML(item.title)}.</b> ${escapeHTML(item.explanation)}</span></li>`).join(""):'<li><span class="bullet">i</span><span>Δεν βρέθηκε κάποια από τις συγκεκριμένες ενδείξεις. Αυτό <b>δεν σημαίνει ότι το μήνυμα είναι ασφαλές</b>· οι απάτες μπορούν να χρησιμοποιούν διαφορετικές διατυπώσεις.</span></li>';
    resultEl.innerHTML=`<div class="result-top"><div class="result-icon" style="background:${r.color}18;color:${r.color}">${r.icon}</div><div><span class="risk-label" style="color:${r.color}">${r.level==="high"?"ΥΨΗΛΗ ΠΡΟΣΟΧΗ":r.level==="medium"?"ΕΛΕΓΞΕ ΠΡΙΝ ΕΝΕΡΓΗΣΕΙΣ":r.level==="low"?"ΠΡΟΕΙΔΟΠΟΙΗΣΗ":"ΠΕΡΙΟΡΙΣΜΕΝΟΣ ΕΛΕΓΧΟΣ"}</span><h3>${r.title}</h3><p class="result-summary">${r.summary}</p></div></div>
    <div class="result-meter"><span style="width:${r.width}%;background:${r.color}"></span></div><div class="score-line"><span>Ενδείξεις από απλούς κανόνες</span><span>${r.found.length} ${r.found.length===1?"ένδειξη":"ενδείξεις"}</span></div>
    <ul class="findings">${list}</ul><div class="next-steps"><b>Τι να κάνεις τώρα</b><ul><li>Μην πατήσεις τον σύνδεσμο και μην απαντήσεις όσο έχεις αμφιβολίες.</li><li>Επιβεβαίωσε το αίτημα από την επίσημη εφαρμογή ή αριθμό που βρίσκεις ανεξάρτητα.</li><li>Μην δώσεις κωδικούς, PIN, στοιχεία κάρτας ή κωδικούς μιας χρήσης.</li></ul></div>
    <p class="result-summary" style="margin-top:13px;font-size:10px">Το κείμενο αναλύθηκε τοπικά με κανόνες λέξεων και μοτίβων. Δεν έγινε online έλεγχος φήμης του domain.</p>`;
    resultEl.classList.remove("hidden");
    resultEl.scrollIntoView({behavior:"smooth",block:"nearest"});
  }
  messageEl.addEventListener("input",()=>{countEl.textContent=`${messageEl.value.length} / 10000 χαρακτήρες`;});
  analyzeBtn.addEventListener("click",()=>renderResult(messageEl.value));
  clearBtn.addEventListener("click",()=>{messageEl.value="";countEl.textContent="0 / 10000 χαρακτήρες";resultEl.classList.add("hidden");resultEl.innerHTML="";messageEl.focus();});
  document.querySelectorAll("[data-example]").forEach(button=>button.addEventListener("click",()=>{messageEl.value=examples[button.dataset.example];countEl.textContent=`${messageEl.value.length} / 10000 χαρακτήρες`;renderResult(messageEl.value);}));
  notifyBtn.addEventListener("click",()=>{notifyNote.textContent="Η συνδρομή δεν είναι ακόμη ενεργή. Πρώτα δοκιμάζουμε τη ζήτηση — δεν συλλέγουμε email ή στοιχεία πληρωμής.";notifyBtn.textContent="Υπό σχεδιασμό";notifyBtn.disabled=true;});
})();