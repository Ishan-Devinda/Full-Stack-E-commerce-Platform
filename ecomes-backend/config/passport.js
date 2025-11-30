const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${
        process.env.API_URL || "http://localhost:5000"
      }/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google profile received:", profile.id);

        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        // Check if email already exists
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Link Google account to existing email
          user.googleId = profile.id;
          user.isVerified = true;
          await user.save();
          return done(null, user);
        }

        // Create new user with unique username
        const baseUsername = profile.displayName
          .replace(/\s+/g, "_")
          .replace(/[^a-zA-Z0-9_]/g, "")
          .toLowerCase();

        let username = baseUsername;
        let counter = 1;

        // Ensure username is unique
        while (await User.findOne({ username })) {
          username = `${baseUsername}_${counter}`;
          counter++;
        }

        user = new User({
          googleId: profile.id,
          username: username,
          email: profile.emails[0].value,
          isVerified: true,
        });

        await user.save();
        console.log("New user created via Google OAuth:", user.email);
        done(null, user);
      } catch (error) {
        console.error("Google OAuth error:", error);
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
