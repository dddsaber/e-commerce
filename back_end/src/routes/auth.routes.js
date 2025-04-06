const { Router } = require("express");
const passport = require("passport");
const {
  register,
  login,
  loginOAuth2,
  logout,
  reAuth,
  renewAccessToken,
  changePassword,
} = require("../controllers/auth/auth.controller");
const authValidation = require("../controllers/auth/auth.validation");
const { loginWithGoogle } = require("../controllers/auth/oauth2.controller");
require("dotenv").config();

require("../controllers/auth/oauth-2/google.oauth-2");
require("../controllers/auth/oauth-2/facebook.oauth-2");
require("../controllers/auth/oauth-2/github.oauth-2");
const router = Router();
router.use(passport.initialize());

router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    loginOAuth2(req, res);
  }
);

router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false }),
  loginOAuth2
);

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);
router.get(
  "/github/callback",
  passport.authenticate("github", { session: false }),
  loginOAuth2
);

router.post("/register", authValidation, register);

router.post("/login", login);

router.post("/login-google", loginWithGoogle);

router.get("/logout/:id", logout);

router.post("/reauth", reAuth);

router.post("/renew-access-token", renewAccessToken);

router.post("/change-password", changePassword);

module.exports = router;
