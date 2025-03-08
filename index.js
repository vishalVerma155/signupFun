
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const connectDB = require('./config/db.js');
connectDB();
const User = require('./model/user.js');



const app = express();

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true
    })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
    },
       async (accessToken, refreshToken, profile, done) => {
            // Here you can save user details to the database
            try {
                let user = await User.findOne({ googleId: profile.id });

                if (!user) {
                    // If user doesn't exist, create a new user
                    user = await User.create({
                        googleId: profile.id,
                        displayName: profile.displayName,
                        firstName: profile.name.givenName,
                        lastName: profile.name.familyName,
                        email: profile.emails[0].value,
                        profilePicture: profile.photos[0].value,
                    });
                }

                return done(null, user);
            } catch (err) {
                console.error("Error saving user:", err);
                return done(err, null);
            }
        }
    ));

passport.serializeUser((user, done) => {
    done(null, user);
})

passport.deserializeUser((user, done) => {
    done(null, user);
})

app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => {
        res.redirect("/dashboard"); // Redirect to dashboard after successful login
    }
);

// Protected Dashboard Route
app.get("/dashboard", (req, res) => {
    if (!req.user) {
        return res.redirect("/");
    }
    console.log(req.user);
    res.send(`Welcome, ${req.user.displayName}!`);
});

// Logout Route
app.get("/logout", (req, res) => {
    req.logout(() => {
        res.redirect("/");
    });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));