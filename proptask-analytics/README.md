# Proptask Analytics 🏢

Et smart vedlikeholdssystem for vaktmestere drevet av Gemini AI og Firebase.

## Funksjoner
- 📸 **AI-Analyse:** Ta bilde av et problem, og Gemini AI foreslår tittel, beskrivelse og prioritet.
- 📍 **Lokasjon:** Registrer adresse og nøyaktig GPS-posisjon for oppgaven.
- 📊 **Dashbord:** Få oversikt over nye, pågående og utførte oppgaver med interaktive statistikk-kort.
- 🔥 **Sanntid:** Synkronisert med Firebase Firestore.

## Slik kommer du i gang

### 1. Klon prosjektet
```bash
git clone https://github.com/DITT_BRUKERNAVN/proptask-analytics.git
cd proptask-analytics
```

### 2. Installer avhengigheter
```bash
npm install
```

### 3. Konfigurer miljøvariabler
Opprett en fil som heter `.env` i rotmappen og legg til din Gemini API-nøkkel (Vite krever `VITE_`-prefix for at nøkkelen skal være tilgjengelig i klienten):
```env
VITE_API_KEY=din_api_nøkkel_her
```

### 4. Kjør prosjektet lokalt
```bash
npm run dev
```

## (Valgfritt) Backend med Flask – tryggere AI-nøkkel
For å skjule Gemini‑nøkkelen kan du starte en liten Flask‑backend som proxy for bildeanalyse.

1) Installer og kjør backend
```bash
cd ../backend
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
cp .env.example .env  # fyll inn GEMINI_API_KEY
python app.py  # starter på port 5001
```

2) Peker frontenden mot backend (valgfritt)
Opprett/oppdater `.env` i prosjektroten og sett:
```env
VITE_BACKEND_URL=http://localhost:5001
VITE_GEMINI_MODEL=gemini-2.0-flash  # valgfritt, kun for klient-fallback
```

Frontenden vil da sende bilder til Flask (`/api/analyze-image`) for analyse. Hvis backend ikke svarer, faller appen tilbake til å bruke Gemini direkte i nettleser (krever `VITE_API_KEY`). For å styre modellen: backend leser `GEMINI_MODEL` fra `backend/.env`; frontenden kan sette `VITE_GEMINI_MODEL` for fallback.

## Teknologier
- **React 19**
- **Vite** (Build tool)
- **Tailwind CSS** (Styling)
- **Firebase Firestore** (Database)
- **Google Gemini API** (AI Analyse)
- **Lucide React** (Ikoner)

## Viktig konfigurasjon og noter

- Miljøvariabler: Appen leser nøkkelen via `import.meta.env.VITE_API_KEY`. Sørg for at `.env` inneholder `VITE_API_KEY`.
- Gemini SDK: Koden bruker `@google/genai` og en oppdatert integrasjon med `models.generateContent` og strukturert JSON-respons.
- Bilder: Bilder lastes opp til Firebase Storage. Kun download-URL lagres i Firestore for å unngå størrelsesbegrensninger.
  - Merk: Hvis Storage ikke er tilgjengelig på gratisplan i prosjektet ditt, faller appen tilbake til å lagre et komprimert base64-bilde direkte i Firestore (under ca. 300KB). Dette er ok for testing, men anbefales ikke for produksjon pga. 1MB dokumentgrense og kostnader.

### Firebase-oppsett
1. Opprett Firebase-prosjekt og aktiver Firestore og Storage.
2. Oppdater `services/firebase.ts` med ditt prosjekt (apiKey, authDomain, projectId, storageBucket, m.m.).
3. Tillat midlertidig testing i Firestore og Storage med enkle regler (ikke for produksjon):
   - Firestore (åpent for test):
     ```
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /{document=**} {
           allow read, write: if true;
         }
       }
     }
     ```
   - Storage (åpent for test):
     ```
     rules_version = '2';
     service firebase.storage {
       match /b/{bucket}/o {
         match /{allPaths=**} {
           allow read, write: if true;
         }
       }
     }
     ```
   Bytt til sikre regler med auth før produksjon.

### Kjøring
- Lokalt: `npm run dev`
- Bygg: `npm run build` og `npm run preview`

### Feilsøking
- Mangler AI-nøkkel: Sjekk at `VITE_API_KEY` er satt og restart dev-server.
- Bildeopplasting feiler: Sjekk Firebase Storage-regler og at prosjektet er riktig konfigurert.
