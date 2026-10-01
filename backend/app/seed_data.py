from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .models import (
    User, Skill, UserSkill, Session as SessionModel, Review, Certificate,
    Message, LearningGoal, Badge, UserBadge, Project, Notification,
    Profile, Availability
)
from .security import hash_password

def seed_database(db: Session):
    # Check if already seeded
    if db.query(User).count() > 0:
        return

    print("Seeding SkillSwap database with realistic student data...")

    # 1. Create Badges
    badges_data = [
        {"name": "Master Mentor", "description": "Conducted over 25 verified peer teaching sessions", "icon": "GraduationCap", "category": "Teaching", "xp_value": 500},
        {"name": "Quick Learner", "description": "Completed 5 learning sessions across 3 domains", "icon": "Zap", "category": "Learning", "xp_value": 300},
        {"name": "5-Star Guru", "description": "Maintained a 5.0 rating across 10+ reviews", "icon": "Star", "category": "Reputation", "xp_value": 450},
        {"name": "Barter Legend", "description": "Exchanged 15+ skill hours through peer swap", "icon": "Repeat", "category": "Community", "xp_value": 400},
        {"name": "Certified Pro", "description": "Verified academic or industry credentials linked", "icon": "Award", "category": "Credibility", "xp_value": 250},
        {"name": "Hackathon Builder", "description": "Initiated a student collaborative project", "icon": "Rocket", "category": "Projects", "xp_value": 350},
    ]
    created_badges = []
    for b_data in badges_data:
        badge = Badge(**b_data)
        db.add(badge)
        created_badges.append(badge)
    db.flush()

    # 2. Create Skills
    skills_data = [
        # Tech
        {"name": "Python & Data Structures", "category": "Tech", "icon": "Terminal", "description": "Core algorithms, LeetCode patterns, and object-oriented architecture."},
        {"name": "React & Next.js", "category": "Tech", "icon": "Atom", "description": "Modern component architecture, hooks, state management, and SSR."},
        {"name": "TypeScript Fullstack", "category": "Tech", "icon": "FileCode", "description": "Strict types, API contracts, Prisma, and robust web applications."},
        {"name": "Machine Learning & PyTorch", "category": "Tech", "icon": "Brain", "description": "Neural networks, fine-tuning, transformers, and model evaluation."},
        {"name": "Rust Systems Programming", "category": "Tech", "icon": "Cpu", "description": "Memory safety without garbage collection, concurrency, and CLI tools."},
        {"name": "Docker & DevOps Basics", "category": "Tech", "icon": "Container", "description": "Containerization, CI/CD GitHub Actions, and cloud deployment."},
        
        # Design
        {"name": "Figma & UI/UX Design", "category": "Design", "icon": "Figma", "description": "Design systems, auto-layout, interactive prototyping, and wireframing."},
        {"name": "3D Modeling with Blender", "category": "Design", "icon": "Box", "description": "Mesh topology, lighting, shaders, and isometric rendering."},
        {"name": "Motion Graphics & After Effects", "category": "Design", "icon": "Video", "description": "Keyframe animation, UI micro-interactions, and visual storytelling."},
        
        # Data
        {"name": "SQL & Analytics Engineering", "category": "Data", "icon": "Database", "description": "Complex joins, window functions, dbt transformations, and query optimization."},
        {"name": "Pandas & Data Visualization", "category": "Data", "icon": "BarChart3", "description": "Data wrangling, seaborn statistical charts, and EDA reporting."},
        
        # Languages
        {"name": "Conversational Japanese", "category": "Languages", "icon": "Languages", "description": "JLPT N4/N3 grammar, natural phrasing, pronunciation, and cultural nuances."},
        {"name": "Business Spanish", "category": "Languages", "icon": "Globe", "description": "Professional speaking, email communication, and Latin American business idioms."},
        {"name": "French for Beginners", "category": "Languages", "icon": "MessageSquare", "description": "Pronunciation drills, everyday vocabulary, and conversational practice."},

        # Academics / Math
        {"name": "Linear Algebra & Multivariable Calculus", "category": "Academics", "icon": "Binary", "description": "Eigenvalues, vector spaces, gradient descent intuition, and surface integrals."},
        {"name": "Organic Chemistry Reaction Mechanisms", "category": "Academics", "icon": "FlaskConical", "description": "Arrow pushing, synthesis routes, stereochemistry, and spectroscopy."},
        {"name": "Microeconomic Theory", "category": "Academics", "icon": "TrendingUp", "description": "Consumer choice, game theory, monopoly vs competition equilibria."},

        # Business
        {"name": "Startup Pitching & VC Decks", "category": "Business", "icon": "Presentation", "description": "Storytelling, slide design, unit economics, and student hackathon pitch prep."},
        {"name": "Product Management Fundamentals", "category": "Business", "icon": "Kanban", "description": "PRDs, user research, agile sprints, roadmapping, and feature prioritization."},

        # Music & Creative
        {"name": "Ableton Live & Music Production", "category": "Music", "icon": "Music", "description": "Beatmaking, sound design with Serum, mixing, and EQ techniques."},
        {"name": "Digital Photography & Lightroom", "category": "Music", "icon": "Camera", "description": "Manual exposure, color grading curves, and portrait composition."}
    ]
    created_skills = {}
    for s_data in skills_data:
        skill = Skill(**s_data)
        db.add(skill)
        created_skills[s_data["name"]] = skill
    db.flush()

    # 3. Create Diverse Student Users
    students_data = [
        {
            "name": "Maya Lin",
            "email": "maya.lin@berkeley.edu",
            "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
            "university": "UC Berkeley",
            "major": "Computer Science & Cognitive Science",
            "graduation_year": 2026,
            "bio": "Senior at Cal building AI apps. Love teaching Python and fullstack React. Looking to exchange for Figma design and Conversational Japanese!",
            "rating": 4.95,
            "review_count": 28,
            "sessions_completed": 34,
            "xp": 3420,
            "level": 6,
            "time_credits": 14,
            "teach": [("Python & Data Structures", "Expert"), ("React & Next.js", "Advanced"), ("Machine Learning & PyTorch", "Intermediate")],
            "learn": [("Figma & UI/UX Design", "Beginner"), ("Conversational Japanese", "Beginner")],
            "certs": [
                {"title": "AWS Certified Cloud Practitioner", "issuer": "Amazon Web Services", "issue_date": "2025", "credential_id": "AWS-094821", "badge_icon": "Cloud"},
                {"title": "Meta Front-End Developer Professional", "issuer": "Meta Coursera", "issue_date": "2024", "credential_id": "META-FE-8271", "badge_icon": "Code"}
            ]
        },
        {
            "name": "Liam Vance",
            "email": "liam.vance@stanford.edu",
            "avatar_url": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80",
            "university": "Stanford University",
            "major": "Product Design & HCI",
            "graduation_year": 2025,
            "bio": "HCI graduate student passionate about craft. Former design intern at Figma. Happy to teach Design Systems and UI/UX in exchange for Rust or PyTorch.",
            "rating": 4.98,
            "review_count": 42,
            "sessions_completed": 51,
            "xp": 4850,
            "level": 8,
            "time_credits": 19,
            "teach": [("Figma & UI/UX Design", "Expert"), ("3D Modeling with Blender", "Advanced"), ("Product Management Fundamentals", "Intermediate")],
            "learn": [("Rust Systems Programming", "Beginner"), ("Machine Learning & PyTorch", "Beginner")],
            "certs": [
                {"title": "Google UX Design Professional Certificate", "issuer": "Google", "issue_date": "2024", "credential_id": "GOOG-UX-44812", "badge_icon": "Award"}
            ]
        },
        {
            "name": "Aarav Sharma",
            "email": "aarav.sharma@mit.edu",
            "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
            "university": "MIT",
            "major": "Electrical Engineering & CS",
            "graduation_year": 2026,
            "bio": "Competitive programmer & systems nerd. 2x ICPC regional finalist. Can help you crack LeetCode Hard and master Rust. Want to learn Business Spanish!",
            "rating": 4.92,
            "review_count": 31,
            "sessions_completed": 39,
            "xp": 3900,
            "level": 7,
            "time_credits": 12,
            "teach": [("Python & Data Structures", "Expert"), ("Rust Systems Programming", "Expert"), ("Linear Algebra & Multivariable Calculus", "Advanced")],
            "learn": [("Business Spanish", "Beginner"), ("Startup Pitching & VC Decks", "Beginner")],
            "certs": [
                {"title": "ICPC North America Regional Silver Medal", "issuer": "ICPC Foundation", "issue_date": "2025", "credential_id": "ICPC-2025-081", "badge_icon": "Award"}
            ]
        },
        {
            "name": "Chloe Dupont",
            "email": "chloe.dupont@nyu.edu",
            "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
            "university": "NYU Tisch & Stern",
            "major": "Interactive Media & Business",
            "graduation_year": 2025,
            "bio": "Parisian native studying media & entrepreneurship in NYC. Fluent French tutor and pitch deck designer. Looking to level up in React & TypeScript!",
            "rating": 4.88,
            "review_count": 22,
            "sessions_completed": 29,
            "xp": 2850,
            "level": 5,
            "time_credits": 15,
            "teach": [("French for Beginners", "Expert"), ("Startup Pitching & VC Decks", "Advanced"), ("Motion Graphics & After Effects", "Advanced")],
            "learn": [("React & Next.js", "Beginner"), ("TypeScript Fullstack", "Beginner")],
            "certs": [
                {"title": "DALF C2 French Mastery Certification", "issuer": "French Ministry of Education", "issue_date": "2023", "credential_id": "FR-DALF-9921", "badge_icon": "Award"}
            ]
        },
        {
            "name": "Kenji Sato",
            "email": "kenji.sato@utexas.edu",
            "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
            "university": "UT Austin",
            "major": "Data Science & Statistics",
            "graduation_year": 2026,
            "bio": "Bilingual (Tokyo & Austin). Teaching conversational Japanese and SQL analytics pipelines. Want to learn Ableton Live music production and 3D Blender.",
            "rating": 4.96,
            "review_count": 35,
            "sessions_completed": 44,
            "xp": 4200,
            "level": 7,
            "time_credits": 18,
            "teach": [("Conversational Japanese", "Expert"), ("SQL & Analytics Engineering", "Expert"), ("Pandas & Data Visualization", "Advanced")],
            "learn": [("Ableton Live & Music Production", "Beginner"), ("3D Modeling with Blender", "Beginner")],
            "certs": [
                {"title": "Databricks Certified Data Engineer Associate", "issuer": "Databricks", "issue_date": "2025", "credential_id": "DBX-ENG-721", "badge_icon": "Database"}
            ]
        },
        {
            "name": "Elena Rostova",
            "email": "elena.rostova@gatech.edu",
            "avatar_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
            "university": "Georgia Tech",
            "major": "Biomedical Engineering",
            "graduation_year": 2027,
            "bio": "Sophomore premed passionate about biochemistry & organic chemistry. Patient tutor with color-coded reaction mechanisms! Eager to learn Python for bioinformatics.",
            "rating": 4.90,
            "review_count": 19,
            "sessions_completed": 23,
            "xp": 2300,
            "level": 4,
            "time_credits": 8,
            "teach": [("Organic Chemistry Reaction Mechanisms", "Expert"), ("Microeconomic Theory", "Intermediate")],
            "learn": [("Python & Data Structures", "Beginner"), ("Docker & DevOps Basics", "Beginner")],
            "certs": [
                {"title": "ACS Organic Chemistry Division Excellence", "issuer": "American Chemical Society", "issue_date": "2025", "credential_id": "ACS-ORG-310", "badge_icon": "Award"}
            ]
        },
        {
            "name": "Marcus Sterling",
            "email": "marcus.sterling@harvard.edu",
            "avatar_url": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80",
            "university": "Harvard University",
            "major": "Economics & Applied Math",
            "graduation_year": 2025,
            "bio": "Senior writing an honors thesis on game theory. Passionate about financial modeling & venture capital pitching. Want to learn TypeScript web dev.",
            "rating": 4.87,
            "review_count": 26,
            "sessions_completed": 30,
            "xp": 3100,
            "level": 6,
            "time_credits": 11,
            "teach": [("Microeconomic Theory", "Expert"), ("Startup Pitching & VC Decks", "Advanced"), ("Linear Algebra & Multivariable Calculus", "Advanced")],
            "learn": [("TypeScript Fullstack", "Beginner"), ("Figma & UI/UX Design", "Beginner")],
            "certs": [
                {"title": "CFA Institute Investment Foundations", "issuer": "CFA Institute", "issue_date": "2024", "credential_id": "CFA-IF-991", "badge_icon": "Award"}
            ]
        },
        {
            "name": "Zoe Chen",
            "email": "zoe.chen@columbia.edu",
            "avatar_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
            "university": "Columbia University",
            "major": "Sound Arts & Computer Science",
            "graduation_year": 2026,
            "bio": "Music producer and audio programmer. Teaching synth design in Ableton and creative DSP. Looking for students who can teach Docker & AWS cloud deployment.",
            "rating": 4.97,
            "review_count": 38,
            "sessions_completed": 47,
            "xp": 4500,
            "level": 8,
            "time_credits": 16,
            "teach": [("Ableton Live & Music Production", "Expert"), ("Digital Photography & Lightroom", "Advanced"), ("Docker & DevOps Basics", "Intermediate")],
            "learn": [("Docker & DevOps Basics", "Advanced"), ("Machine Learning & PyTorch", "Intermediate")],
            "certs": [
                {"title": "Avid Pro Tools Certified User", "issuer": "Avid Technology", "issue_date": "2024", "credential_id": "AVID-PT-112", "badge_icon": "Music"}
            ]
        }
    ]

    created_users = []
    for s_info in students_data:
        teach_list = s_info.pop("teach")
        learn_list = s_info.pop("learn")
        certs_list = s_info.pop("certs")
        
        # Add auth and profile defaults
        username_slug = s_info["name"].lower().replace(" ", "_")
        s_info["username"] = username_slug
        s_info["password_hash"] = hash_password("demo123")
        s_info["college"] = s_info.get("university", "UC Berkeley")
        s_info["course"] = s_info.get("major", "Computer Science")
        s_info["academic_year"] = "Senior (4th Year)" if s_info.get("graduation_year", 2026) <= 2025 else "Junior (3rd Year)"
        s_info["is_onboarded"] = True
        s_info["terms_agreed"] = True
        
        user = User(**s_info)
        db.add(user)
        db.flush()
        created_users.append(user)

        # Attach Profile
        profile = Profile(
            user_id=user.id,
            learning_style="One-to-one, Project-based",
            skill_level="Advanced" if user.level > 5 else "Intermediate",
            headline=f"{user.course} student @ {user.college}"
        )
        db.add(profile)

        # Attach default Availability
        availabilities = [
            Availability(user_id=user.id, day_of_week="Monday", time_slots="Evening (5 PM - 8 PM)", is_available=True),
            Availability(user_id=user.id, day_of_week="Wednesday", time_slots="Afternoon (2 PM - 5 PM)", is_available=True),
            Availability(user_id=user.id, day_of_week="Saturday", time_slots="Morning (10 AM - 1 PM)", is_available=True),
        ]
        db.add_all(availabilities)

        # Attach User Skills
        for skill_name, prof in teach_list:
            if skill_name in created_skills:
                us = UserSkill(
                    user_id=user.id,
                    skill_id=created_skills[skill_name].id,
                    skill_type="teach",
                    proficiency=prof,
                    endorsements_count=user.sessions_completed // 2 + 3
                )
                db.add(us)

        for skill_name, prof in learn_list:
            if skill_name in created_skills:
                us = UserSkill(
                    user_id=user.id,
                    skill_id=created_skills[skill_name].id,
                    skill_type="learn",
                    proficiency=prof,
                    endorsements_count=1
                )
                db.add(us)

        # Attach Certificates
        for cert in certs_list:
            c = Certificate(
                user_id=user.id,
                title=cert["title"],
                issuer=cert["issuer"],
                issue_date=cert["issue_date"],
                credential_id=cert["credential_id"],
                badge_icon=cert.get("badge_icon", "Award"),
                is_verified=True
            )
            db.add(c)

        # Attach Badges
        for b in created_badges[:3]:
            ub = UserBadge(user_id=user.id, badge_id=b.id)
            db.add(ub)

        # Add sample learning goals
        lg1 = LearningGoal(
            user_id=user.id,
            title=f"Master {learn_list[0][0]} fundamentals",
            target_date="Next month",
            progress_pct=45,
            status="in_progress"
        )
        lg2 = LearningGoal(
            user_id=user.id,
            title="Complete 5 peer exchange sessions this semester",
            target_date="End of semester",
            progress_pct=80,
            status="in_progress"
        )
        db.add(lg1)
        db.add(lg2)

    db.flush()

    # 4. Create Sample Sessions & Reviews
    maya = created_users[0]
    liam = created_users[1]
    aarav = created_users[2]
    chloe = created_users[3]
    kenji = created_users[4]

    session1 = SessionModel(
        learner_id=liam.id,
        teacher_id=maya.id,
        skill_id=created_skills["Python & Data Structures"].id,
        title="Intro to Binary Trees & LeetCode Graph Traversal",
        description="Covered DFS/BFS on graphs and solved 3 medium LeetCode problems together with visual diagrams.",
        scheduled_at="Yesterday at 3:00 PM",
        duration_minutes=60,
        status="completed",
        meeting_link="https://meet.skillswap.edu/room-maya-liam-trees",
        notes="Liam grasped BFS queues rapidly. Recommended practicing Dijkstra next."
    )
    db.add(session1)
    db.flush()

    rev1 = Review(
        session_id=session1.id,
        reviewer_id=liam.id,
        reviewee_id=maya.id,
        rating=5.0,
        comment="Maya is an incredible peer teacher! She broke down complex graph concepts into intuitive mental models. Will definitely book another session."
    )
    db.add(rev1)

    session2 = SessionModel(
        learner_id=maya.id,
        teacher_id=liam.id,
        skill_id=created_skills["Figma & UI/UX Design"].id,
        title="Figma Auto-Layout & Component Variants Deep Dive",
        description="Constructed a dark mode design system token set and responsive card component.",
        scheduled_at="Tomorrow at 4:30 PM",
        duration_minutes=60,
        status="confirmed",
        meeting_link="https://meet.skillswap.edu/room-liam-maya-figma",
        notes="Prepare Figma file link and sample dark palette prior to call."
    )
    db.add(session2)

    session3 = SessionModel(
        learner_id=chloe.id,
        teacher_id=kenji.id,
        skill_id=created_skills["Conversational Japanese"].id,
        title="Everyday Japanese Phrases & Hiragana Practice",
        description="Practiced restaurant ordering phrases and polite verb conjugations.",
        scheduled_at="3 days ago",
        duration_minutes=45,
        status="completed",
        meeting_link="https://meet.skillswap.edu/room-kenji-chloe",
        notes="Chloe's pronunciation was spot on. Homework: memorize 10 daily adjectives."
    )
    db.add(session3)
    db.flush()

    rev2 = Review(
        session_id=session3.id,
        reviewer_id=chloe.id,
        reviewee_id=kenji.id,
        rating=5.0,
        comment="Super patient and encouraging tutor! Kenji gave real-life conversational context you can't get from textbooks."
    )
    db.add(rev2)

    session4 = SessionModel(
        learner_id=aarav.id,
        teacher_id=chloe.id,
        skill_id=created_skills["Startup Pitching & VC Decks"].id,
        title="Hackathon Pitch Slide Deck Structure & Delivery",
        description="Critiqued Aarav's 3-minute pitch deck for MIT TechX hackathon.",
        scheduled_at="Next Friday at 2:00 PM",
        duration_minutes=60,
        status="confirmed",
        meeting_link="https://meet.skillswap.edu/room-chloe-aarav-pitch",
        notes="Review investor deck slide 4-7 problem statement before meeting."
    )
    db.add(session4)

    # 5. Create Community Projects
    projects_data = [
        {
            "creator_id": maya.id,
            "title": "EcoCampus – Campus Sustainability & Food Rescue App",
            "description": "Building an open-source React Native + FastAPI mobile application to connect campus dining halls with student food co-ops to prevent waste.",
            "skills_needed": "React Native, FastAPI, Figma, UI/UX",
            "team_size": 4,
            "status": "open",
            "github_url": "https://github.com/skillswap-projects/ecocampus"
        },
        {
            "creator_id": liam.id,
            "title": "DesignTokens CLI – Open Source Figma Token Exporter",
            "description": "Collaborative project to build a zero-config Rust CLI tool that translates Figma design tokens into Tailwind CSS and CSS variables automatically.",
            "skills_needed": "Rust, Figma API, CLI Design",
            "team_size": 3,
            "status": "in_progress",
            "github_url": "https://github.com/skillswap-projects/designtokens-cli"
        },
        {
            "creator_id": kenji.id,
            "title": "StudySync – Peer Pomodoro & Virtual Study Rooms",
            "description": "WebRTC-powered study room platform with synchronized ambient soundscapes and automated learning goal check-ins.",
            "skills_needed": "WebRTC, TypeScript, React, Tailwind",
            "team_size": 4,
            "status": "open",
            "github_url": "https://github.com/skillswap-projects/studysync"
        }
    ]
    for p in projects_data:
        proj = Project(**p)
        db.add(proj)

    # 6. Sample Messages between Maya and Liam
    msgs = [
        {"sender_id": liam.id, "receiver_id": maya.id, "content": "Hey Maya! Loved the graph traversal session yesterday. It made the tree problem so much clearer!"},
        {"sender_id": maya.id, "receiver_id": liam.id, "content": "So glad it helped Liam! Ready for our Figma auto-layout session tomorrow? I have our mock design wireframe ready."},
        {"sender_id": liam.id, "receiver_id": maya.id, "content": "Awesome, I sent over the Figma invite link to your email. See you at 4:30 PM!"}
    ]
    for m in msgs:
        msg = Message(**m)
        db.add(msg)

    # 7. Notifications
    notifs = [
        {"user_id": maya.id, "title": "Session Confirmed", "message": "Liam Vance confirmed your Figma Auto-Layout session for tomorrow at 4:30 PM.", "type": "session"},
        {"user_id": maya.id, "title": "Badge Unlocked!", "message": "You earned the Master Mentor badge for passing 25+ teaching sessions!", "type": "badge"},
        {"user_id": maya.id, "title": "New 5-Star Review", "message": "Liam left you a 5-star review: 'Maya is an incredible peer teacher!'", "type": "review"},
    ]
    for n in notifs:
        notif = Notification(**n)
        db.add(notif)

    db.commit()
    print("SkillSwap database seeded successfully!")
