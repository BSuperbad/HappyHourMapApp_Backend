CREATE TABLE categories (
    cat_id SERIAL PRIMARY KEY,
    cat_type VARCHAR(255) NOT NULL
);

CREATE TABLE locations (
    loc_id SERIAL PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    neighborhood VARCHAR(100)
);

CREATE TABLE spaces (
    space_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    category_id INT,
    address VARCHAR(255),
    location_id INT,
    est_year INT,
    FOREIGN KEY (category_id) REFERENCES categories(cat_id),
    FOREIGN KEY (location_id) REFERENCES locations(loc_id)
);

CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(25),
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL
    CHECK (position('@' IN email) > 1),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE likes (
    like_id SERIAL PRIMARY KEY,
    user_id INT,
    space_id INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (space_id) REFERENCES spaces(space_id) ON DELETE CASCADE,
    UNIQUE (user_id, space_id)  -- Ensure a user can like a space only once
);


CREATE TABLE ratings (
    rating_id SERIAL PRIMARY KEY,
    user_id INT,
    space_id INT,
    rating INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (space_id) REFERENCES spaces(space_id) ON DELETE CASCADE
);
-- Assuming a rating scale from 1 to 5, maybe a sliding input?

CREATE TABLE visits (
    visit_id SERIAL PRIMARY KEY,
    user_id INT,
    space_id INT,
    visit_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (space_id) REFERENCES spaces(space_id) ON DELETE CASCADE
);

CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    user_id INT,
    space_id INT,
    comment TEXT,
    comment_date TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (space_id) REFERENCES spaces(space_id) ON DELETE CASCADE
);

