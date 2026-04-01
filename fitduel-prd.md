# FitDuel — Product Requirements Document

**Versione:** 0.1 — Draft  
**Data:** Aprile 2026  
**Stato:** In revisione  
**Platform:** iOS + Android (React Native + Expo)

---

## Indice

1. [Visione del prodotto](#1-visione-del-prodotto)
2. [Utenti target](#2-utenti-target)
3. [Feature principali](#3-feature-principali)
4. [User stories](#4-user-stories)
5. [Architettura tecnica](#5-architettura-tecnica)
6. [Stack tecnologico](#6-stack-tecnologico)
7. [Schema database](#7-schema-database-supabase)
8. [AI Vision — dettaglio tecnico](#8-ai-vision--dettaglio-tecnico)
9. [Roadmap](#9-roadmap)
10. [KPI e metriche](#10-kpi-e-metriche)
11. [Rischi e mitigazioni](#11-rischi-e-mitigazioni)
12. [Modello di business](#12-modello-di-business)
13. [Vincoli e assunzioni](#13-vincoli-e-assunzioni)
14. [Struttura progetto](#14-struttura-progetto)

---

## 1. Visione del prodotto

FitDuel è un'applicazione mobile social che consente agli utenti di registrare le proprie performance sportive tramite videocamera, ottenere un conteggio automatico e validato delle ripetizioni grazie all'AI vision (on-device, senza costi API), e sfidarsi in gare individuali e collettive in tempo reale o asincrone.

**Proposta di valore:** "Fai la tua serie, sfida il mondo. L'AI conta, tu vinci."

Il prodotto si posiziona tra:
- Fitness app professionali (Garmin, TrainingPeaks) → troppo complesse
- App consumer (Nike Run Club, Strava) → mancano la dimensione competitiva
- Gaming mobile → mancano l'ancoraggio all'attività fisica reale

### Principi di design

- **Privacy by design**: la pose estimation avviene interamente on-device, nessun dato biometrico trasmesso
- **Zero-friction onboarding**: da zero a prima ripetizione in meno di 2 minuti
- **Validation-first**: una rep conta solo se eseguita correttamente, rendendo il sistema non barabile
- **Social by default**: ogni performance è condivisibile, ogni classifica è pubblica

---

## 2. Utenti target

### 2.1 Casual Fitness (segmento core)
- **Demografica:** 18–35 anni
- **Comportamento:** si allena 2–4 volte/settimana, senza coach personale
- **Motivazione:** componente sociale e sfida con amici
- **Tool attuali:** nessuna app di tracking avanzata
- **Job to be done:** voglio sentire che il mio allenamento conta qualcosa e confrontarmi con altri

### 2.2 Sportivo competitivo
- **Demografica:** 25–40 anni
- **Comportamento:** già attivo su Strava o Nike Run Club
- **Motivazione:** competizione strutturata e classifiche ufficiali
- **Willingness to pay:** alto, disposto ad abbonamento Pro

### 2.3 Creatori di sfide (Creator)
- **Profilo:** influencer fitness, personal trainer, community manager
- **Uso:** creano challenge virali per aumentare engagement
- **Valore per FitDuel:** growth organico e contenuto UGC

### 2.4 Corporate Wellness (B2B — V2+)
- **Profilo:** HR manager, responsabili welfare aziendale
- **Uso:** gare interne tra team, team building gamificato
- **Requisiti:** dashboard admin, report, possibile white-label

---

## 3. Feature principali

### 3.1 Autenticazione e profilo utente

- Registrazione con email, Google Sign-In, Apple ID
- Profilo con:
  - Avatar (upload o generato)
  - Bio testuale
  - Statistiche aggregate: total reps, gare vinte, streak attuale, streak record
  - Badge e achievement sbloccati
  - Livello e ranking globale
- Privacy granulare: profilo pubblico / privato / solo follower
- Impostazioni notifiche personalizzabili

### 3.2 Registrazione esercizi con AI Vision

Nucleo del prodotto. Funzionamento:

1. L'utente apre la camera e seleziona l'esercizio
2. L'overlay mostra il rilevamento scheletro in tempo reale
3. Il sistema valida ogni ripetizione tramite state machine sugli angoli articolari
4. Il contatore incrementa solo su rep validate
5. Al termine: riepilogo (reps, durata, qualità media), salvataggio risultato, clip video opzionale

**Esercizi supportati MVP:** push-up, squat, sit-up, jumping jack, burpee  
**Esercizi roadmap V2:** pull-up, dip, plank (tempo), mountain climber, lunge

### 3.3 Gare e sfide

#### Sfida 1vs1 (MVP)
- Invito diretto a un utente tramite username o link
- Entrambi eseguono l'esercizio scelto entro una finestra temporale (1h / 6h / 24h / 48h)
- Il sistema dichiara automaticamente il vincitore al termine
- Notifica immediata al perdente e vincitore

#### Classifica globale (MVP)
- Leaderboard settimanale per esercizio (push-up week, squat week, ecc.)
- Reset ogni lunedì 00:00 UTC
- Visualizzazione: top 100 + posizione personale + delta dalla posizione precedente
- Filtri: globale / per paese / per fascia d'età

#### Challenge pubblica (V1)
- Qualsiasi utente crea una sfida con: nome, esercizio, durata (giorni), regole opzionali
- Gli altri si uniscono con un tap
- Il creatore guadagna badge "creator" e visibilità
- Share link esterno per viral growth

#### Torneo (V2)
- Bracket a eliminazione diretta o round-robin
- Calendario strutturato con match schedulati
- Notifiche automatiche per ogni round
- Podio con trofei virtuali e (opzionale) premi reali

### 3.4 Feed sociale

- Feed cronologico + algoritmico delle performance dei follower
- Ogni post contiene: esercizio, reps/tempo, clip video breve (max 30s), commento opzionale
- Interazioni: like, commenti, reply, mention, tag sfide
- Stories 24h per challenge in corso
- Condivisione nativa (iOS Share Sheet / Android Intent)

### 3.5 Notifiche e retention

**Trigger notifiche push:**
- Sfida ricevuta da un amico
- Sfida in scadenza (reminder -6h, -1h)
- Fine gara → risultato
- Superato in classifica da un follower
- Streak a rischio (reminder serale se non ancora allenato)
- Nuovo follower
- Like o commento su propria performance

**In-app messaging:**
- Chat 1vs1 tra sfidanti durante una gara attiva
- Notifiche in-app per azioni sociali

---

## 4. User stories

Prioritizzate con MoSCoW:

| ID | Story | Priorità |
|----|-------|----------|
| US-001 | Come utente nuovo, voglio registrarmi con Google in meno di 30 secondi | Must |
| US-002 | Come atleta, voglio vedere l'overlay di rilevamento pose in tempo reale prima di iniziare | Must |
| US-003 | Come atleta, voglio che solo le reps eseguite correttamente vengano conteggiate | Must |
| US-004 | Come atleta, voglio sfidare un amico specifico e ricevere notifica quando accetta | Must |
| US-005 | Come utente competitivo, voglio vedere la classifica globale settimanale | Must |
| US-006 | Come utente, voglio ricevere una notifica push quando vengo superato in classifica | Must |
| US-007 | Come creator, voglio pubblicare una challenge pubblica con titolo e regole personalizzate | Should |
| US-008 | Come utente, voglio vedere nel feed il video della performance dei miei follower | Should |
| US-009 | Come atleta, voglio vedere le mie statistiche di progressione nel tempo | Should |
| US-010 | Come utente premium, voglio analytics avanzate per ogni esercizio | Could |
| US-011 | Come HR manager, voglio un'istanza privata aziendale con classifica interna | Could |
| US-012 | Come utente, voglio importare i miei workout su Apple Health / Google Fit | Could |

---

## 5. Architettura tecnica

```
┌─────────────────────────────────────────────────────┐
│                  CLIENT (Mobile)                      │
│  React Native + Expo SDK 51                          │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ Expo Camera  │  │  MediaPipe   │  │ TF Lite    │ │
│  │ (30fps feed) │  │  Pose (33kp) │  │ (fallback) │ │
│  └──────────────┘  └──────────────┘  └────────────┘ │
│  ┌──────────────────────────────────────────────────┐│
│  │         Zustand (state) + React Query (cache)    ││
│  └──────────────────────────────────────────────────┘│
└─────────────────────┬───────────────────────────────┘
                      │ HTTPS / WebSocket
┌─────────────────────▼───────────────────────────────┐
│              API LAYER (Supabase)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  REST API    │  │  Realtime    │  │  Edge Fn   │ │
│  │  (PostgREST) │  │  (WebSocket) │  │  (Deno)    │ │
│  └──────────────┘  └──────────────┘  └────────────┘ │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│              BACKEND (Supabase)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  PostgreSQL  │  │  Supabase    │  │  Supabase  │ │
│  │  + pg_cron   │  │  Auth (JWT)  │  │  Storage   │ │
│  └──────────────┘  └──────────────┘  └────────────┘ │
│  Row Level Security su ogni tabella                  │
└─────────────────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│           AUTOMAZIONE (Supabase Edge Functions)      │
│  • Cron leaderboard reset (lunedì 00:00 UTC)        │
│  • Assegnazione badge e achievement                  │
│  • Gestione scadenza sfide e dichiarazione vincitore │
│  • Invio push via Expo Notifications API             │
└─────────────────────────────────────────────────────┘
```

### Flusso dati AI Vision (on-device)

```
Camera frame (30fps)
       ↓
MediaPipe Pose → 33 keypoints (x, y, visibility)
       ↓
Filtra keypoints con visibility > 0.6
       ↓
Calcolo angoli articolari (dot product tra vettori)
       ↓
State machine per esercizio selezionato
  IDLE → DOWN → UP → COUNTED
       ↓
Validazione (angolo nel range ± 10°)
       ↓
Incremento contatore + feedback visivo/audio
       ↓
Al termine: POST risultato su Supabase
```

---

## 6. Stack tecnologico

| Layer | Tecnologia | Motivazione |
|-------|-----------|-------------|
| Mobile framework | React Native + Expo SDK 51 | Un codebase per iOS e Android; EAS Build per distribuzione |
| AI Vision | MediaPipe Pose (Google) | 33 keypoints, 30fps su mid-range, on-device, gratuito, offline |
| AI fallback | TensorFlow Lite MoveNet Lightning | Più leggero per device entry-level |
| Backend | Supabase (Free → Pro €25/mese) | Postgres + Auth + Storage + Realtime out-of-the-box |
| State management | Zustand | Leggero, semplice, non boilerplate |
| Data fetching | React Query (TanStack) | Cache, retry, sync con Supabase |
| Push notifications | Expo Notifications | Gestisce FCM (Android) e APNs (iOS) con unica API |
| Video storage | Supabase Storage + CDN | Max 30s per clip, compressione H.265 lato client |
| Automation cron | Supabase Edge Functions + pg_cron | Leaderboard, badge, scadenza sfide — zero costi aggiuntivi |
| CI/CD | Expo EAS | Build e submit automatici su App Store e Google Play |
| Analytics | PostHog (self-hosted opzionale) | Event tracking, funnel, retention |
| Error tracking | Sentry | Crash reporting mobile |

---

## 7. Schema database Supabase

### Tabelle principali

```sql
-- Utenti (estende auth.users di Supabase)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  is_public BOOLEAN DEFAULT true,
  level INTEGER DEFAULT 1,
  total_reps INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performance (ogni sessione di allenamento)
CREATE TABLE performances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  exercise_type TEXT NOT NULL, -- 'pushup' | 'squat' | 'situp' | 'jumpingjack' | 'burpee'
  reps INTEGER NOT NULL,
  duration_seconds INTEGER NOT NULL,
  avg_quality FLOAT, -- 0.0–1.0, qualità media delle reps
  video_url TEXT, -- URL Supabase Storage (nullable)
  is_public BOOLEAN DEFAULT true,
  challenge_id UUID REFERENCES challenges(id),
  duel_id UUID REFERENCES duels(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sfide 1vs1
CREATE TABLE duels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenger_id UUID REFERENCES profiles(id) NOT NULL,
  challenged_id UUID REFERENCES profiles(id) NOT NULL,
  exercise_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending' | 'accepted' | 'active' | 'completed' | 'expired' | 'declined'
  expires_at TIMESTAMPTZ NOT NULL,
  challenger_reps INTEGER,
  challenged_reps INTEGER,
  winner_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Challenge pubbliche
CREATE TABLE challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  exercise_type TEXT NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  participant_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Partecipanti a challenge
CREATE TABLE challenge_participants (
  challenge_id UUID REFERENCES challenges(id),
  user_id UUID REFERENCES profiles(id),
  best_reps INTEGER DEFAULT 0,
  attempt_count INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (challenge_id, user_id)
);

-- Leaderboard settimanale (materializzata)
CREATE TABLE weekly_leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  exercise_type TEXT NOT NULL,
  week_start DATE NOT NULL, -- lunedì della settimana
  total_reps INTEGER DEFAULT 0,
  best_single INTEGER DEFAULT 0,
  rank INTEGER,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, exercise_type, week_start)
);

-- Follow system
CREATE TABLE follows (
  follower_id UUID REFERENCES profiles(id),
  following_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (follower_id, following_id)
);

-- Feed activities
CREATE TABLE activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  type TEXT NOT NULL, -- 'performance' | 'duel_won' | 'challenge_joined' | 'badge_earned'
  reference_id UUID, -- ID della performance/duel/challenge
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Like
CREATE TABLE likes (
  user_id UUID REFERENCES profiles(id),
  activity_id UUID REFERENCES activities(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, activity_id)
);

-- Commenti
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  activity_id UUID REFERENCES activities(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Badge / achievement
CREATE TABLE user_badges (
  user_id UUID REFERENCES profiles(id),
  badge_id TEXT NOT NULL, -- 'first_100_pushups' | 'week_champion' | ecc.
  earned_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, badge_id)
);

-- Notifiche
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  type TEXT NOT NULL, -- 'duel_invite' | 'duel_result' | 'leaderboard_change' | 'streak_risk' | ecc.
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  reference_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Row Level Security (RLS)

```sql
-- profiles: chiunque vede i profili pubblici, solo il proprietario modifica
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable" ON profiles FOR SELECT USING (is_public = true OR auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- performances: visibili se pubbliche o se dell'utente autenticato
ALTER TABLE performances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public performances viewable" ON performances FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users insert own performances" ON performances FOR INSERT WITH CHECK (auth.uid() = user_id);

-- notifications: solo il destinatario vede le proprie
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
```

---

## 8. AI Vision — dettaglio tecnico

### Pipeline di rilevamento (on-device)

```typescript
// Pseudocodice state machine per push-up
type RepState = 'IDLE' | 'DOWN' | 'UP'

interface ExerciseConfig {
  jointA: PoseLandmark
  jointB: PoseLandmark  // vertice dell'angolo
  jointC: PoseLandmark
  downThreshold: number  // angolo massimo per "giù"
  upThreshold: number    // angolo minimo per "su"
  minVisibility: number  // confidence minima keypoint
}

const EXERCISE_CONFIG: Record<string, ExerciseConfig> = {
  pushup: {
    jointA: PoseLandmark.LEFT_SHOULDER,
    jointB: PoseLandmark.LEFT_ELBOW,
    jointC: PoseLandmark.LEFT_WRIST,
    downThreshold: 90,
    upThreshold: 160,
    minVisibility: 0.6
  },
  squat: {
    jointA: PoseLandmark.LEFT_HIP,
    jointB: PoseLandmark.LEFT_KNEE,
    jointC: PoseLandmark.LEFT_ANKLE,
    downThreshold: 100,
    upThreshold: 165,
    minVisibility: 0.6
  },
  situp: {
    jointA: PoseLandmark.LEFT_SHOULDER,
    jointB: PoseLandmark.LEFT_HIP,
    jointC: PoseLandmark.LEFT_KNEE,
    downThreshold: 50,
    upThreshold: 120,
    minVisibility: 0.5
  }
}

function calculateAngle(a: Point, b: Point, c: Point): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)
  let angle = Math.abs(radians * 180 / Math.PI)
  if (angle > 180) angle = 360 - angle
  return angle
}

function processFrame(landmarks: PoseLandmark[], config: ExerciseConfig, state: RepState): { newState: RepState, repCounted: boolean } {
  const jA = landmarks[config.jointA]
  const jB = landmarks[config.jointB]
  const jC = landmarks[config.jointC]

  // Verifica visibilità minima
  if (jA.visibility < config.minVisibility || jB.visibility < config.minVisibility || jC.visibility < config.minVisibility) {
    return { newState: state, repCounted: false }
  }

  const angle = calculateAngle(jA, jB, jC)
  let repCounted = false
  let newState = state

  if (angle < config.downThreshold && state === 'UP') {
    newState = 'DOWN'
  } else if (angle > config.upThreshold && state === 'DOWN') {
    newState = 'UP'
    repCounted = true  // rep completata!
  } else if (state === 'IDLE' && angle > config.upThreshold) {
    newState = 'UP'
  }

  return { newState, repCounted }
}
```

### Parametri di validazione per esercizio

| Esercizio | Articolazione | Angolo DOWN | Angolo UP | Keypoints chiave |
|-----------|--------------|-------------|-----------|-----------------|
| Push-up | Gomito | < 90° | > 160° | Spalla, Gomito, Polso |
| Squat | Ginocchio | < 100° | > 165° | Anca, Ginocchio, Caviglia |
| Sit-up | Tronco/Anca | < 50° | > 120° | Spalla, Anca, Ginocchio |
| Jumping jack | Abduzione braccio | < 20° | > 150° | Spalla, Polso (laterale) |
| Burpee | Multi-fase | Plank → Salto | Rilevamento salto | Full body |

### Requisiti device minimi

- **iOS:** iPhone XS o superiore (iOS 14+) — Neural Engine per MediaPipe accelerato
- **Android:** Snapdragon 660 / Helio G85 o superiore (Android 8+)
- **RAM:** minimo 3GB
- **Camera:** minimo 720p a 30fps
- **Illuminazione:** ambienti con luce sufficiente (lux > 200)

### Anti-cheat (liveness detection)

Per prevenire l'upload di video pre-registrati durante le sfide ufficiali:

1. **Challenge token:** all'inizio di ogni sessione in gara, il server genera un token con timestamp
2. **Random visual cue:** durante la sessione, a intervallo random (30–90s), appare un overlay con un'azione richiesta (es. "alza la mano destra" per 2 secondi)
3. **Verifica server-side:** il client invia la sequenza di keypoint compressi insieme al token; il server verifica che i tempi siano coerenti e che il cue sia stato eseguito
4. **Flag + review:** performance sospette vengono flaggate per revisione manuale

---

## 9. Roadmap

### MVP — Sprint 1-8 (settimane 1–8)

**Obiettivo:** versione funzionante con conteggio AI, sfide 1vs1 e classifica globale

| Sprint | Focus | Deliverable |
|--------|-------|-------------|
| 1–2 | Setup + Auth | Progetto Expo, Supabase, auth completa (email/Google/Apple), profilo base |
| 3–4 | AI Vision | Integrazione MediaPipe Pose, state machine push-up + squat + sit-up |
| 5–6 | Sfide e classifica | Duel 1vs1 completo, leaderboard settimanale, cron Edge Function |
| 7 | Feed e notifiche | Feed base follower, push notifications (Expo), in-app notifications |
| 8 | QA + Submit | Test su device reali, ottimizzazione performance, App Store + Play Store |

**Criteri di accettazione MVP:**
- [ ] Registrazione e login funzionanti su iOS e Android
- [ ] Conteggio push-up con accuracy ≥ 95% su iPhone XS e Pixel 5
- [ ] Sfida 1vs1 end-to-end con notifica risultato
- [ ] Classifica globale push-up aggiornata in tempo reale
- [ ] Latenza rilevamento < 50ms per frame

### V1.0 — Sprint 9-13 (settimane 9–13)

**Obiettivo:** layer social completo

- Feed con video clip (upload, playback, compressione H.265)
- Sistema follower (follow/unfollow, ricerca utenti, suggerimenti)
- Like, commenti, mention
- Challenge pubbliche create da utenti
- Aggiunta esercizi: jumping jack, burpee
- Badge e achievement system (12 badge iniziali)

### V1.5 — Sprint 14-17 (settimane 14–17)

**Obiettivo:** competizione strutturata

- Tornei a eliminazione diretta
- Streak system con bonus reps
- Leaderboard per paese e fascia d'età
- Stories 24h
- Replay animato skeleton della performance
- Condivisione nativa con preview card

### V2.0 — Ongoing

**Obiettivo:** monetizzazione e scala

- Abbonamento Pro (€6,99/mese o €49,99/anno)
- Tornei a pagamento con prize pool
- Corporate wellness dashboard (B2B)
- Integrazione Apple Health / Google Fit
- Pull-up, dip, plank (tempo), mountain climber, lunge
- API per personal trainer e gym

---

## 10. KPI e metriche

### Metriche di prodotto

| Metrica | Target M+1 | Target M+3 | Target M+6 |
|---------|-----------|-----------|-----------|
| Utenti registrati | 500 | 3.000 | 10.000 |
| DAU/MAU | 15% | 25% | 30% |
| Session length media | 5 min | 8 min | 10 min |
| Sessions/utente/settimana | 2 | 3 | 4 |
| Sfide completate (su accettate) | 50% | 65% | 70% |
| D7 retention | 25% | 35% | 40% |
| D30 retention | 10% | 20% | 25% |

### Metriche tecniche

| Metrica | Target |
|---------|--------|
| Accuracy conteggio reps (push-up) | ≥ 95% |
| Accuracy conteggio reps (squat) | ≥ 93% |
| Latenza rilevamento per frame | < 50ms |
| Crash-free sessions | ≥ 99.5% |
| App launch time (cold) | < 2s |
| Video upload time (30s clip, 4G) | < 15s |

### Metriche business

| Metrica | Target M+6 | Target M+12 |
|---------|-----------|------------|
| MRR | €1.500 | €8.000 |
| Conversion free → Pro | 3% | 5% |
| CAC (paid acquisition) | < €2 | < €1,5 |
| LTV stima (Pro) | €42 | €55 |

---

## 11. Rischi e mitigazioni

| Rischio | Impatto | Probabilità | Mitigazione |
|---------|---------|-------------|-------------|
| AI Vision inaccurata su device low-end | Alto | Media | Test su device budget; fallback a MoveNet Lightning; requisito minimo documentato |
| Utenti che barano (video pre-registrati) | Alto | Media | Liveness detection con challenge token e visual cue random |
| Privacy dati biometrici (GDPR) | Alto | Bassa | Pose estimation on-device, nessun dato biometrico trasmesso; DPA chiaro |
| Costi storage video elevati a scala | Medio | Media | Max 30s per clip; H.265 lato client; retention 90 giorni; cold storage dopo |
| Bassa retention post-onboarding | Alto | Media | Streak system; challenge giornaliera automatica; notifiche contestuali |
| Rifiuto App Store (contenuti video) | Medio | Bassa | Moderazione automatica + manuale; community guidelines; flag + ban system |
| Latenza AI Vision su iPhone vecchi | Medio | Media | Threshold device minimi; modal warning su device non supportati |
| Competitor (TikTok, Instagram) copia idea | Alto | Alta | Focus su validazione oggettiva (non barabile); community verticale; B2B |

---

## 12. Modello di business

### Free tier (sempre gratuito)
- Tutti gli esercizi AI (MVP + V1)
- Sfide 1vs1 illimitate
- Leaderboard globale
- Feed sociale completo
- 3 challenge pubbliche attive contemporaneamente
- Storico performance 30 giorni

### Pro — €6,99/mese o €49,99/anno
- Challenge pubbliche illimitate
- Storico performance illimitato
- Statistiche avanzate + grafici progressione
- Accesso ai tornei premium
- Replay animato skeleton HD
- Badge esclusivi Pro
- Priorità in customer support

### Corporate — pricing custom (min €200/mese)
- Istanza privata con branding aziendale
- Dashboard HR con report CSV/PDF
- Admin panel per gestione utenti
- SLA 99.9% + supporto dedicato
- Max utenti configurabile (50 / 200 / unlimited)

### Tornei a pagamento
- Entry fee €1–€10 per torneo
- Prize pool aggregato (85% agli atleti, 15% FitDuel)
- Sponsor integration per tornei grandi (naming rights, prize boost)

---

## 13. Vincoli e assunzioni

### Vincoli tecnici
- Il rilevamento pose richiede buona illuminazione (lux > 200) e inquadratura completa del corpo
- Device minimi: iPhone XS (iOS 14+) / Android con Snapdragon 660 o superiore
- Connessione internet richiesta per classifiche, sfide e social (modalità offline: solo conteggio locale)
- Max 30s per clip video (limite storage e UX)
- Compressione video obbligatoria lato client prima dell'upload

### Vincoli legali e normativi
- La pose estimation è on-device: i dati elaborati non sono dati biometrici ai sensi del GDPR (Art. 4.14) perché non consentono identificazione personale
- I video caricati richiedono consenso esplicito alla pubblicazione (Terms of Service)
- Utenti under 16: consenso genitoriale obbligatorio (GDPR Art. 8, COPPA per mercato US)
- Prize pool con denaro reale: verificare normativa gambling per paese prima del lancio V2

### Assunzioni
- MediaPipe Pose garantisce accuracy ≥ 95% in condizioni di luce standard su device target
- Supabase Free tier sufficiente per MVP (< 50.000 utenti, < 500GB storage)
- Team di sviluppo: 1 mobile developer (React Native), 1 backend developer, 1 designer/UI
- Nessun costo API AI (tutto on-device)
- App Store e Google Play approvano l'app senza richieste di modifiche significative

---

## 14. Struttura progetto

```
fitduel/
├── apps/
│   └── mobile/                    # React Native + Expo
│       ├── app/                   # Expo Router (file-based routing)
│       │   ├── (auth)/
│       │   │   ├── login.tsx
│       │   │   └── register.tsx
│       │   ├── (tabs)/
│       │   │   ├── index.tsx      # Feed
│       │   │   ├── camera.tsx     # AI Vision + conteggio
│       │   │   ├── challenges.tsx # Sfide e classifiche
│       │   │   └── profile.tsx    # Profilo utente
│       │   └── _layout.tsx
│       ├── components/
│       │   ├── camera/
│       │   │   ├── PoseOverlay.tsx
│       │   │   ├── RepCounter.tsx
│       │   │   └── ExerciseSelector.tsx
│       │   ├── feed/
│       │   │   ├── PerformanceCard.tsx
│       │   │   └── VideoClip.tsx
│       │   └── ui/                # Design system components
│       ├── lib/
│       │   ├── ai/
│       │   │   ├── mediapipe.ts   # MediaPipe setup
│       │   │   ├── poseDetector.ts
│       │   │   └── exercises/     # Config per ogni esercizio
│       │   │       ├── pushup.ts
│       │   │       ├── squat.ts
│       │   │       └── index.ts
│       │   ├── supabase.ts        # Client Supabase
│       │   └── notifications.ts   # Expo Notifications
│       ├── stores/                # Zustand stores
│       │   ├── authStore.ts
│       │   ├── sessionStore.ts    # Sessione allenamento in corso
│       │   └── feedStore.ts
│       └── hooks/
│           ├── useCamera.ts
│           ├── useRepCounter.ts
│           └── useLeaderboard.ts
├── supabase/
│   ├── migrations/                # SQL migrations in ordine
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   └── 003_functions.sql
│   └── functions/                 # Edge Functions (Deno)
│       ├── weekly-leaderboard-reset/
│       │   └── index.ts
│       ├── duel-expiry-check/
│       │   └── index.ts
│       └── send-push-notification/
│           └── index.ts
└── docs/
    ├── PRD.md                     # Questo file
    ├── ARCHITECTURE.md
    └── AI_VISION.md
```

---

## Note per Claude Code

- **Inizia dall'MVP:** implementa in ordine: auth → camera + AI → sfide → classifica → notifiche
- **Non ottimizzare prematuramente:** accuracy AI prima, ottimizzazione device dopo
- **RLS sempre attiva:** ogni tabella Supabase deve avere Row Level Security abilitato fin dall'inizio
- **Testing AI Vision:** crea una suite di test con video campione per ogni esercizio prima del deploy
- **Video pipeline:** comprimi sempre lato client (max 5MB per clip 30s) prima dell'upload
- **Offline-first per il conteggio:** il rep counter deve funzionare senza internet; solo il salvataggio richiede connessione
- **Segui la struttura cartelle** definita in §14 fin dal primo commit

---

*Fine documento — FitDuel PRD v0.1*
