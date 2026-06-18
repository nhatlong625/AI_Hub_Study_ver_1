USE master;
GO

IF EXISTS (SELECT name FROM sys.databases WHERE name = 'AIStudyHubDB')
BEGIN
    ALTER DATABASE AI_StudyHub SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE AI_StudyHub;
END
GO

CREATE DATABASE AI_StudyHub;
GO

USE AI_StudyHub;
GO

/*============================================================
=                         ROLE                              =
============================================================*/

CREATE TABLE ROLE
(
    role_id INT IDENTITY(1,1) PRIMARY KEY,
    role_name NVARCHAR(50) NOT NULL UNIQUE,
    description NVARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NULL
);
GO


/*============================================================
=                         USER                              =
============================================================*/

CREATE TABLE [USER]
(
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    role_id INT NOT NULL,
    full_name NVARCHAR(100) NOT NULL,
    email NVARCHAR(150) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    avatar_url NVARCHAR(500) NULL,
    status NVARCHAR(30) NOT NULL DEFAULT 'Active',
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NULL,
    last_login DATETIME NULL,

    CONSTRAINT FK_USER_ROLE
        FOREIGN KEY (role_id)
        REFERENCES ROLE(role_id)
);
GO


/*============================================================
=                    SUBSCRIPTION_PLAN                      =
============================================================*/

CREATE TABLE SUBSCRIPTION_PLAN
(
    plan_id INT IDENTITY(1,1) PRIMARY KEY,
    plan_name NVARCHAR(100) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    duration_month INT NOT NULL,
    max_storage INT NOT NULL,
    description NVARCHAR(500) NULL
);
GO


/*============================================================
=                    USER_SUBSCRIPTION                      =
============================================================*/

CREATE TABLE USER_SUBSCRIPTION
(
    subscription_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    plan_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status NVARCHAR(30) NOT NULL,
    CONSTRAINT FK_USER_SUBSCRIPTION_USER
        FOREIGN KEY (user_id)
        REFERENCES [USER](user_id),

    CONSTRAINT FK_USER_SUBSCRIPTION_PLAN
        FOREIGN KEY (plan_id)
        REFERENCES SUBSCRIPTION_PLAN(plan_id)
);
GO


/*============================================================
=                    PAYMENT_HISTORY                        =
============================================================*/

CREATE TABLE PAYMENT_HISTORY
(
    payment_id INT IDENTITY(1,1) PRIMARY KEY,
    subscription_id INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_method NVARCHAR(50) NOT NULL,
    transaction_code NVARCHAR(100) NOT NULL,
    payment_status NVARCHAR(30) NOT NULL,
    payment_date DATETIME NOT NULL,
    CONSTRAINT FK_PAYMENT_HISTORY_SUBSCRIPTION
        FOREIGN KEY (subscription_id)
        REFERENCES USER_SUBSCRIPTION(subscription_id)
);
GO

/*============================================================
=                         SEMESTER                          =
============================================================*/

CREATE TABLE SEMESTER
(
    semester_id INT IDENTITY(1,1) PRIMARY KEY,
    semester_name NVARCHAR(100) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NULL
);
GO


/*============================================================
=                         SUBJECT                           =
============================================================*/

CREATE TABLE SUBJECT
(
    subject_id INT IDENTITY(1,1) PRIMARY KEY,
    semester_id INT NOT NULL,
    subject_name NVARCHAR(100) NOT NULL,
    description NVARCHAR(500) NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NULL,
    CONSTRAINT FK_SUBJECT_SEMESTER
        FOREIGN KEY (semester_id)
        REFERENCES SEMESTER(semester_id)
);
GO


/*============================================================
=                         DOCUMENT                          =
============================================================*/

CREATE TABLE DOCUMENT
(
    document_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    subject_id INT NOT NULL,
    title NVARCHAR(255) NOT NULL,
    document_name NVARCHAR(255) NOT NULL,
    document_type NVARCHAR(50) NOT NULL,
    document_size BIGINT NOT NULL,
    document_url NVARCHAR(500) NOT NULL,
    visibility_status NVARCHAR(30) NOT NULL,
    status NVARCHAR(30) NOT NULL,
    uploaded_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NULL,

    CONSTRAINT FK_DOCUMENT_USER
        FOREIGN KEY (user_id)
        REFERENCES [USER](user_id),

    CONSTRAINT FK_DOCUMENT_SUBJECT
        FOREIGN KEY (subject_id)
        REFERENCES SUBJECT(subject_id)
);
GO

/*============================================================
=                    DOCUMENT_SHARE                         =
============================================================*/

CREATE TABLE DOCUMENT_SHARE
(
    share_id INT IDENTITY(1,1) PRIMARY KEY,
    document_id INT NOT NULL,
    user_id INT NOT NULL,
    description NVARCHAR(500) NULL,
    share_type NVARCHAR(30) NOT NULL,
    status NVARCHAR(30) NOT NULL,

    CONSTRAINT FK_DOCUMENT_SHARE_DOCUMENT
        FOREIGN KEY (document_id)
        REFERENCES DOCUMENT(document_id),

    CONSTRAINT FK_DOCUMENT_SHARE_USER
        FOREIGN KEY (user_id)
        REFERENCES [USER](user_id)
);
GO


/*============================================================
=                       AI_SUMMARY                          =
============================================================*/

CREATE TABLE AI_SUMMARY
(
	summary_id INT IDENTITY(1,1) PRIMARY KEY,
    document_id INT NOT NULL,
    user_id INT NOT NULL,
    summary_content NVARCHAR(MAX) NOT NULL,
    model_name NVARCHAR(100) NOT NULL,
    created_at DATETIME NOT NULL,

    CONSTRAINT FK_AI_SUMMARY_DOCUMENT
        FOREIGN KEY (document_id)
        REFERENCES DOCUMENT(document_id),

    CONSTRAINT FK_AI_SUMMARY_USER
        FOREIGN KEY (user_id)
        REFERENCES [USER](user_id)
);
GO


/*============================================================
=                       AI_SUGGESTION                       =
============================================================*/

CREATE TABLE AI_SUGGESTION
(
    suggestion_id INT IDENTITY(1,1) PRIMARY KEY,
    document_id INT NOT NULL,
    semester_id INT NOT NULL,
    subject_id INT NOT NULL,
    confidence_score DECIMAL(5,2) NOT NULL,
    reason NVARCHAR(MAX) NULL,
    status NVARCHAR(30) NOT NULL,
    generated_at DATETIME NOT NULL,

    CONSTRAINT FK_AI_SUGGESTION_DOCUMENT
        FOREIGN KEY (document_id)
        REFERENCES DOCUMENT(document_id),

    CONSTRAINT FK_AI_SUGGESTION_SEMESTER
        FOREIGN KEY (semester_id)
        REFERENCES SEMESTER(semester_id),

    CONSTRAINT FK_AI_SUGGESTION_SUBJECT
        FOREIGN KEY (subject_id)
        REFERENCES SUBJECT(subject_id)
);
GO

/*============================================================
=                       CHAT_SESSION                        =
============================================================*/

CREATE TABLE CHAT_SESSION
(
    session_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    document_id INT NOT NULL,
    session_title NVARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NULL,

    CONSTRAINT FK_CHAT_SESSION_USER
        FOREIGN KEY (user_id)
        REFERENCES [USER](user_id),

    CONSTRAINT FK_CHAT_SESSION_DOCUMENT
        FOREIGN KEY (document_id)
        REFERENCES DOCUMENT(document_id)
);
GO


/*============================================================
=                       CHAT_MESSAGE                        =
============================================================*/

CREATE TABLE CHAT_MESSAGE
(
    message_id INT IDENTITY(1,1) PRIMARY KEY,
    session_id INT NOT NULL,
    session_type NVARCHAR(30) NOT NULL,
    message_content NVARCHAR(MAX) NOT NULL,
    created_at DATETIME NOT NULL,

    CONSTRAINT FK_CHAT_MESSAGE_SESSION
        FOREIGN KEY (session_id)
        REFERENCES CHAT_SESSION(session_id)
);
GO


/*============================================================
=                         COMMENT                           =
============================================================*/

CREATE TABLE COMMENT
(
    comment_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    document_id INT NOT NULL,
    session_type NVARCHAR(30) NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    created_at DATETIME NOT NULL,

    CONSTRAINT FK_COMMENT_USER
        FOREIGN KEY (user_id)
        REFERENCES [USER](user_id),

    CONSTRAINT FK_COMMENT_DOCUMENT
        FOREIGN KEY (document_id)
        REFERENCES DOCUMENT(document_id)
);
GO

/*============================================================
=                       AI_QUESTION                         =
============================================================*/

CREATE TABLE AI_QUESTION
(
    question_id INT IDENTITY(1,1) PRIMARY KEY,
    document_id INT NOT NULL,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    total_question INT NOT NULL,
    time_limit INT NOT NULL,
    created_at DATETIME NOT NULL,

    CONSTRAINT FK_QUESTION_DOCUMENT
        FOREIGN KEY (document_id)
        REFERENCES DOCUMENT(document_id)
);
GO


/*============================================================
=                        QUIZ_TEST                          =
============================================================*/

CREATE TABLE QUIZ_TEST
(
    quiz_id INT IDENTITY(1,1) PRIMARY KEY,
    question_id INT NOT NULL,
    question_content NVARCHAR(MAX) NOT NULL,
    question_type NVARCHAR(50) NOT NULL,
    correct_answer NVARCHAR(MAX) NOT NULL,
    difficulty_level NVARCHAR(30) NOT NULL,

    CONSTRAINT FK_QUIZ_TEST_AI_QUESTION
        FOREIGN KEY (question_id)
        REFERENCES AI_QUESTION(question_id)
);
GO

/*============================================================
=                       TEST_ATTEMPT                        =
============================================================*/

CREATE TABLE TEST_ATTEMPT
(
    attempt_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    test_id INT NOT NULL,
    question_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NULL,
    score DECIMAL(5,2) NULL,
    status NVARCHAR(30) NOT NULL,

    CONSTRAINT FK_TEST_ATTEMPT_USER
        FOREIGN KEY (user_id)
        REFERENCES [USER](user_id),

    CONSTRAINT FK_TEST_ATTEMPT_QUIZ
        FOREIGN KEY (test_id)
        REFERENCES QUIZ_TEST(quiz_id)
);
GO

/*============================================================
=                       TEST_RESULT                         =
============================================================*/

CREATE TABLE TEST_RESULT
(
    result_id INT IDENTITY(1,1) PRIMARY KEY,

    attempt_id INT NOT NULL,

    total_question INT NOT NULL,

    correct_answer INT NOT NULL,

    score DECIMAL(5,2) NOT NULL,

    grade NVARCHAR(20) NOT NULL,

    generated_at DATETIME NOT NULL,

    CONSTRAINT FK_TEST_RESULT_ATTEMPT
        FOREIGN KEY (attempt_id)
        REFERENCES TEST_ATTEMPT(attempt_id)
);
GO

/*============================================================
=                     ANSWER_OPTION                         =
============================================================*/

CREATE TABLE ANSWER_OPTION
(
    option_id INT IDENTITY(1,1) PRIMARY KEY,

    question_id INT NOT NULL,

    option_content NVARCHAR(MAX) NOT NULL,

    is_correct BIT NOT NULL
);
GO


/*============================================================
=                        USER_ANSWER                        =
============================================================*/

CREATE TABLE USER_ANSWER
(
    user_answer_id INT IDENTITY(1,1) PRIMARY KEY,
    attempt_id INT NOT NULL,
    question_id INT NOT NULL,
    option_id INT NOT NULL,
    selected_answer NVARCHAR(MAX) NOT NULL,
    is_correct BIT NOT NULL,
    answered_at DATETIME NOT NULL,

    CONSTRAINT FK_USER_ANSWER_TEST_ATTEMPT
        FOREIGN KEY (attempt_id)
        REFERENCES TEST_ATTEMPT(attempt_id)
);
GO


/*============================================================
=                          REPORT                           =
============================================================*/

CREATE TABLE REPORT
(
    report_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    document_id INT NOT NULL,
    reason NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    status NVARCHAR(30) NOT NULL,
    created_at DATETIME NOT NULL,

    CONSTRAINT FK_REPORT_USER
        FOREIGN KEY (user_id)
        REFERENCES [USER](user_id),

    CONSTRAINT FK_REPORT_DOCUMENT
        FOREIGN KEY (document_id)
        REFERENCES DOCUMENT(document_id)
);
GO

/*============================================================
=                       STUDY_STREAK                        =
============================================================*/

CREATE TABLE STUDY_STREAK
(
	streak_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    current_streak INT NOT NULL,
    longest_streak INT NOT NULL,
    last_study_date DATE NULL,
    streak_start_date DATE NULL,
    total_study_days INT NOT NULL,
    status NVARCHAR(30) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NULL,

    CONSTRAINT FK_STUDY_STREAK_USER
        FOREIGN KEY (user_id)
        REFERENCES [USER](user_id)
);
GO


/*============================================================
=                       STUDY_ACTIVITY                      =
============================================================*/

CREATE TABLE STUDY_ACTIVITY
(
    activity_id INT IDENTITY(1,1) PRIMARY KEY,

    user_id INT NOT NULL,

    document_id INT NOT NULL,

    summary_id INT NOT NULL,

    session_id INT NOT NULL,

    question_id INT NOT NULL,

    activity_type NVARCHAR(50) NOT NULL,

    study_duration INT NOT NULL,

    activity_date DATETIME NOT NULL,

    is_valid_streak BIT NOT NULL,

    created_at DATETIME NOT NULL,

    CONSTRAINT FK_STUDY_ACTIVITY_USER
        FOREIGN KEY (user_id)
        REFERENCES [USER](user_id),

    CONSTRAINT FK_STUDY_ACTIVITY_DOCUMENT
        FOREIGN KEY (document_id)
        REFERENCES DOCUMENT(document_id),

    CONSTRAINT FK_STUDY_ACTIVITY_SUMMARY
        FOREIGN KEY (summary_id)
        REFERENCES AI_SUMMARY(summary_id),

    CONSTRAINT FK_STUDY_ACTIVITY_SESSION
        FOREIGN KEY (session_id)
        REFERENCES CHAT_SESSION(session_id)
);
GO


/*============================================================
=                       ANNOUNCEMENT                        =
============================================================*/

CREATE TABLE ANNOUNCEMENT
(
    announcement_id INT IDENTITY(1,1) PRIMARY KEY,

    user_id INT NOT NULL,

    title NVARCHAR(255) NOT NULL,

    content NVARCHAR(MAX) NOT NULL,

    type NVARCHAR(50) NOT NULL,

    created_at DATETIME NOT NULL,

    CONSTRAINT FK_ANNOUNCEMENT_USER
        FOREIGN KEY (user_id)
        REFERENCES [USER](user_id)
);
GO

/*============================================================
=                    USER_ANNOUNCEMENT                     =
============================================================*/

CREATE TABLE USER_ANNOUNCEMENT
(
    user_announcement_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    announcement_id INT NOT NULL,
    is_read BIT NOT NULL,
    read_at DATETIME NULL,

    CONSTRAINT FK_USER_ANNOUNCEMENT_USER
        FOREIGN KEY (user_id)
        REFERENCES [USER](user_id),

    CONSTRAINT FK_USER_ANNOUNCEMENT_ANNOUNCEMENT
        FOREIGN KEY (announcement_id)
        REFERENCES ANNOUNCEMENT(announcement_id)
);
GO