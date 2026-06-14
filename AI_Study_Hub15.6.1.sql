CREATE DATABASE AI_Study_Hub;
GO

USE AI_Study_Hub;
GO

CREATE TABLE [ROLE] (
    role_id INT IDENTITY(1,1) PRIMARY KEY,
    role_name NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE [USER] (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    role_id INT,
    full_name NVARCHAR(100),
    email NVARCHAR(255) UNIQUE NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    avatar_url NVARCHAR(MAX),
    status NVARCHAR(50),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    last_login DATETIME,
    CONSTRAINT FK_User_Role FOREIGN KEY (role_id) REFERENCES [ROLE](role_id)
);

CREATE TABLE SUBSCRIPTION_PLAN (
    plan_id INT IDENTITY(1,1) PRIMARY KEY,
    plan_name NVARCHAR(100),
    price DECIMAL(10,2),
    duration_month INT,
    max_storage INT,
    description NVARCHAR(MAX)
);

CREATE TABLE USER_SUBSCRIPTION (
    subscription_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    plan_id INT NOT NULL,
    start_date DATE,
    end_date DATE,
    status NVARCHAR(50),
    CONSTRAINT FK_UserSub_User FOREIGN KEY (user_id) REFERENCES [USER](user_id),
    CONSTRAINT FK_UserSub_Plan FOREIGN KEY (plan_id) REFERENCES SUBSCRIPTION_PLAN(plan_id)
);

CREATE TABLE PAYMENT_HISTORY (
    payment_id INT IDENTITY(1,1) PRIMARY KEY,
    subscription_id INT NOT NULL,
    amount DECIMAL(10,2),
    payment_method NVARCHAR(100),
    transaction_code NVARCHAR(100),
    payment_status NVARCHAR(50),
    payment_date DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Payment_Subscription FOREIGN KEY (subscription_id) REFERENCES USER_SUBSCRIPTION(subscription_id)
);

CREATE TABLE SEMESTER (
    semester_id INT IDENTITY(1,1) PRIMARY KEY,
    semester_name NVARCHAR(100),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE SUBJECT (
    subject_id INT IDENTITY(1,1) PRIMARY KEY,
    semester_id INT,
    subject_name NVARCHAR(100),
    description NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Subject_Semester FOREIGN KEY (semester_id) REFERENCES SEMESTER(semester_id)
);

CREATE TABLE DOCUMENT (
    document_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    subject_id INT,
    title NVARCHAR(255),
    document_name NVARCHAR(255),
    document_type NVARCHAR(50),
    document_size BIGINT,
    document_url NVARCHAR(MAX),
    visibility_status NVARCHAR(50),
    status NVARCHAR(50),
    uploaded_at DATETIME DEFAULT GETDATE(),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Document_User FOREIGN KEY (user_id) REFERENCES [USER](user_id),
    CONSTRAINT FK_Document_Subject FOREIGN KEY (subject_id) REFERENCES SUBJECT(subject_id)
);

CREATE TABLE DOCUMENT_SHARE (
    share_id INT IDENTITY(1,1) PRIMARY KEY,
    document_id INT NOT NULL,
    user_id INT NOT NULL,
    description NVARCHAR(MAX),
    share_type NVARCHAR(50),
    status NVARCHAR(50),
    CONSTRAINT FK_DocumentShare_Document FOREIGN KEY (document_id) REFERENCES DOCUMENT(document_id),
    CONSTRAINT FK_DocumentShare_User FOREIGN KEY (user_id) REFERENCES [USER](user_id)
);

CREATE TABLE AI_SUMMARY (
    summary_id INT IDENTITY(1,1) PRIMARY KEY,
    document_id INT NOT NULL,
    user_id INT NOT NULL,
    summary_content NVARCHAR(MAX),
    model_name NVARCHAR(100),
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_AISummary_Document FOREIGN KEY (document_id) REFERENCES DOCUMENT(document_id),
    CONSTRAINT FK_AISummary_User FOREIGN KEY (user_id) REFERENCES [USER](user_id)
);

CREATE TABLE AI_SUGGESTION (
    suggestion_id INT IDENTITY(1,1) PRIMARY KEY,
    document_id INT,
    semester_id INT,
    subject_id INT,
    confidence_score DECIMAL(5,2),
    reason NVARCHAR(MAX),
    status NVARCHAR(50),
    generated_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_AISuggestion_Document FOREIGN KEY (document_id) REFERENCES DOCUMENT(document_id),
    CONSTRAINT FK_AISuggestion_Semester FOREIGN KEY (semester_id) REFERENCES SEMESTER(semester_id),
    CONSTRAINT FK_AISuggestion_Subject FOREIGN KEY (subject_id) REFERENCES SUBJECT(subject_id)
);

CREATE TABLE CHAT_SESSION (
    session_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    document_id INT,
    session_title NVARCHAR(255),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_ChatSession_User FOREIGN KEY (user_id) REFERENCES [USER](user_id),
    CONSTRAINT FK_ChatSession_Document FOREIGN KEY (document_id) REFERENCES DOCUMENT(document_id)
);

CREATE TABLE CHAT_MESSAGE (
    message_id INT IDENTITY(1,1) PRIMARY KEY,
    session_id INT NOT NULL,
    session_type NVARCHAR(50),
    message_content NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_ChatMessage_Session FOREIGN KEY (session_id) REFERENCES CHAT_SESSION(session_id)
);

CREATE TABLE COMMENT (
    comment_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    document_id INT NOT NULL,
    session_type NVARCHAR(50),
    content NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Comment_User FOREIGN KEY (user_id) REFERENCES [USER](user_id),
    CONSTRAINT FK_Comment_Document FOREIGN KEY (document_id) REFERENCES DOCUMENT(document_id)
);

CREATE TABLE REPORT (
    report_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    document_id INT NOT NULL,
    reason NVARCHAR(MAX),
    description NVARCHAR(MAX),
    status NVARCHAR(50),
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Report_User FOREIGN KEY (user_id) REFERENCES [USER](user_id),
    CONSTRAINT FK_Report_Document FOREIGN KEY (document_id) REFERENCES DOCUMENT(document_id)
);

CREATE TABLE AI_QUESTION (
    question_id INT IDENTITY(1,1) PRIMARY KEY,
    document_id INT,
    title NVARCHAR(255),
    description NVARCHAR(MAX),
    total_question INT,
    time_limit INT,
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_AIQuestion_Document FOREIGN KEY (document_id) REFERENCES DOCUMENT(document_id)
);

CREATE TABLE QUIZ_TEST (
    practice_test_id INT IDENTITY(1,1) PRIMARY KEY,
    question_id INT NOT NULL,
    question_content NVARCHAR(MAX),
    question_type NVARCHAR(50),
    correct_answer NVARCHAR(MAX),
    difficulty_level NVARCHAR(50),
    CONSTRAINT FK_QuizTest_AIQuestion FOREIGN KEY (question_id) REFERENCES AI_QUESTION(question_id)
);

CREATE TABLE ANSWER_OPTION (
    option_id INT IDENTITY(1,1) PRIMARY KEY,
    question_id INT NOT NULL,
    option_content NVARCHAR(MAX),
    is_correct BIT DEFAULT 0,
    CONSTRAINT FK_AnswerOption_QuizTest FOREIGN KEY (question_id) REFERENCES QUIZ_TEST(practice_test_id)
);

CREATE TABLE TEST_ATTEMPT (
    attempt_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    test_id INT,
    question_id INT,
    start_time DATETIME,
    end_time DATETIME,
    score DECIMAL(5,2),
    status NVARCHAR(50),
    CONSTRAINT FK_TestAttempt_User FOREIGN KEY (user_id) REFERENCES [USER](user_id),
    CONSTRAINT FK_TestAttempt_AIQuestion FOREIGN KEY (test_id) REFERENCES AI_QUESTION(question_id),
    CONSTRAINT FK_TestAttempt_QuizTest FOREIGN KEY (question_id) REFERENCES QUIZ_TEST(practice_test_id)
);

CREATE TABLE USER_ANSWER (
    user_answer_id INT IDENTITY(1,1) PRIMARY KEY,
    attempt_id INT NOT NULL,
    question_id INT NOT NULL,
    option_id INT,
    selected_answer NVARCHAR(MAX),
    is_correct BIT,
    answered_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_UserAnswer_Attempt FOREIGN KEY (attempt_id) REFERENCES TEST_ATTEMPT(attempt_id),
    CONSTRAINT FK_UserAnswer_QuizTest FOREIGN KEY (question_id) REFERENCES QUIZ_TEST(practice_test_id),
    CONSTRAINT FK_UserAnswer_Option FOREIGN KEY (option_id) REFERENCES ANSWER_OPTION(option_id)
);

CREATE TABLE TEST_RESULT (
    result_id INT IDENTITY(1,1) PRIMARY KEY,
    attempt_id INT NOT NULL,
    total_question INT,
    correct_answer INT,
    score DECIMAL(5,2),
    grade NVARCHAR(20),
    generated_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_TestResult_Attempt FOREIGN KEY (attempt_id) REFERENCES TEST_ATTEMPT(attempt_id)
);

CREATE TABLE STUDY_ACTIVITY (
    activity_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    document_id INT,
    summary_id INT,
    session_id INT,
    question_id INT,
    activity_type NVARCHAR(50),
    study_duration INT,
    activity_date DATE,
    is_valid_streak BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_StudyActivity_User FOREIGN KEY (user_id) REFERENCES [USER](user_id),
    CONSTRAINT FK_StudyActivity_Document FOREIGN KEY (document_id) REFERENCES DOCUMENT(document_id),
    CONSTRAINT FK_StudyActivity_Summary FOREIGN KEY (summary_id) REFERENCES AI_SUMMARY(summary_id),
    CONSTRAINT FK_StudyActivity_Session FOREIGN KEY (session_id) REFERENCES CHAT_SESSION(session_id),
    CONSTRAINT FK_StudyActivity_AIQuestion FOREIGN KEY (question_id) REFERENCES AI_QUESTION(question_id)
);

CREATE TABLE STUDY_STREAK (
    streak_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_study_date DATE,
    streak_start_date DATE,
    total_study_days INT DEFAULT 0,
    status NVARCHAR(50),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_StudyStreak_User FOREIGN KEY (user_id) REFERENCES [USER](user_id)
);

CREATE TABLE ANNOUNCEMENT (
    announcement_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT,
    title NVARCHAR(255),
    content NVARCHAR(MAX),
    type NVARCHAR(50),
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Announcement_User FOREIGN KEY (user_id) REFERENCES [USER](user_id)
);

CREATE TABLE USER_ANNOUNCEMENT (
    user_announcement_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    announcement_id INT NOT NULL,
    is_read BIT DEFAULT 0,
    read_at DATETIME,
    CONSTRAINT FK_UserAnnouncement_User FOREIGN KEY (user_id) REFERENCES [USER](user_id),
    CONSTRAINT FK_UserAnnouncement_Announcement FOREIGN KEY (announcement_id) REFERENCES ANNOUNCEMENT(announcement_id)
);