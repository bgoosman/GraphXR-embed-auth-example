let env = process.env.NODE_ENV || "development";
let appConfig = require("../config/config.json")[env];

module.exports = {
  signin: function (req, res) {
    res.render("signin");
  },

  dashboard: function (req, res) {
    res.render("dashboard", {
      email: req.user.email,
      firstName: req.user.firstName,
      oAuthToken: req.user.oAuthToken,
    });
  },
};
