var express = require('express');
var morgan = require('morgan'); // Charge le middleware de logging
var logger = require('log4js').getLogger('Server');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var mysql = require('mysql');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var app = express(); 

// config
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(morgan('combined')); // Active le middleware de logging
app.use(passport.initialize());
app.use(flash());
app.use(passport.session());
app.use(express.static(__dirname + '/public')); // Indique que le dossier /public contient des fichiers statiques (middleware chargé de base)

require('./config/passport')(passport);

logger.info('server start');

// route
app.get('/', function(req, res)
{
    res.redirect('/login');
});

app.get('/login', function(req, res)
{
	res.render('login');
});

app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));	

app.get('/profile', function(req, res)
{
	res.render('profile');
});

app.get('/signup', function(req, res)
{
	res.render('signup');
});

app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
  
app.listen(1313);



