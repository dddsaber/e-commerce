const passport = require("passport");
const { loginOAuth2 } = require("../../../utils/securePassword.utils");
const GitHubStrategy = require("passport-github2").Strategy;

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/auth/github/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      await loginOAuth2(profile);
      return done(null, profile);
    }
  )
);
