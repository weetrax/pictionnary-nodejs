var express = require('express');
var morgan = require('morgan'); // Charge le middleware de logging
var favicon = require('serve-favicon'); // Charge le middleware de favicon
var logger = require('log4js').getLogger('Server');
var app = express();
var url = require("url");
var mysql = require("mysql");
var bodyParser = require('body-parser');
var session = require('express-session');


app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('combined')); // Active le middleware de logging
app.use(express.static(__dirname + '/public')); // Indique que le dossier /public contient des fichiers statiques (middleware charg� de base)


/* Connexion MySQL */
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pictionnary'
});

app.get('/', function(req, res){
    res.redirect('/login');

});

app.get('/login', function(req, res){
    res.render('login');
});

app.post('/login', function (req, res) {
  var username = req.body.username; //recuperation du username du form login
  var password = req.body.password; //recuperation du mot de passe du form login
  console.log("username : " + username + ", password: " + password);

  connection.query("SELECT * from users where email = '" + username + "' and password = '" + password + "'", function (err, rows, fields) {
      if (!err)
      {
          if (rows.length == 1) {
              if (rows[0].email == username && rows[0].password == password) {
                  logger.info('Resultat de la requete: ', rows);
                  session.open = true;
                  session.id = rows[0].id;
                  session.email = rows[0].email;
                  session.nom = rows[0].nom;
                  session.prenom = rows[0].prenom;
                  session.ville = rows[0].ville;
                  session.taille = rows[0].taille;
                  session.prenom = rows[0].prenom;
                  session.birthdate = rows[0].birthdate;
                  session.age = rows[0].age;
                  session.sexe = rows[0].sexe;
                  session.tel = rows[0].tel;
                  session.profilepicfile = rows[0].profilepicfile;
                  session.siteweb = rows[0].website;
                  session.couleur = rows[0].couleur;
                  res.redirect('/profile');
              }
          }
          else {
              res.render('message', { messageError: "Login ou mot de passe incorect", messageTitle: "Oops, une erreur est survenue" });
          }
      }
      else
      {
          logger.error(err);
          res.render('message', { messageError: "Login ou mot de passe incorect", messageTitle: "Oops, une erreur est survenue" });
      }
  });
});

/* On affiche le profile  */
app.get('/profile', function (req, res) {
    if (session.open) {
        res.render('profile', {
            //initialisation des variables de sessions
            email: session.email,
            id: session.id,
            nom: session.nom,
            prenom: session.prenom,
            tel: session.tel,
            birthdate: session.birthdate,
            age: session.age,
            ville: session.ville,
            taille: session.taille,
            sexe: session.sexe,
            profilepicfile: session.profilepicfile,
            siteweb: session.siteweb,
            couleur: session.couleur
        });
    }
    else res.redirect('/login');
});


//delete l'utilisateur courant
app.post('/deleteProfile', function (req, res) {
    if (session.open) {
        connection.query("delete from users where id = " + session.id, function (err, rows, fields) {
            if (!err) {
                res.render('message', { messageError: "Votre compte à bien été supprimé.", messageTitle: "Succès" });
                session.open = false;
            }
            else {
                res.render('message', { messageError: "Impossible de supprimer votre compte pour le moment. Veuillez re-essayer plus tard.", messageTitle: "Oops, une erreur est survenue" });
            }
        });
    }
    else res.redirect('/login');
});

app.get('/register', function (req, res) {
    res.render('register');
});


//enregistre une personne dans la base de données
app.post('/register', function (req, res) {

    //recuperation des variables de la methode post du formulaire /register
    var email = req.body.email;
    var password = req.body.password;
    var nom = req.body.nom;
    var prenom = req.body.prenom;
    var telephone = req.body.telephone;
    var siteweb = req.body.siteweb;
    var sexe = req.body.sexe;
    var birthdate = req.body.birthdate;
    var age = req.body.age;
    var ville = req.body.ville;
    var taille = req.body.taille;
    var couleur = req.body.couleur;
    var profilepicfile = req.body.profilepicfile;
    
    connection.query("INSERT INTO `users`(`id`, `email`, `password`, `nom`, `prenom`, `tel`, `website`, `sexe`, `birthdate`, `ville`, `taille`, `couleur`, `profilepic`) VALUES (null, '" + email + "', '" + password + "','" + nom + "','" + prenom + "','" + telephone + "','" + siteweb + "','" + sexe + "','" + birthdate + "','" + ville + "','" + taille + "','" + couleur + "','" + profilepicfile + "')", function (err, rows, fields) {
        if (!err) {
            logger.info(rows);
            res.redirect('/profile');
        }
        else {
            logger.error(err);
            res.render('message', { messageError: "Impossible de créer votre compte. Veuillez re-essayer plus tard.", messageTitle: "Oops, une erreur est survenue" });
        }
    });
});


logger.info('server start');
app.listen(1313);
