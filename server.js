const express = require("express");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const bcrypt = require("bcrypt");
const path = require("path");
const pool = require("./db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
  app.set("trust proxy", 1);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    store: new pgSession({
      pool,
      tableName: "session",
      createTableIfMissing: true,
    }),
    name: "securespace.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
    },
  })
);

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.success = req.session.success || "";
  res.locals.error = req.session.error || "";

  delete req.session.success;
  delete req.session.error;

  next();
});

function requireLogin(req, res, next) {
  if (!req.session.user) {
    req.session.error = "Please log in to access that page.";
    return res.redirect("/login");
  }

  next();
}

function redirectIfLoggedIn(req, res, next) {
  if (req.session.user) {
    return res.redirect("/dashboard");
  }

  next();
}

app.get("/", (req, res) => {
  if (req.session.user) {
    return res.redirect("/dashboard");
  }

  res.redirect("/login");
});

app.get("/register", redirectIfLoggedIn, (req, res) => {
  res.render("register");
});

app.post("/register", redirectIfLoggedIn, async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    req.session.error = "Please complete every field.";
    return res.redirect("/register");
  }

  if (name.trim().length < 2) {
    req.session.error = "Your name must contain at least 2 characters.";
    return res.redirect("/register");
  }

  if (password.length < 8) {
    req.session.error = "Your password must contain at least 8 characters.";
    return res.redirect("/register");
  }

  if (password !== confirmPassword) {
    req.session.error = "The passwords do not match.";
    return res.redirect("/register");
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      req.session.error = "An account with this email already exists.";
      return res.redirect("/register");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [name.trim(), normalizedEmail, hashedPassword]
    );

    const newUser = result.rows[0];

    req.session.regenerate((sessionError) => {
      if (sessionError) {
        req.session.error = "Could not create your session. Please try again.";
        return res.redirect("/login");
      }

      req.session.user = newUser;
      req.session.success = "Your account was created successfully.";
      res.redirect("/dashboard");
    });
  } catch (error) {
    console.error(error);
    req.session.error = "Something went wrong. Please try again.";
    res.redirect("/register");
  }
});

app.get("/login", redirectIfLoggedIn, (req, res) => {
  res.render("login");
});

app.post("/login", redirectIfLoggedIn, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    req.session.error = "Enter your email and password.";
    return res.redirect("/login");
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();

    const result = await pool.query(
      "SELECT id, name, email, password FROM users WHERE email = $1",
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      req.session.error = "Incorrect email or password.";
      return res.redirect("/login");
    }

    const user = result.rows[0];
    const correctPassword = await bcrypt.compare(password, user.password);

    if (!correctPassword) {
      req.session.error = "Incorrect email or password.";
      return res.redirect("/login");
    }

    req.session.regenerate((sessionError) => {
      if (sessionError) {
        req.session.error = "Could not start your session. Please try again.";
        return res.redirect("/login");
      }

      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
      };

      req.session.success = `Welcome back, ${user.name}!`;
      res.redirect("/dashboard");
    });
  } catch (error) {
    console.error(error);
    req.session.error = "Something went wrong. Please try again.";
    res.redirect("/login");
  }
});

app.get("/dashboard", requireLogin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, bio, created_at FROM users WHERE id = $1",
      [req.session.user.id]
    );

    if (result.rows.length === 0) {
      req.session.destroy(() => {});
      return res.redirect("/login");
    }

    res.render("dashboard", { user: result.rows[0] });
  } catch (error) {
    console.error(error);
    req.session.error = "Could not load your dashboard.";
    res.redirect("/login");
  }
});

app.get("/profile", requireLogin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, bio, created_at FROM users WHERE id = $1",
      [req.session.user.id]
    );

    res.render("profile", { user: result.rows[0] });
  } catch (error) {
    console.error(error);
    req.session.error = "Could not load your profile.";
    res.redirect("/dashboard");
  }
});

app.get("/profile/edit", requireLogin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, bio FROM users WHERE id = $1",
      [req.session.user.id]
    );

    res.render("edit-profile", { user: result.rows[0] });
  } catch (error) {
    console.error(error);
    req.session.error = "Could not load the edit page.";
    res.redirect("/profile");
  }
});

app.post("/profile/edit", requireLogin, async (req, res) => {
  const { name, bio } = req.body;

  if (!name || name.trim().length < 2) {
    req.session.error = "Your name must contain at least 2 characters.";
    return res.redirect("/profile/edit");
  }

  if (bio && bio.length > 300) {
    req.session.error = "Your bio cannot be longer than 300 characters.";
    return res.redirect("/profile/edit");
  }

  try {
    const result = await pool.query(
      `UPDATE users
       SET name = $1, bio = $2
       WHERE id = $3
       RETURNING id, name, email`,
      [name.trim(), bio ? bio.trim() : "", req.session.user.id]
    );

    req.session.user = result.rows[0];
    req.session.success = "Your profile was updated.";
    res.redirect("/profile");
  } catch (error) {
    console.error(error);
    req.session.error = "Could not update your profile.";
    res.redirect("/profile/edit");
  }
});

app.post("/logout", requireLogin, (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.redirect("/profile");
    }

    res.clearCookie("securespace.sid");
    res.redirect("/login?loggedOut=true");
  });
});

app.get("/login", redirectIfLoggedIn, (req, res) => {
  if (req.query.loggedOut === "true") {
    return res.render("login", {
      success: "You have logged out successfully.",
    });
  }

  res.render("login");
});

app.use((req, res) => {
  res.status(404).render("404");
});

app.listen(PORT, () => {
  console.log(`SecureSpace is running at http://localhost:${PORT}`);
});