// config/passport.js
				
// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

var mysql = require('mysql');


var connection = mysql.createConnection(
{
				  host     : 'localhost',
				  port     : '3307',
				  user     : 'test',
				  password : 'test',
				  database: 'pictionnary'
});	

// expose this function to our app using module.exports
module.exports = function(passport) 
{

	// =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) 
    {
		done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) 
    {
		connection.query("select * from users where id = "+id,function(err,rows)
		{	
			done(err, rows[0]);
		});
    });

    //Facebook	
	passport.use(new FacebookStrategy(
	{
        clientID: '463573240515273',
        clientSecret: '0ce42a1f02ddeb96d1e1ef274affff2d',
        callbackURL: "http://localhost:1313/auth/facebook/callback",
    	profileFields   : ['id, last_name, first_name, gender, email, birthday, location, website, picture']
  	}, function(token, refreshToken, profile, done) 
    {
        console.log(profile);
        process.nextTick(function()
        {
            var newUser = new Object();
            newUser.profilepic = profile._json.picture;
            newUser.prenom = profile._json.first_name;
            newUser.email = profile._json.email;
            newUser.birthdate = '00-00-00';
            insertQuery = { prenom : newUser.prenom, profilepic : newUser.profilepic, email : newUser.email, birthdate : newUser.birthdate};
            connection.query('INSERT INTO users SET ?', insertQuery,function(err,rows)
                {
                    if(err)
                    {
                        return done(err);
                    }
                    else
                    {
                        newUser.id = rows.insertId;
                        return done(null, newUser);
                    }               
                });
        });
    }));

 	// =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
	// by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy(
    {
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) 
    {

		// find a user whose email is the same as the forms email
		// we are checking to see if the user trying to login already exists
        connection.query("select * from users where email = '"+email+"'",function(err,rows){
			console.log(rows);
			console.log("above row object");
			if (err)
                return done(err);
			if (rows.length)
			{
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } 
            else 
            {

				// if there is no user with that email
                // create the user
                var newUserMysql = new Object();			
				newUserMysql.email    = email;
                newUserMysql.password = password; // use the generateHash function in our user model
				newUserMysql.nom = req.body.nom;
				newUserMysql.prenom = req.body.prenom;
				newUserMysql.telephone = req.body.telephone;
				newUserMysql.siteweb = req.body.siteweb;
				newUserMysql.sexe = req.body.sexe;
				newUserMysql.birthdate = req.body.birthdate;
				newUserMysql.ville = req.body.ville;
				newUserMysql.taille = req.body.taille;
				newUserMysql.couleur = req.body.couleur.substring(1,req.body.couleur.length);
				newUserMysql.profilepic = req.body.profilepic;
			
				var insertQuery = {email: email, password: password, nom: req.body.nom, prenom: req.body.prenom, tel: req.body.telephone, website: req.body.siteweb, sexe: req.body.sexe, birthdate: req.body.birthdate, ville: req.body.ville, taille: req.body.taille, couleur: req.body.couleur.substring(1,req.body.couleur.length), profilepic: req.body.profilepicfile};
				console.log(insertQuery);
				connection.query('INSERT INTO users SET ?', insertQuery,function(err,rows)
				{
					if(err)
					{
						return done(err);
					}
					else
					{
						newUserMysql.id = rows.insertId;
						return done(null, newUserMysql);
					}				
				});	
            }	
		});
    }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy(
    {
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) 
    { // callback with email and password from our form

         connection.query("SELECT * FROM `users` WHERE `email` = '" + email + "'",function(err,rows)
         {
			if (err)
			{
                return done(err);
            }
			 if (!rows.length) 
			 {
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
            } 
			
			// if the user is found but the password is wrong
            if (!( rows[0].password == password))
            {
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
            }
			
            // all is well, return successful user
            return done(null, rows[0]);			
		
		});
		


    }));

};
