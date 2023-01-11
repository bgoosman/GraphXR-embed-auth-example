let authController = require("../controllers/authController.js");
let env = process.env.NODE_ENV || "development";
let appConfig = require("../config/config.json")[env];

const Auth = function (app, passport) {
  app.get("/signin", authController.signin);
  app.get("/dashboard", isLoggedIn, authController.dashboard);
  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/signin");
  }

  if (appConfig.oauth2) {
    app.all(
      ["/oauth2/login", "/oauth2/login/callback"],
      passport.authenticate("openid-oauth20", {
        scope: appConfig.oauth2.scope.split(",") || [],
        failureRedirect: "/",
        failureFlash: true,
      }),
      function (req, res) {
        res.redirect("/dashboard");
      }
    );
  }
};

module.exports = Auth;
