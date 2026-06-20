# AI Study Hub

Ná»n táº£ng quáº£n lÃ½ tÃ i liá»‡u há»c táº­p cho sinh viÃªn FPT University. Sinh viÃªn upload tÃ i liá»‡u mÃ´n há»c lÃªn Library cÃ¡ nhÃ¢n, cÃ³ thá»ƒ request chia sáº» public Ä‘á»ƒ sinh viÃªn khÃ¡c xem. Admin duyá»‡t trÆ°á»›c khi tÃ i liá»‡u xuáº¥t hiá»‡n cÃ´ng khai. TÃ­ch há»£p AI chatbot Ä‘á»ƒ há»i Ä‘Ã¡p ná»™i dung tÃ i liá»‡u.

---

## YÃªu cáº§u cÃ i Ä‘áº·t

| CÃ´ng cá»¥ | PhiÃªn báº£n |
|---|---|
| Java | 25 (vá»›i `--enable-preview`) |
| Maven | 3.9+ |
| Node.js | 18+ |
| Python | **3.11 / 3.12 / 3.13** (âš ï¸ KHÃ”NG dÃ¹ng 3.14) |
| SQL Server | 2019+ |

---

## Cáº¥u trÃºc project

```
AI_Study_Hub_v3/
â”œâ”€â”€ backend/          â† Spring Boot (Java) â€” port 8080
â”œâ”€â”€ backend-python/   â† FastAPI (Python AI) â€” port 8000
â””â”€â”€ frontend/         â† React + Vite â€” port 5173
```

---

## 1. Database â€” SQL Server

### Táº¡o database vÃ  cháº¡y schema

1. Má»Ÿ SQL Server Management Studio (SSMS)
2. Táº¡o database tÃªn `AI_StudyHub`
3. Cháº¡y file `AI_StudyHub.sql` Ä‘á»ƒ táº¡o toÃ n bá»™ báº£ng, seed dá»¯ liá»‡u (Semester, Subject, Role, user test)

### Kiá»ƒm tra káº¿t ná»‘i

SQL Server pháº£i báº­t **TCP/IP trÃªn port 1433** (khÃ´ng dÃ¹ng instance name vÃ¬ SQL Server Browser cÃ³ thá»ƒ bá»‹ block UDP 1434):

1. Má»Ÿ **SQL Server Configuration Manager**
2. SQL Server Network Configuration â†’ Protocols for MSSQLSERVER â†’ TCP/IP â†’ Enable
3. Restart SQL Server service

---

## 2. Backend Java (Spring Boot)

### Cáº¥u hÃ¬nh `.env`

Táº¡o file `backend/.env` dá»±a theo `backend/.env.example`:

```env
# Database â€” Ä‘á»•i DB_HOST thÃ nh tÃªn mÃ¡y cá»§a báº¡n
DB_HOST=DESKTOP-ABCXYZ
DB_NAME=AI_StudyHub
DB_USERNAME=sa
DB_PASSWORD=12345

# JWT
JWT_SECRET=aistudyhub-super-secret-key-change-in-production-must-be-at-least-32-chars
JWT_EXPIRATION_MS=86400000

# Email (Gmail SMTP â€” cáº§n báº­t App Password)
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Python AI service
PYTHON_AI_BASE_URL=http://localhost:8000

# Supabase Storage
SUPABASE_URL=https://tutiziokwsmkmyqvdbls.supabase.co
SUPABASE_KEY=your-supabase-service-role-key
SUPABASE_BUCKET=documents

# Frontend URL (dÃ¹ng cho share link)
FRONTEND_URL=http://localhost:5173
```

> **LÆ°u Ã½ `DB_HOST`:** Thay báº±ng tÃªn mÃ¡y tÃ­nh cá»§a báº¡n. Xem tÃªn mÃ¡y báº±ng lá»‡nh `hostname` trong CMD.

### Cháº¡y backend

```bash
cd backend
mvn spring-boot:run
```

Backend cháº¡y táº¡i: http://localhost:8080

Kiá»ƒm tra: http://localhost:8080/api/health

---

## 3. Backend Python (AI Service)

> âš ï¸ **Báº¯t buá»™c dÃ¹ng Python 3.11/3.12/3.13** â€” Python 3.14 chÆ°a cÃ³ wheel cho `pydantic-core`, sáº½ lá»—i khi `pip install`.

### Táº¡o virtual environment

```powershell
cd backend-python

# Náº¿u mÃ¡y cÃ³ nhiá»u phiÃªn báº£n Python, chá»‰ Ä‘á»‹nh rÃµ
py -3.12 -m venv .venv

# Activate
.\.venv\Scripts\Activate.ps1   # Windows PowerShell
# hoáº·c
source .venv/bin/activate       # macOS/Linux
```

### CÃ i dependencies

```bash
pip install -r requirements.txt
```

### Cáº¥u hÃ¬nh `.env`

Táº¡o file `backend-python/.env` (khÃ´ng cÃ³ trong git):

```env
OPENAI_API_KEY=sk-...           # Optional: ChatGPT/OpenAI key
OPENAI_MODEL=gpt-4o-mini
LLM_PROVIDER=auto               # auto | openai | gemini

GEMINI_API_KEY=AIzaSy...        # Optional: Google AI Studio key
GEMINI_MODEL=gemini-2.5-flash
```

> AI provider: `LLM_PROVIDER=auto` uu tien `OPENAI_API_KEY`, neu khong co thi dung `GEMINI_API_KEY`, neu ca hai deu thieu thi service tu fallback sang mock mode.

### Cháº¡y Python service

```bash
python -m uvicorn main:app --reload --port 8000
```

Python service cháº¡y táº¡i: http://localhost:8000

Kiá»ƒm tra: http://localhost:8000/health

Swagger docs: http://localhost:8000/docs

---

## 4. Frontend (React + Vite)

### CÃ i dependencies

```bash
cd frontend
npm install
```

### Cháº¡y frontend

```bash
npm run dev
```

Frontend cháº¡y táº¡i: http://localhost:5173

---

## 5. Thá»© tá»± khá»Ÿi Ä‘á»™ng

Má»—i láº§n dev, khá»Ÿi Ä‘á»™ng theo thá»© tá»± nÃ y:

```
1. SQL Server (pháº£i Ä‘ang cháº¡y)
2. Backend Java   â†’ cd backend && mvn spring-boot:run
3. Python AI      â†’ cd backend-python && .venv\Scripts\Activate.ps1 && python -m uvicorn main:app --reload --port 8000
4. Frontend       â†’ cd frontend && npm run dev
```

---

## 6. TÃ i khoáº£n test

Sau khi cháº¡y `AI_StudyHub.sql`, DB Ä‘Ã£ cÃ³ sáºµn:

| Field | GiÃ¡ trá»‹ |
|---|---|
| user_id | 1 |
| Role | STUDENT |

DÃ¹ng tÃ i khoáº£n nÃ y Ä‘á»ƒ test cÃ¡c tÃ­nh nÄƒng Library, upload, AI Summary.

> TÃ i khoáº£n admin: Ä‘Äƒng kÃ½ tÃ i khoáº£n má»›i rá»“i Ä‘á»•i `role_id = 2` trá»±c tiáº¿p trong DB (báº£ng `USER`).

---

## 7. TÃ­nh nÄƒng Ä‘Ã£ hoáº¡t Ä‘á»™ng

- ÄÄƒng kÃ½ / Ä‘Äƒng nháº­p / quÃªn máº­t kháº©u (BE tháº­t, FE chÆ°a integrate JWT)
- Upload tÃ i liá»‡u â†’ Supabase Storage â†’ lÆ°u metadata DB
- Library cÃ¡ nhÃ¢n â€” add/remove course, upload/xÃ³a document
- Toggle visibility: PRIVATE â†’ PENDING_REVIEW â†’ PUBLIC (cooldown 1h)
- Admin duyá»‡t/tá»« chá»‘i document
- Äá»•i tÃªn document
- Share document qua link (`/share/:shareId`)
- AI Summarize (cáº§n Gemini API key há»£p lá»‡)
- AI Chat / RAG (cáº§n Gemini API key há»£p lá»‡)

---

## 8. CÃ¡c lá»—i thÆ°á»ng gáº·p

**`Could not connect to SQL Server`**
â†’ Kiá»ƒm tra `DB_HOST` trong `.env` Ä‘Ãºng tÃªn mÃ¡y chÆ°a. Cháº¡y `hostname` trong CMD Ä‘á»ƒ láº¥y tÃªn mÃ¡y.

**`pip install` lá»—i `link.exe failed` hoáº·c lá»—i Rust/maturin**
â†’ Äang dÃ¹ng Python 3.14. Táº¡o láº¡i venv báº±ng `py -3.12 -m venv .venv`.

**AI Summary luÃ´n tráº£ mock data**
â†’ Kiá»ƒm tra `GEMINI_API_KEY` trong `backend-python/.env`. Key pháº£i dáº¡ng `AIzaSy...`.

**`FK_AI_SUMMARY_DOCUMENT` khi xÃ³a document**
â†’ Äáº£m báº£o Ä‘ang dÃ¹ng `DocumentService.java` má»›i nháº¥t (Ä‘Ã£ cÃ³ `aiSummaryRepository.deleteByDocumentId()` trÆ°á»›c khi xÃ³a document).

**Share link tráº£ lá»—i `Query did not return a unique result`**
â†’ DB cÃ³ nhiá»u record `ACTIVE` cho cÃ¹ng 1 document. Äáº£m báº£o Ä‘ang dÃ¹ng `DocumentShareRepository.java` má»›i nháº¥t (dÃ¹ng `findFirst`).

---

## 9. Cáº¥u trÃºc thÆ° má»¥c chi tiáº¿t

```
backend/src/main/java/com/aistudyhub/
â”œâ”€â”€ config/          â† JWT, Security, WebClient config
â”œâ”€â”€ controller/      â† REST endpoints
â”œâ”€â”€ dto/             â† Request/Response DTO
â”œâ”€â”€ entity/          â† JPA entities (map DB tables)
â”œâ”€â”€ exception/       â† Custom exceptions (400/404/409/429)
â”œâ”€â”€ repository/      â† JPA + JdbcTemplate repositories
â”œâ”€â”€ security/        â† JWT filter & provider
â””â”€â”€ service/         â† Business logic

frontend/src/
â”œâ”€â”€ assets/          â† Logo, hÃ¬nh áº£nh
â”œâ”€â”€ components/      â† Reusable UI components
â”‚   â”œâ”€â”€ common/      â† ConfirmDialog, DocumentActionMenu, ShareDocumentModal...
â”‚   â”œâ”€â”€ layout/      â† StudentLayout, AdminLayout, ShareLayout
â”‚   â””â”€â”€ student/     â† DocumentCard, CourseCard...
â”œâ”€â”€ pages/
â”‚   â”œâ”€â”€ admin/       â† Admin*Page.jsx
â”‚   â”œâ”€â”€ auth/        â† Login, Register, ForgotPassword...
â”‚   â”œâ”€â”€ share/       â† SharedDocumentViewPage.jsx (public)
â”‚   â””â”€â”€ student/     â† Student*Page.jsx
â”œâ”€â”€ routes/          â† AppRouter.jsx
â””â”€â”€ services/        â† libraryApi.js, adminService.js, authService.js
```

