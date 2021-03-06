var express = require('express');
var morgan = require('morgan'); // Charge le middleware de logging
var logger = require('log4js').getLogger('Server');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var mysql = require('mysql');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var url = require('url');

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
        connection.query('SELECT id FROM drawings WHERE u_id=' + req.user.id +';', function(err, rows)
        {
            if (err)
            { 
                res.writeHead(200);
                res.end('error');
            } 
            else
            {
                res.render('main', { user : req.user, draw : rows });
            }
        });
    } 
    else
    {
        res.render('main', { user : '' });
    }
});

app.get('/login', function(req, res)
{
	res.render('login', { user : '' });
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
    var query  = url.parse(req.url,true).query;
    console.log(query['drawid']);
    console.log(query);
    connection.query('SELECT commandes FROM drawings WHERE u_id=' + req.user.id + ' AND id='+ query['drawid']+ ';', function(err, rows)
        {
            if (err)
            { 
                res.writeHead(200);
                res.end('error');
            } 
            else
            {
                console.log(rows[0].commandes);
                console.log(rows[0]);
                res.render('guess', { commandes : rows[0].commandes });
            }
        });
})

app.post('/login', passport.authenticate('local-login', 
{
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the login page if there is an error
    failureFlash : true // allow flash messages
}));	

app.get('/profile', isLoggedIn, function(req, res)
{
	res.render('profile', { user : req.user });
});

app.get('/signup', function(req, res)
{
	res.render('signup', { user : '' });
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

app.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email', 'public_profile', 'user_friends']}));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/',
                                      failureRedirect: '/login' }));

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



