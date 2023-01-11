let env = process.env.NODE_ENV || "development";
let appConfig = require("../config.json")[env];
const OAuth2Strategy = require('passport-openid-oauth20').Strategy;

module.exports = function (passport) {
  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    done(null, user);
  });

  const oauth = new OAuth2Strategy(
    Object.assign(
      {
        passReqToCallback: true,
        callbackURL: "/oauth2/login/callback",
      },
      appConfig.oauth2
    ),
    function (req, accessToken, refreshToken, profile, done) {
      profile = profile._json || profile || {};
      console.log(profile)
      if (!profile.email) {
        return done(new Error("Set an email in keycloak"), null);
      }
      let oAuthUser = {
        firstName:
          profile.firstName ||
          profile.first_name ||
          profile.given_name ||
          profile.name,
        lastName:
          profile.lastName ||
          profile.last_name ||
          profile.family_name,
        email: profile.email,
        avatarURL:
          profile.picture ||
          profile.photo ||
          profile.avatarURL ||
          profile.avatar ||
          profile.avatar_url,
        oAuthToken: accessToken,
      };
      return done(null, oAuthUser);
    }
  );
  oauth._oauth2.useAuthorizationHeaderforGET(true);
  passport.use(oauth);
};
