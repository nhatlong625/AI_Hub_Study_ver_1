# AI Study Hub — Frontend

**Tech stack:** React 18 · React Router v6 · Tailwind CSS v4 · Vite

## Cấu trúc project

```
src/
├── assets/
│   ├── logos/          # logo.png, logo-icon.png, logo-full.png, logo-FPT.png
│   ├── images/         # hero-imac.png, social-proof.png, logo.png (alias)
│   └── landingImages/  # desktop_mockup.png, students_illustration.png, ...
│
├── components/
│   ├── admin/          # AdminMetricCard
│   ├── auth/           # LoginModal, AuthShell
│   ├── common/         # Modal, Button, Input, Badge, Card, Table, ...
│   ├── landing/        # Navbar, Footer, FeatureHighlight
│   ├── layout/         # StudentLayout, StudentSidebar, StudentTopbar
│   │                   # AdminLayout, AdminSidebar
│   │                   # PublicLayout, PublicNavbar, PublicFooter
│   └── student/
│       ├── chat/       # ChatSidebar, ChatMessage, ChatInput, ...
│       ├── CourseCard.jsx
│       └── DocumentCard.jsx
│
├── hooks/
│   ├── useHistory.js   # browse history (session)
│   ├── useModal.js
│   └── useSidebar.js   # sidebar collapse state (localStorage)
│
├── mocks/              # mock data cho development
│   ├── coursesMock.js
│   ├── documentsMock.js
│   ├── libraryMock.js
│   ├── chatMock.js
│   ├── quizMock.js
│   ├── adminMock.js
│   ├── notificationsMock.js
│   └── userMock.js
│
├── pages/
│   ├── admin/          # Dashboard, Users, Library, Documents, Payments, ...
│   ├── auth/           # Login, Register, ForgotPassword, VerifyEmail,
│   │                   # ResetPassword, ResetSuccess
│   ├── landing/        # FeaturesPage, GuidePage, PricingPage
│   └── student/
│       ├── HomePage.jsx              # Trang chủ student (base)
│       ├── HomeCourseDetailPage.jsx  # Chi tiết môn học (base)
│       ├── LibraryPage.jsx           # Thư viện semester/subject (base)
│       ├── LibraryCourseDetailPage.jsx
│       ├── DocumentViewPage.jsx
│       ├── AITutorPage.jsx           # AI Tutor landing (base)
│       ├── AIChatPage.jsx            # AI Chat thực sự (từ frontend/)
│       ├── SelectContextPage.jsx
│       ├── PracticeTestsPage.jsx
│       ├── GeneratePracticeTestPage.jsx
│       ├── QuizTakingPage.jsx
│       ├── QuizResultPage.jsx
│       ├── UploadDocumentPage.jsx
│       ├── CoursesPage.jsx
│       ├── MyCoursesPage.jsx
│       ├── ProfilePage.jsx
│       ├── StudentSettingsPage.jsx
│       └── ComingSoonPage.jsx        # Placeholder cho pages chưa làm
│
├── routes/
│   ├── AppRouter.jsx   # Tất cả routes gộp lại
│   └── ScrollToTop.jsx
│
├── services/
│   ├── api.js          # Semester, Subject, Document API (Spring Boot :8080)
│   ├── aiChatService.js # AI Chat API
│   ├── authService.js
│   ├── adminService.js
│   ├── studentService.js
│   └── frontendLogger.js
│
├── styles/
│   ├── index.css       # Entry point: Tailwind + custom animations + legacy CSS
│   ├── variables.css
│   ├── components.css  # Legacy CSS cho admin pages
│   ├── layout.css
│   ├── pages.css
│   ├── landing.css
│   └── register.css
│
├── utils/
│   └── formatters.js
│
├── App.jsx
└── main.jsx
```

## Routes

| Path | Page |
|------|------|
| `/` | → redirect `/features` |
| `/features` | FeaturesPage |
| `/guide` | GuidePage |
| `/pricing` | PricingPage |
| `/login` | LoginPage |
| `/register` | RegisterPage |
| `/forgot-password` | ForgotPasswordPage |
| `/verify-email` | VerifyEmailPage |
| `/reset-password` | ResetPasswordPage |
| `/reset-success` | ResetSuccessPage |
| `/student/home` | HomePage |
| `/student/courses/:courseId` | HomeCourseDetailPage |
| `/student/library` | LibraryPage |
| `/student/library/:courseId` | LibraryCourseDetailPage |
| `/student/documents/:documentId` | DocumentViewPage |
| `/student/upload-document` | UploadDocumentPage |
| `/student/ai-tutor` | AITutorPage |
| `/student/ai-tutor/chat` | AIChatPage |
| `/student/ai-tutor/chat/:threadId` | AIChatPage |
| `/student/practice-tests` | PracticeTestsPage |
| `/student/quiz/:quizId` | QuizTakingPage |
| `/admin/dashboard` | AdminDashboardPage |
| `/admin/users` | UserManagementPage |
| *(xem AppRouter.jsx cho đầy đủ)* | |

## Getting started

```bash
cd ai-study-hub
npm install
npm run dev
```

Backend cần chạy ở:
- Spring Boot: `localhost:8080`
- Python AI: `localhost:8000`

## Notes

- **Admin pages** hiện vẫn dùng CSS class từ `pages.css` / `components.css`.
  TODO: Rewrite sang Tailwind thuần.
- **Auth pages** và **Student pages** (base) đã thuần Tailwind.
- **mocks/** dùng cho dev, thay bằng API thật khi backend sẵn sàng.
