from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any, Dict
from datetime import datetime

class SkillBase(BaseModel):
    name: str
    category: str
    icon: Optional[str] = "Code"
    description: Optional[str] = ""

class SkillOut(SkillBase):
    id: int
    learner_count: Optional[int] = 0
    teacher_count: Optional[int] = 0

    class Config:
        from_attributes = True

class UserSkillOut(BaseModel):
    id: int
    skill_id: int
    name: str
    category: str
    icon: str
    skill_type: str
    proficiency: str
    endorsements_count: int

    class Config:
        from_attributes = True

class ProfileOut(BaseModel):
    learning_style: Optional[str] = "One-to-one, Project-based"
    skill_level: Optional[str] = "Intermediate"
    headline: Optional[str] = ""

    class Config:
        from_attributes = True

class AvailabilityOut(BaseModel):
    id: Optional[int] = None
    day_of_week: str
    time_slots: str
    is_available: bool = True

    class Config:
        from_attributes = True

class CertificateOut(BaseModel):
    id: int
    title: str
    issuer: str
    issue_date: str
    related_skill: Optional[str] = ""
    credential_url: Optional[str] = ""
    credential_id: Optional[str] = ""
    badge_icon: Optional[str] = "Award"
    is_verified: bool = False
    verification_status: Optional[str] = "Pending"
    file_name: Optional[str] = ""
    file_size: Optional[int] = 0
    mime_type: Optional[str] = ""
    has_file: Optional[bool] = False
    file_url: Optional[str] = ""
    created_at: Optional[str] = ""

    class Config:
        from_attributes = True

class CertificateCreate(BaseModel):
    title: str
    issuer: str
    issue_date: str
    related_skill: Optional[str] = ""
    credential_url: Optional[str] = ""
    credential_id: Optional[str] = ""
    badge_icon: Optional[str] = "Award"

class CertificateStatusUpdate(BaseModel):
    status: str # "Pending", "Verified", "Rejected"

class BadgeOut(BaseModel):
    id: int
    name: str
    description: str
    icon: str
    category: str
    xp_value: int

    class Config:
        from_attributes = True

class LearningGoalOut(BaseModel):
    id: int
    title: str
    target_date: str
    progress_pct: int
    status: str

    class Config:
        from_attributes = True

class LearningGoalCreate(BaseModel):
    title: str
    target_date: str
    progress_pct: Optional[int] = 0

class UserSummary(BaseModel):
    id: int
    name: str
    username: Optional[str] = None
    email: str
    avatar_url: Optional[str] = ""
    university: str
    major: str
    college: Optional[str] = ""
    course: Optional[str] = ""
    academic_year: Optional[str] = "Junior (3rd Year)"
    graduation_year: int
    bio: Optional[str] = ""
    is_onboarded: bool = False
    rating: float
    review_count: int
    sessions_completed: int
    xp: int
    level: int
    time_credits: int
    is_verified: bool
    is_admin: Optional[bool] = False
    teaching_skills: List[str] = []
    learning_skills: List[str] = []

    class Config:
        from_attributes = True

class UserProfileOut(UserSummary):
    skills: List[UserSkillOut] = []
    profile: Optional[ProfileOut] = None
    availabilities: List[AvailabilityOut] = []
    certificates: List[CertificateOut] = []
    learning_goals: List[LearningGoalOut] = []
    badges: List[BadgeOut] = []

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    university: Optional[str] = None
    major: Optional[str] = None
    college: Optional[str] = None
    course: Optional[str] = None
    academic_year: Optional[str] = None
    graduation_year: Optional[int] = None
    bio: Optional[str] = None
    headline: Optional[str] = None
    learning_style: Optional[str] = None
    skill_level: Optional[str] = None
    availability: Optional[List[Dict[str, Any]]] = None
    teaching_skills: Optional[List[Any]] = None
    learning_skills: Optional[List[Any]] = None

class UserLogin(BaseModel):
    email: str # email or username
    password: str
    remember_me: Optional[bool] = False

class UserRegister(BaseModel):
    name: str
    username: str
    email: EmailStr
    password: str
    confirm_password: Optional[str] = None
    college: Optional[str] = "UC Berkeley"
    course: Optional[str] = "Computer Science"
    academic_year: Optional[str] = "Junior (3rd Year)"
    avatar_url: Optional[str] = ""
    agree_terms: Optional[bool] = True

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class OnboardingSubmit(BaseModel):
    teaching_skills: List[str] = []
    learning_skills: List[str] = []
    skill_level: str = "Intermediate" # Beginner, Intermediate, Advanced
    learning_styles: List[str] = ["One-to-one"]
    availability: List[Dict[str, Any]] = [] # [{day: "Monday", slots: ["Morning", "Evening"]}]
    bio: Optional[str] = ""
    avatar_url: Optional[str] = ""

class SessionCreate(BaseModel):
    teacher_id: int
    skill_id: int
    title: str
    description: Optional[str] = ""
    scheduled_at: str
    duration_minutes: Optional[int] = 60
    notes: Optional[str] = ""

class ReviewCreate(BaseModel):
    session_id: int
    rating: float
    comment: str

class ReviewUpdate(BaseModel):
    rating: Optional[float] = None
    comment: Optional[str] = None

class ReviewOut(BaseModel):
    id: int
    session_id: int
    reviewer_id: int
    reviewer_name: str
    reviewer_avatar: str
    rating: float
    comment: str
    created_at: datetime

    class Config:
        from_attributes = True

class SessionOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = ""
    scheduled_at: str
    duration_minutes: int
    status: str
    meeting_link: str
    notes: Optional[str] = ""
    skill_name: str
    learner_id: int
    learner_name: str
    learner_avatar: str
    teacher_id: int
    teacher_name: str
    teacher_avatar: str
    review: Optional[ReviewOut] = None

    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    receiver_id: int
    content: str

class MessageOut(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    sender_name: str
    sender_avatar: str
    content: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ProjectOut(BaseModel):
    id: int
    title: str
    description: str
    skills_needed: str
    team_size: int
    status: str
    github_url: Optional[str] = ""
    creator_id: int
    creator_name: str
    creator_avatar: str
    creator_university: str

    class Config:
        from_attributes = True

class ProjectCreate(BaseModel):
    title: str
    description: str
    skills_needed: str
    team_size: Optional[int] = 3
    github_url: Optional[str] = ""

class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class StatsOut(BaseModel):
    skills_shared: str
    students_count: str
    sessions_completed: str
    average_rating: str
