# SkillSwap – Peer-to-Peer Student Skill Exchange Platform

**Learn From Students. Teach What You Know. Grow Together.**

SkillSwap is a full-stack web application designed for university students to exchange skills, schedule 1-on-1 peer mentorship sessions, earn time-bank barter credits, verify academic & industry credentials, build portfolio proof, and collaborate on projects without financial barriers.

---

## 🚀 Key Features

1. **Peer-to-Peer Skill Barter Engine**:
   - **Direct 1:1 Barter**: Reciprocal exchange (e.g. Maya teaches Python algorithms ↔ Liam teaches Figma UI systems).
   - **Time-Bank Credit Network**: 1 hour of teaching = 1 time-bank credit. Spend credits to learn any skill from any student asynchronously.
   - **Zero Subscription Fees**: Completely free for college students using their skills as currency.

2. **Smart Skill Matcher (`/skill-match`)**:
   - Automated 2-way complementary matching algorithm that pairs what you teach with what peers want to learn.
   - Computes match compatibility scores (e.g. 98% Match, Perfect Barter).

3. **Verifiable Skill Credibility & Certificates (`/certificates`)**:
   - Students can attach verified credentials (AWS, Meta, Google UX, ICPC medals, Coursera certificates).
   - Public proof and verified badges displayed on public student portfolios.

4. **1-on-1 Swap Sessions & Peer Reviews (`/sessions`, `/calendar`)**:
   - Interactive booking modal with date & time selection, duration, and session notes.
   - Instant video room links (`https://meet.skillswap.edu/room-...`).
   - Mutual 5-star rating and qualitative peer review system after completed sessions.
   - XP engine rewards (+150 XP for teachers, +100 XP for learners, +50 XP for reviews).

5. **Student Collaborative Projects (`/projects`)**:
   - Interdisciplinary student projects (e.g. EcoCampus, DesignTokens CLI, StudySync).
   - Post project openings, specify needed skills (React, Figma, FastAPI, Rust), and recruit student teammates.

6. **Direct Peer Chat (`/messages`)**:
   - In-app student-to-student messaging channels with real-time thread history and video meeting launchers.

7. **Gamification & Leaderboard (`/community`, `/dashboard`)**:
   - XP progression, level ranks (Scholar, Adept, Master Mentor), daily activity trackers, and campus leaderboard.

8. **1-Click Live Persona Switcher**:
   - Easily toggle between pre-seeded student personas (e.g. Maya Lin from UC Berkeley, Liam Vance from Stanford, Aarav Sharma from MIT, Chloe Dupont from NYU) to test bidirectional barter workflows live.

---

## 🎨 Design System

- **Background**: Near-black / dark navy (`#070A12`, `#0B101E`)
- **Cards**: Dark charcoal (`#121826`, `#192236`, borders `rgba(255,255,255,0.08)`)
- **Primary Accent**: Electric violet / purple (`#8B5CF6`, `#7C3AED`, `#A855F7`)
- **Secondary Accent**: Blue-purple gradient (`from-violet-600 via-indigo-600 to-purple-600`)
- **Supporting Accents**:
  - Green for verified / success (`#10B981`)
  - Yellow for ratings (`#F59E0B`, `#FBBF24`)
  - Red for errors / warnings (`#EF4444`)
- **Aesthetic**: Premium, futuristic, slight glassmorphism, glowing borders, rounded cards, responsive mobile menu drawer.

---

## 🗺️ Routing Architecture

| Route | Page | Purpose |
|---|---|---|
| `/` | `HomePage` | Polished landing page with Hero, Stats, How it works, Popular skills, Featured students, Barter visual, Why SkillSwap, and Final CTA |
| `/login` | `LoginPage` | Student login with 1-click persona switcher |
| `/register` | `RegisterPage` | Registration with 5 free welcome credits |
| `/onboarding` | `OnboardingPage` | Select skills to teach & learn |
| `/dashboard` | `DashboardPage` | Overview of time credits, XP, upcoming sessions, learning goals, and badges |
| `/explore` | `ExplorePage` | Searchable directory of skills with category filters |
| `/skills` | `SkillsPage` | Full categorized curriculum directory |
| `/students` | `StudentsPage` | Browse and filter student peers by skill, university, and rating |
| `/student/:id` | `StudentDetailPage` | Full student profile, teaching/learning skills, certificates, reviews & session booking modal |
| `/profile` | `ProfilePage` | User's own public student profile |
| `/profile/edit` | `ProfileEditPage` | Edit profile, university, bio, and skills |
| `/certificates` | `CertificatesPage` | Verifiable credentials and modal to add new certificates |
| `/sessions` | `SessionsPage` | Confirmed/completed swap sessions with video links and peer review modal |
| `/calendar` | `CalendarPage` | Weekly visual schedule of booked learning sessions |
| `/messages` | `MessagesPage` | 1-on-1 direct messaging threads with peers |
| `/community` | `CommunityPage` | Campus leaderboard, badges catalog, and student code of mutual aid |
| `/projects` | `ProjectsPage` | Open student collaborative projects and project submission modal |
| `/skill-match` | `SkillMatchPage` | Automated 2-way complementary skill barter matcher |
| `/notifications` | `NotificationsPage` | Activity alerts, reviews, session confirmations, and badge unlocks |
| `/settings` | `SettingsPage` | Barter preferences, active student persona switcher, and log out |

---

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router v6, Tailwind CSS v3, Lucide Icons, Axios, Vite 5.
- **Backend**: Python 3.10+, FastAPI, Pydantic v2, SQLAlchemy 2.0, Uvicorn.
- **Database**: SQLite (`skillswap.db`) pre-seeded with 8 rich student profiles, 21 skills across 7 categories, sessions, reviews, certificates, and collaborative projects.

---

## 🏃 Running the Application

Both servers are currently running:

1. **Backend Server** (FastAPI):
   ```powershell
   cd C:\Users\HP\.gemini\antigravity\scratch\skillswap\backend
   python run.py
   # Runs on http://127.0.0.1:8000
   # Health check: http://127.0.0.1:8000/api/health
   # Interactive OpenAPI docs: http://127.0.0.1:8000/docs
   ```

2. **Frontend Client** (Vite + React):
   ```powershell
   cd C:\Users\HP\.gemini\antigravity\scratch\skillswap\frontend
   npm run dev
   # Runs on http://localhost:5173
   ```
