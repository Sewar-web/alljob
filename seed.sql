DROP TABLE IF EXISTS job;
CREATE TABLE job(

    id  SERIAL PRIMARY KEY,
    title VARCHAR(255),
    company VARCHAR(255),
    location VARCHAR(255),
    url VARCHAR(255),
    description TEXT
);