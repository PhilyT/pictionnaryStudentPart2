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
app.use(session({ secret: 'cestunsecretoupas' })); // session secret
app.use(morgan('combined')); // Active le middleware de logging
app.use(passport.initialize());
app.use(flash());
app.use(passport.session());
//app.use(express.static(__dirname + '/public')); // Indique que le dossier /public contient des fichiers statiques (middleware chargé de base)

require('./config/passport')(passport);

var connection = mysql.createConnection(
{
                  host     : 'localhost',
                  port     : '3307',
                  user     : 'test',
                  password : 'test',
                  database: 'pictionnary'
});

logger.info('server start');

// route
app.get('/', function(req, res)
{
    if (req.isAuthenticated && req.user != null) 
    {
        res.render('main', { message1 : 'Bonjour ' + req.user.prenom, href1 : 'logout', message2 : ' Deconnexion', message3 : req.user.profilepic, href2 : '', message4 : '' });
    } 
    else
    {
        res.render('main', { message1 : '', href1 : 'login', message2 : 'Connexion', message3 : '', href2 : 'signup', message4 : 'Inscription' });
    }
});

app.get('/login', function(req, res)
{
	res.render('login', { message1 : '', href1 : 'login', message2 : 'Connexion', message3 : '', href2 : 'signup', message4 : 'Inscription' });
});

app.get('/paint', isLoggedIn,function(req, res)
{
    res.render('paint');
});

app.post('/paint',function(req, res)
{
    var draw = new Object();
    draw.u_id = req.user.id;
    draw.commandes = req.body.drawingCommands;
    draw.images = req.body.picture;

    var insertquery = { u_id : draw.u_id, commandes : draw.commandes, images : draw.images };
    console.log(insertquery);
    connection.query('INSERT INTO drawings SET ?', insertquery, function(err, rows)
    {
        if (err)
        { 
            res.writeHead(200);
            res.end('error');
        } 
        else
        {
            res.redirect('/');
        }
    });
});

app.get('/guess', isLoggedIn,function(req, res)
{
    res.render('guess');
})

app.post('/login', passport.authenticate('local-login', 
{
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the login page if there is an error
    failureFlash : true // allow flash messages
}));	

app.get('/profile', isLoggedIn, function(req, res)
{
	res.render('profile', { user : req.user, message1 : 'Bonjour ' + req.user.prenom, href1 : 'logout', message2 : ' Deconnexion', message3 : req.user.profilepic, href2 : '', message4 : '' });
});

app.get('/signup', function(req, res)
{
	res.render('signup', { message1 : '', href1 : 'login', message2 : 'Connexion', message3 : '', href2 : 'signup', message4 : 'Inscription' });
});

app.post('/signup', passport.authenticate('local-signup',
{
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

app.get('/logout', function(req, res) 
{
        req.logout();
        res.redirect('/');
});

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) 
{

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
    {
        return next();
    }

    // if they aren't redirect them to the home page
    res.redirect('/');
}
  
app.listen(1313);



