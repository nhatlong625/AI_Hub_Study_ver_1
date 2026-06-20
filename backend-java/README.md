# AI Study Hub — Backend (Java)

Spring Boot 3.5 · Java 25 · SQL Server · Supabase Storage

## Khởi chạy

```bash
# 1. Copy và điền .env
cp .env.example .env

# 2. Chạy
mvn spring-boot:run
# hoặc
./mvnw spring-boot:run
```

Server chạy tại `http://localhost:8080`

## API Endpoints

| Method | Path | Mô tả | Auth |
|--------|------|-------|------|
| POST | `/api/auth/register` | Đăng ký | Public |
| GET | `/api/auth/verify-email?token=` | Xác thực email | Public |
| POST | `/api/auth/login` | Đăng nhập → JWT | Public |
| POST | `/api/auth/forgot-password` | Gửi email reset | Public |
| POST | `/api/auth/reset-password` | Đặt lại mật khẩu | Public |
| GET | `/api/semesters` | Danh sách semester + subject | JWT |
| GET | `/api/subjects/semester/{id}` | Subjects theo semester | JWT |
| POST | `/api/subjects` | Tạo subject mới | JWT |
| DELETE | `/api/subjects/{id}` | Xóa subject | JWT |
| GET | `/api/documents` | Tất cả documents | JWT |
| POST | `/api/documents/upload` | Upload file → Supabase | JWT |
| GET | `/api/documents/{id}` | Chi tiết document | JWT |
| GET | `/api/documents/subject/{id}` | Documents theo subject | JWT |
| GET | `/api/documents/user/{id}` | Documents theo user | JWT |
| PATCH | `/api/documents/{id}/visibility` | Cập nhật visibility | JWT |
| DELETE | `/api/documents/{id}` | Xóa document + Supabase | JWT |
| GET | `/api/chat/sessions?userId=` | Danh sách chat sessions | JWT |
| POST | `/api/chat/sessions` | Tạo chat session mới | JWT |
| GET | `/api/chat/sessions/{id}/messages` | Lịch sử tin nhắn | JWT |
| DELETE | `/api/chat/sessions/{id}` | Xóa session | JWT |
| POST | `/api/chat/ask` | Hỏi AI (proxy → Python) | JWT |
| GET | `/api/health` | Health check | Public |

## Cấu trúc project

```
src/main/java/com/aistudyhub/
├── AiStudyHubApplication.java
├── config/          # JwtConfig, SecurityConfig, WebClientConfig
├── controller/      # Auth, Semester, Subject, Document, Chat, Health
├── dto/
│   ├── request/     # RegisterRequest, LoginRequest, ChatAskRequest...
│   └── response/    # AuthResponse, SemesterResponse, DocumentResponse...
├── entity/          # User, AuthToken, Semester, Subject, Document
├── exception/       # GlobalExceptionHandler + custom exceptions
├── repository/      # JPA repos (User, AuthToken, Semester, Subject, Document)
│                    # JDBC repos (ChatSession, ChatMessage)
├── security/        # JwtTokenProvider, JwtAuthenticationFilter
└── service/
    ├── impl/        # AuthServiceImpl, EmailServiceImpl
    ├── AuthService, EmailService (interfaces)
    ├── SemesterService, SubjectService
    ├── DocumentService  (upload Supabase + CRUD)
    └── ChatService      (proxy → Python AI)
```

## Dependencies quan trọng

- Spring Security + JJWT 0.12.6
- Spring Data JPA + mssql-jdbc (SQL Server)
- Spring WebFlux / WebClient (gọi Supabase + Python AI)
- Spring Mail (Gmail SMTP)
- Lombok
