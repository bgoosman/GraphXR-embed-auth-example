let express = require('express');
let app = express();
let passport = require('passport')
let exphbs = require('express-handlebars')

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(passport.initialize());

let session = require('express-session')
app.use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: true }))
app.use(passport.session());

// index
app.get('/', function (req, res) {
    res.redirect("/dashboard");
});

// handlebars
app.set('views', './app/views');
app.engine('hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: false,
    layoutsDir: "views/layouts/"
}));
app.set('view engine', '.hbs');

// oauth2
require('./app/config/passport/passport.js')(passport);
require('./app/routes/auth.js')(app, passport);

app.listen(8081, function (err) {
    if (!err) {
        console.log("Site is live http://localhost:8081");
    } else {
        console.log(err);
    }
});