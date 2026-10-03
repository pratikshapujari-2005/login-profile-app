# SecureSpace Authentication Website

A professional full-stack authentication website built with **Node.js**, **Express.js**, **PostgreSQL**, **EJS**, and **bcrypt**.

The project allows users to register, log in, access protected pages, edit their profiles, and log out securely. Passwords are hashed before being stored in the database, and session-based authentication protects private routes.

## Features

- User registration with form validation
- Secure password hashing using bcrypt
- Login authentication
- PostgreSQL database integration
- Session-based authentication
- Protected dashboard and profile pages
- Profile editing with name and bio fields
- Secure logout functionality
- Friendly error and success messages
- Password-strength indicator
- Show/hide password feature
- Responsive professional user interface
- CSS animations and modern design
- Custom 404 page for invalid routes

## Technologies Used

- Node.js
- Express.js
- PostgreSQL
- EJS
- bcrypt
- express-session
- connect-pg-simple
- dotenv
- HTML5
- CSS3
- JavaScript

## Project Structure

```text
login-profile-app/
│
├── public/
│   ├── style.css              # Website styling and animations
│   └── script.js              # Password visibility and strength features
│
├── views/
│   ├── login.ejs              # Login page
│   ├── register.ejs           # Registration page
│   ├── dashboard.ejs          # Protected dashboard page
│   ├── profile.ejs            # Protected profile page
│   ├── edit-profile.ejs       # Profile editing page
│   └── 404.ejs                # Page not found screen
│
├── .env                       # Environment variables
├── .gitignore                 # Files excluded from GitHub
├── db.js                      # PostgreSQL connection setup
├── server.js                  # Express server and routes
├── package.json               # Project dependencies
└── README.md                  # Project documentation
```

## Installation

### 1. Clone or download the project

```bash
git clone [https://github.com/your-username/login-profile-app.git](https://github.com/your-username/login-profile-app.git)
```

Move into the project folder:

```bash
cd login-profile-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a PostgreSQL database

Open pgAdmin or PostgreSQL SQL Shell and run:

```sql
CREATE DATABASE login_profile_db;
```

Connect to the newly created database and create the users table:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  bio VARCHAR(300) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

The session table is created automatically by `connect-pg-simple` when the application starts.

### 4. Create environment variables

Create a `.env` file in the root project folder and add:

```env
PORT=3000
NODE_ENV=development

DB_USER=postgres
DB_HOST=localhost
DB_NAME=login_profile_db
DB_PASSWORD=your_postgresql_password
DB_PORT=5432

SESSION_SECRET=replace_with_a_long_random_secret
```

Replace `your_postgresql_password` with your own PostgreSQL password.

## Running the Project

Start the application in development mode:

```bash
npm run dev
```

Or start it normally:

```bash
npm start
```

Open this URL in your browser:

```text
http://localhost:3000
```

## Routes

| Route | Method | Description | Protected |
|---|---|---|---|
| `/` | GET | Redirects users to login or dashboard | No |
| `/register` | GET | Displays registration page | No |
| `/register` | POST | Creates a new user account | No |
| `/login` | GET | Displays login page | No |
| `/login` | POST | Authenticates a user | No |
| `/dashboard` | GET | Displays user dashboard | Yes |
| `/profile` | GET | Displays user profile | Yes |
| `/profile/edit` | GET | Displays profile edit page | Yes |
| `/profile/edit` | POST | Updates profile name and bio | Yes |
| `/logout` | POST | Destroys the user session | Yes |

## Authentication Flow

1. A user creates an account through the registration page.
2. The server validates the form data.
3. The password is hashed using bcrypt.
4. The hashed password and user details are stored in PostgreSQL.
5. A session is created after successful registration or login.
6. The user can access protected dashboard and profile routes.
7. If an unauthenticated user opens a protected route, they are redirected to the login page.
8. Logging out destroys the session and removes access to protected pages.

## Security Features

- Passwords are never stored as plain text.
- bcrypt hashes passwords before database storage.
- Login compares passwords securely using bcrypt.
- Sessions are stored in PostgreSQL.
- Protected routes use authentication middleware.
- Session cookies use `httpOnly` to reduce client-side script access.
- `sameSite: "lax"` helps reduce cross-site request risks.
- Environment variables keep database credentials and session secrets outside source code.
- `.env` is excluded from GitHub using `.gitignore`.

## Testing Checklist

Test the project using the following steps:

- Register a new account.
- Check that duplicate email registration is blocked.
- Log in with the correct email and password.
- Try logging in with an incorrect password.
- Open the dashboard after logging in.
- Edit your name and bio.
- Log out of the application.
- Try opening `/profile` or `/dashboard` after logout.
- Confirm that protected routes redirect you back to login.
- Open a non-existing route and confirm that the 404 page appears.

## Future Improvements

Possible improvements for a future version:

- Password reset using email verification
- Email confirmation during registration
- Profile photo upload
- Change password page
- Delete-account feature
- Role-based access control for admin and regular users
- CSRF protection
- Rate limiting for login requests
- Deployment using Render, Railway, or Vercel
- Hosted PostgreSQL database

## Author

**Pratiksha Pujari**

## License

This project is created for educational and learning purposes.