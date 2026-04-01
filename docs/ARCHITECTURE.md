# FitDuel — Architecture Overview

## Sprint 1-2: Setup completo

### Stack

| Layer | Tecnologia | Note |
|-------|-----------|------|
| Mobile | React Native + Expo SDK 54 | File-based routing via Expo Router |
| Auth | Supabase Auth (JWT) | Email/password + Google OAuth |
| Backend | Supabase (PostgreSQL) | RLS su ogni tabella |
| State | Zustand | 3 store: auth, session, feed |
| Data fetching | TanStack Query v5 | Cache 5min, retry 2x |
| Push | Expo Notifications (Sprint 7) | Via Edge Function |

### Flusso di autenticazione

```
App launch
  → initialize() [authStore]
    → supabase.auth.getSession()
      → session? → refreshProfile()
        → profile? → (tabs)/
        → no profile → /profile-setup
      → no session → (auth)/login
```

### Struttura cartelle (§14 PRD)

```
apps/mobile/
  app/
    _layout.tsx         ← Root: QueryClient + AuthGuard
    (auth)/
      _layout.tsx
      login.tsx
      register.tsx
    (tabs)/
      _layout.tsx       ← Tab navigator
      index.tsx         ← Feed
      camera.tsx        ← AI Vision (Sprint 3-4)
      challenges.tsx    ← Sfide (Sprint 5-6)
      profile.tsx       ← Profilo utente
    profile-setup.tsx   ← Post-registrazione

  components/
    ui/Button.tsx
    ui/Input.tsx
    camera/ (Sprint 3-4)
    feed/ (Sprint 7)

  lib/
    supabase.ts         ← Client + tipi DB
    ai/
      mediapipe.ts      ← Config MediaPipe (Sprint 3-4)
      poseDetector.ts   ← calculateAngle()
      exercises/        ← Config per esercizio
        index.ts        ← EXERCISE_CONFIGS
        pushup.ts
        squat.ts

  stores/
    authStore.ts        ← Sessione, profilo, OAuth
    sessionStore.ts     ← Allenamento in corso (offline-first)
    feedStore.ts        ← Feed performances

  hooks/
    useCamera.ts        ← (placeholder Sprint 3-4)
    useRepCounter.ts    ← Logica state machine rep
    useLeaderboard.ts   ← Query classifica settimanale

supabase/
  migrations/
    001_initial_schema.sql
    002_rls_policies.sql
    003_functions.sql
  functions/
    weekly-leaderboard-reset/
    duel-expiry-check/
    send-push-notification/
```

### Database triggers

- `handle_new_user` — crea profilo provvisorio dopo signup
- `update_profile_reps` — aggiorna total_reps dopo ogni performance
- `update_duel_stats` — aggiorna wins/losses dopo duel completato
- `challenge_participant_count` — aggiorna participant_count
