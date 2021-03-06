// config/passport.js
				

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


module.exports = function(passport) 
{

	
    passport.serializeUser(function(user, done) 
    {
		done(null, user.id);
    });


    passport.deserializeUser(function(id, done) 
    {
		connection.query("select * from users where id="+id +";",function(err,rows)
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
            connection.query('Select * From users Where id=' + profile.id, function(err,rows)
            {
                if (err)
                    return done(err);
                if (rows.length) 
                {
                    return done(null, rows[0]);
                } 
                else
                {
                    var newUser = new Object();
                    newUser.profilepic = profile._json.picture;
                    newUser.prenom = profile._json.first_name;
                    newUser.email = profile._json.email;
                    newUser.id = profile._json.id;
                    newUser.birthdate = '00-00-00';
                    insertQuery = { id:newUser.id, prenom : newUser.prenom, profilepic : newUser.profilepic, email : newUser.email, birthdate : newUser.birthdate};
                    connection.query('INSERT INTO users SET ?', insertQuery,function(err,rows2)
                    {
                        if(err)
                        {
                            return done(err);
                        }
                        else
                        {
                            return done(null, newUser);
                        }               
                    });
                }
            });
        });
    }));

 	// =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================


    passport.use('local-signup', new LocalStrategy(
    {

        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true 
    },
    function(req, email, password, done) 
    {


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


                var newUserMysql = new Object();			
				newUserMysql.email    = email;
                newUserMysql.password = password; 
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


    passport.use('local-login', new LocalStrategy(
    {
        
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true 
    },
    function(req, email, password, done) 
    { 

         connection.query("SELECT * FROM `users` WHERE `email` = '" + email + "'",function(err,rows)
         {
			if (err)
			{
                return done(err);
            }
			 if (!rows.length) 
			 {
                return done(null, false, req.flash('loginMessage', 'No user found.')); 
            } 
			

            if (!( rows[0].password == password))
            {
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); 
            }
			
            return done(null, rows[0]);			
		
		});
		


    }));

};
