(() => {
  "use strict";
  const messageEl = document.getElementById("message");
  const countEl = document.getElementById("char-count");
  const resultEl = document.getElementById("result");
  const analyzeBtn = document.getElementById("analyze-btn");
  const clearBtn = document.getElementById("clear-btn");

  const examples = {
    parcel: "Το δέμα σας έχει κρατηθεί. Πληρώστε 1,99€ εντός 2 ωρών για να ολοκληρωθεί η παράδοση: https://parcel-check.example.invalid/pay",
    bank: "ΕΠΕΙΓΟΝ: Ο τραπεζικός σας λογαριασμός θα κλειδωθεί σήμερα. Επιβεβαιώστε άμεσα τους κωδικούς σας εδώ: https://bank-secure.example.invalid/login",
    prize: "ΣΥΓΧΑΡΗΤΗΡΙΑ! Κερδίσατε ένα νέο κινητό. Πατήστε τώρα για να παραλάβετε το δώρο σας και πληρώστε μόνο τα έξοδα αποστολής.",
    normal: "Γεια σου! Θα αργήσω 10 λεπτά. Τα λέμε έξω από το καφέ."
  };

  const rules = [
    { id: "urgency", points: 2, title: "Πίεση για άμεση ενέργεια", terms: ["επείγον", "άμεσα", "εντός 2 ωρών", "εντός 24 ωρών", "σήμερα", "τώρα", "τελευταία ευκαιρία", "θα κλειδωθεί", "θα απενεργοποιηθεί", "λήγει σε", "άμεσα αλλιώς", "προθεσμία"], explanation: "Οι απατεώνες συχνά δημιουργούν αίσθηση επείγοντος για να μη γίνει ψύχραιμος έλεγχος." },
    { id: "payment", points: 2, title: "Αίτημα πληρωμής ή τέλους", terms: ["πληρώστε", "πληρωμή", "χρέωση", "τέλη αποστολής", "έξοδα αποστολής", "1,99", "οφειλή", "εκκρεμεί πληρωμή", "καταθέστε", "μεταφορά χρημάτων"], explanation: "Μη αναμενόμενες μικρές χρεώσεις ή αιτήματα μεταφοράς χρημάτων χρειάζονται επαλήθευση από επίσημο κανάλι." },
    { id: "credentials", points: 4, title: "Αίτημα κωδικών ή ευαίσθητων στοιχείων", terms: ["κωδικούς σας", "κωδικό πρόσβασης", "pin", "κωδικός μιας χρήσης", "στοιχεία κάρτας", "cvv", "κωδικούς ebanking", "επιβεβαιώστε τους κωδικούς", "κωδικούς τραπέζης"], explanation: "Μην κοινοποιείς PIN, κωδικούς πρόσβασης ή κωδικούς μιας χρήσης μέσω συνδέσμων ή μηνυμάτων." },
    { id: "link", points: 1, title: "Υπάρχει σύνδεσμος για ενέργεια", pattern: /https?:\/\/|www\./i, explanation: "Ένας σύνδεσμος δεν είναι από μόνος του απάτη, αλλά μην τον ανοίγεις αν δεν περίμενες το μήνυμα. Έλεγξε το domain ανεξάρτητα." },
    { id: "shortlink", points: 2, title: "Συντομευμένος σύνδεσμος", pattern: /https?:\/\/(?:bit\.ly|tinyurl\.com|t\.co|is\.gd|cutt\.ly|rb\.gy)\//i, explanation: "Οι συντομευμένοι σύνδεσμοι κρύβουν τον τελικό προορισμό. Μην τους ανοίγεις αν δεν μπορείς να επαληθεύσεις τον αποστολέα." },
    { id: "prize", points: 2, title: "Υπόσχεση δώρου ή κέρδους", terms: ["κερδίσατε", "συγχαρητήρια", "δωρεάν δώρο", "έχετε επιλεγεί", "παραλάβετε το δώρο", "μεγάλο βραβείο", "κερδισμένος"], explanation: "Απρόσμενα δώρα που απαιτούν κλικ, στοιχεία ή πληρωμή είναι συχνό μοτίβο παραπλάνησης." },
    { id: "authority", points: 2, title: "Επίκληση τράπεζας ή δημόσιας υπηρεσίας", terms: ["τραπεζικός λογαριασμός", "λογαριασμός θα κλειδωθεί", "φορολογική δήλωση", "gov.gr", "αστυνομία", "εφορία", "τελωνείο", "λογαριασμό σας"], explanation: "Οι απατεώνες μπορεί να μιμούνται τράπεζες ή δημόσιες υπηρεσίες. Επικοινώνησε από την επίσημη εφαρμογή ή διεύθυνση που γνωρίζεις." },
    { id: "remote", points: 3, title: "Αίτημα απομακρυσμένης πρόσβασης ή εγκατάστασης", terms: ["εγκαταστήστε την εφαρμογή", "απομακρυσμένη πρόσβαση", "anydesk", "teamviewer", "μοιραστείτε την οθόνη"], explanation: "Μην εγκαθιστάς εφαρμογές ή δίνεις απομακρυσμένη πρόσβαση επειδή το ζητά ένα απρόσμενο μήνυμα." }
  ];

  function escapeHTML(value) {
    return value.replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  }

  function analyze(text) {
    const normalized = text.toLocaleLowerCase("el-GR");
    const found = [];
    let score = 0;
    for (const rule of rules) {
      const matched = rule.pattern ? rule.pattern.test(text) : rule.terms.some(term => normalized.includes(term));
      if (matched) {
        found.push(rule);
        score += rule.points;
      }
    }
    score = Math.min(score, 10);
    let level, title, summary, color, icon, width;
    if (score >= 7) {
      level = "high"; title = "Πολλές ύποπτες ενδείξεις"; summary = "Το μήνυμα περιέχει αρκετά σημάδια που αξίζουν ιδιαίτερη προσοχή."; color = "#c24141"; icon = "!"; width = Math.max(score * 10, 70);
    } else if (score >= 3) {
      level = "medium"; title = "Χρειάζεται προσοχή"; summary = "Βρέθηκαν ενδείξεις που καλό είναι να ελέγξεις πριν ενεργήσεις."; color = "#b7791f"; icon = "⚠"; width = score * 10;
    } else if (score > 0) {
      level = "low"; title = "Λίγες ενδείξεις εντοπίστηκαν"; summary = "Εντοπίστηκε τουλάχιστον ένα στοιχείο που αξίζει να ελεγχθεί."; color = "#4263c7"; icon = "i"; width = 25;
    } else {
      level = "none"; title = "Δεν εντοπίστηκαν γνωστές ενδείξεις"; summary = "Οι απλοί κανόνες δεν βρήκαν κάποιο από τα μοτίβα που αναζητούν."; color = "#138a61"; icon = "✓"; width = 12;
    }
    return { found, score, level, title, summary, color, icon, width };
  }

  function renderResult(text) {
    if (!text.trim()) {
      resultEl.innerHTML = '<p class="result-summary">Γράψε ή επικόλλησε πρώτα το μήνυμα που θέλεις να ελέγξεις.</p>';
      resultEl.classList.remove("hidden");
      messageEl.focus();
      return;
    }
    const result = analyze(text);
    const findingsHTML = result.found.length
      ? result.found.map(item => `<li><span class="bullet">✓</span><span><b>${escapeHTML(item.title)}.</b> ${escapeHTML(item.explanation)}</span></li>`).join("")
      : '<li><span class="bullet">i</span><span>Δεν βρέθηκε κάποια από τις συγκεκριμένες ενδείξεις. Αυτό <b>δεν σημαίνει ότι το μήνυμα είναι ασφαλές</b>· οι απάτες μπορούν να χρησιμοποιούν διαφορετικές διατυπώσεις.</span></li>';

    resultEl.innerHTML = `
      <div class="result-top">
        <div class="result-icon" style="background:${result.color}18;color:${result.color}">${result.icon}</div>
        <div><span class="risk-label" style="color:${result.color}">${result.level === "high" ? "ΥΨΗΛΗ ΠΡΟΣΟΧΗ" : result.level === "medium" ? "ΕΛΕΓΞΕ ΠΡΙΝ ΕΝΕΡΓΗΣΕΙΣ" : result.level === "low" ? "ΠΡΟΕΙΔΟΠΟΙΗΣΗ" : "ΠΕΡΙΟΡΙΣΜΕΝΟΣ ΕΛΕΓΧΟΣ"}</span><h3>${result.title}</h3><p class="result-summary">${result.summary}</p></div>
      </div>
      <div class="result-meter"><span style="width:${result.width}%;background:${result.color}"></span></div>
      <div class="score-line"><span>Ενδείξεις από απλούς κανόνες</span><span>${result.found.length} ${result.found.length === 1 ? "ένδειξη" : "ενδείξεις"}</span></div>
      <ul class="findings">${findingsHTML}</ul>
      <div class="next-steps"><b>Τι να κάνεις τώρα</b><ul>
        <li>Μην πατήσεις τον σύνδεσμο και μην απαντήσεις όσο έχεις αμφιβολίες.</li>
        <li>Έλεγξε το αίτημα από την επίσημη εφαρμογή ή τηλεφωνικό αριθμό που βρίσκεις ανεξάρτητα.</li>
        <li>Μην δώσεις κωδικούς, PIN, στοιχεία κάρτας ή κωδικούς μιας χρήσης.</li>
      </ul></div>
      <p class="result-summary" style="margin-top:13px;font-size:10px">Η ανάλυση έγινε τοπικά στον browser με κανόνες λέξεων και μοτίβων. Δεν ελέγχθηκε η φήμη του domain στο διαδίκτυο.</p>`;
    resultEl.classList.remove("hidden");
    resultEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  messageEl.addEventListener("input", () => {
    countEl.textContent = `${messageEl.value.length} / 8000 χαρακτήρες`;
  });
  analyzeBtn.addEventListener("click", () => renderResult(messageEl.value));
  clearBtn.addEventListener("click", () => {
    messageEl.value = "";
    countEl.textContent = "0 / 8000 χαρακτήρες";
    resultEl.classList.add("hidden");
    resultEl.innerHTML = "";
    messageEl.focus();
  });
  document.querySelectorAll("[data-example]").forEach(button => {
    button.addEventListener("click", () => {
      messageEl.value = examples[button.dataset.example];
      countEl.textContent = `${messageEl.value.length} / 8000 χαρακτήρες`;
      renderResult(messageEl.value);
    });
  });
})();