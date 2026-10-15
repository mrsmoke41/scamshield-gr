# ScamShield GR — MVP 0.1

Ένα στατικό, ελληνικό demo για έλεγχο ύποπτων μηνυμάτων με απλούς κανόνες.

## Αρχεία
- `index.html` — περιεχόμενο και δομή
- `styles.css` — responsive εμφάνιση
- `script.js` — έλεγχος κανόνων και εμφάνιση αποτελεσμάτων

## Εκτέλεση τοπικά
1. Κατέβασε και αποσυμπίεσε το ZIP.
2. Άνοιξε το `index.html` με Chrome, Edge ή Firefox.
3. Δοκίμασε τα κουμπιά παραδειγμάτων ή επικόλλησε ένα μήνυμα.

Δεν απαιτείται εγκατάσταση, API key, server ή build step. Το κείμενο ελέγχεται τοπικά στον browser και δεν αποστέλλεται από τον κώδικα του MVP. Η γραμματοσειρά φορτώνεται από Google Fonts όταν υπάρχει σύνδεση· αν δεν υπάρχει, χρησιμοποιείται system font.

## Δωρεάν δημοσίευση με GitHub Pages
1. Δημιούργησε λογαριασμό στο https://github.com/ (αν δεν έχεις).
2. Δημιούργησε νέο **Public repository**, π.χ. `scamshield-gr`.
3. Πάτησε **Add file → Upload files** και ανέβασε τα `index.html`, `styles.css`, `script.js` και `README.md` (όχι τον φάκελο ZIP).
4. Πάτησε **Commit changes**.
5. Άνοιξε **Settings → Pages**.
6. Στο **Build and deployment**, επίλεξε **Deploy from a branch**.
7. Διάλεξε branch `main` και folder `/ (root)`, πάτησε **Save**.
8. Περίμενε λίγα λεπτά. Η διεύθυνση θα εμφανιστεί στη σελίδα Pages, συνήθως ως `https://USERNAME.github.io/scamshield-gr/`.

Επίσημος οδηγός: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

## Σημαντικοί περιορισμοί
- Δεν είναι antivirus και δεν κάνει online reputation check για URLs.
- Δεν υπάρχει AI, backend, λογαριασμός χρήστη, αποθήκευση ιστορικού ή συνδρομητικό σύστημα.
- Η βαθμολόγηση είναι ευρετική. Μπορεί να υπάρξουν false positives και false negatives.
- Μην χρησιμοποιείς πραγματικά μηνύματα με κωδικούς, στοιχεία κάρτας ή προσωπικά δεδομένα σε δημόσια demo.
- Το GitHub Pages δημοσιεύει δημόσια την ιστοσελίδα. Μην ανεβάσεις προσωπικά δεδομένα ή μυστικά στο repository.
- Πριν από εμπορική χρήση, χρειάζονται έλεγχος ασφάλειας, προσβασιμότητας, όρων χρήσης, πολιτικής απορρήτου και νομικών/φορολογικών υποχρεώσεων.

## Τι δεν περιλαμβάνεται ακόμη
Πληρωμές/συνδρομές, βάση δεδομένων, email alerts, domain reputation API και AI analysis. Αυτά απαιτούν επιπλέον σχεδιασμό και πιθανώς κόστος.
