CREATE TABLE Users (
 Id int IDENTITY PRIMARY KEY, Name nvarchar(120) NOT NULL,
 Email nvarchar(200) NOT NULL, PasswordHash nvarchar(max) NOT NULL,
 Role nvarchar(max) NOT NULL
);
CREATE UNIQUE INDEX IX_Users_Email ON Users(Email);
CREATE TABLE Books (
 Id int IDENTITY PRIMARY KEY, Isbn nvarchar(32) NOT NULL,
 Title nvarchar(200) NOT NULL, Author nvarchar(max) NOT NULL,
 Publisher nvarchar(max) NOT NULL, PublicationYear int NOT NULL,
 Category nvarchar(max) NOT NULL, Shelf nvarchar(max) NOT NULL, IsDeleted bit NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IX_Books_Isbn ON Books(Isbn);
CREATE TABLE Loans (
 Id int IDENTITY PRIMARY KEY, BookId int NOT NULL REFERENCES Books(Id),
 UserId int NOT NULL REFERENCES Users(Id), BorrowedAt datetime2 NOT NULL,
 ReturnedAt datetime2 NULL
);
CREATE UNIQUE INDEX IX_Loans_BookId ON Loans(BookId) WHERE ReturnedAt IS NULL;
CREATE INDEX IX_Loans_UserId ON Loans(UserId);
CREATE TABLE Audits (Id int IDENTITY PRIMARY KEY, ActorId int NOT NULL, Action nvarchar(max) NOT NULL, At datetime2 NOT NULL);
