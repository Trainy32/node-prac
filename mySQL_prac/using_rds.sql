-- CREATE DATABASE NodeJS;

-- CREATE TABLE IF NOT EXISTS courses (
--     id bigint(5) NOT NULL AUTO_INCREMENT, 
--     title varchar(255) NOT NULL,
--     tutor varchar(255) NOT NULL,
--     PRIMARY KEY (id)
-- );

-- INSERT INTO courses (title, tutor) VALUES
--     ('Node.js 숙련반', '이용우'), ('웹개발 종합반', '이범규');

-- SELECT * FROM courses;

-- // ERD 관계?

-- CREATE TABLE User(
--     userId int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
--     name varchar(255) NOT NULL UNIQUE
-- );

-- CREATE TABLE Food(
--     foodId int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
--     name varchar(255),
--     price int(11)
-- );

-- CREATE TABLE Order(
--     orderId int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
--     userId int(11) NOT NULL, 
--     foodId int(11) NOT NULL, 
--     createdAt datetime NOT NULL DEFAULT NOW(),
--     FOREIGN KEY (foodId) REFERENCES Food(foodId) ON DELETE CASCADE,
--     FOREIGN KEY (userId) REFERENCES User(userId) ON DELETE CASCADE
-- );

-- -- // 테이블 생성
-- CREATE TABLE IF NOT EXISTS users (
--     id bigint(5) NOT NULL AUTO_INCREMENT,
--     name varchar(255) NOT NULL,
--     age bigint(5) NOT NULL,
--     PRIMARY KEY (id)
-- );

-- -- // 데이터 삽입
-- INSERT INTO users (name, age) VALUES
--     ('이용우', 28);

-- -- // 데이터 조회
-- SELECT * FROM users;