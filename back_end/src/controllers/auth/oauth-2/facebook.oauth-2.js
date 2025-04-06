const passport = require("passport");
const { loginOAuth2 } = require("../../../utils/securePassword.utils");
const FacebookStrategy = require("passport-facebook").Strategy;

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: `${process.env.SERVER_URL}/auth/facebook/callback`,
    },
    async function (accessToken, refreshToken, profile, done) {
      await loginOAuth2(profile);
      return done(null, profile);
    }
  )
);
