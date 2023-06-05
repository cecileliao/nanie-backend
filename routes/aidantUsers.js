var express = require('express');
var router = express.Router();


require('../models/connection');

const AidantUser = require('../models/aidantUsers');

//check les champs vides
const { checkBody } = require('../modules/checkBody');
//crypt le mot de passe
const uid2 = require('uid2');
const bcrypt = require('bcrypt');


// Route SignUp
router.post('/signup', (req, res) => {

  if (!checkBody(req.body, ['email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }
  // Check if the user has not already been registered
  AidantUser.findOne({ email: req.body.email }).then(data => {
    // if data null, create newAidantUser
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);
    // req.body destructuration
      const {
        email,  
        photo,
        name,
        firstName,
        phone,
        age,
        sexe,
        address,
        zip,
        city,
        introBio,
        longBio,
        aidant,
        talents,
        averageNote,
        isParent,
        } = req.body;

      const newAidantUser = new AidantUser({
        token: uid2(32),
        photo,
        name,
        firstName,
        email,
        password: hash,
        signup: new Date(),        
        phone,
        age,
        sexe,
        address,
        zip,
        city, 
        introBio,
        longBio,
        isParent,
        averageNote,       
        aidant,
        talents,
        availabilities: [],
        missions: [],
      });

      newAidantUser.save().then(newDoc => {
        res.json({ result: true, token: newDoc.token });
      });
    } 
    else {
      res.json({ result: false, error: 'User already exists' });       // User already exists in database
    }
  }).catch((err) => console.log(err))
});

//Route SignIn
router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }
  AidantUser.findOne({ email: req.body.email }).then(data => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, token: data.token });
    } else {
      res.json({ result: false, error: 'User not found or wrong password' });
    }
  });
});

///////Route pour visualiser les dispos des aidants quand le parent fait une recherche 
router.get('/search/:startingDay/:endingDay', (req, res) => {

  const { startingDay, endingDay } = req.params;


  AidantUser.find({
    'availabilities.startingDay': { $gte: startingDay }, //$gte : greater than or equal to
    'availabilities.endingDay': { $lte: endingDay },    //$lte :less than or equal to
  })
    .then(data => {
      if (data[0].availabilities.length > 0) {
        res.json({ result: true, dispos: data });
      } else {
        res.json({ result: false, error: 'No dispo found' });
      }
    })
    .catch(error => {
      res.json({ result: false, error: error.message });
    });
 });
 

///////Route pour visualiser les dispos d'un aidant selon son token pour les afficher dans sa page de calendrier

router.get('/dispos/:token', (req, res) => {
  AidantUser.findOne({ token: req.params.token }).then(data => {
    res.json({ result: true, UserDispos: data.availabilities });
  });
 });



 //////////route post ajout un dispo d'un aidant

 router.post('/addDispo/:token', (req, res) => {

     
  AidantUser.findOne({ token: req.params.token }).then(data => {

        // req.body destructuration
        const { 
          startingDay,
          endingDay,
          startingHour,
          endingHour,
        } = req.body;
  

      const newAvailability = {
        startingDay,
        endingDay,
        startingHour,
        endingHour,
      };

      data.availabilities.push(newAvailability);

      data.save().then(savedAvaibility => {
        res.json({ result: true, UserDispos: savedAvaibility.availabilities, newAvailability: newAvailability });
      });
  }).catch((err) => console.log(err))
});

//////route pour supprimer une disponibilité d'un aidant 

router.delete('/deleteDispo', (req, res) => {

  AidantUser.findOne({ token: req.body.token }).then(data => {


    const availabilityId = req.body.availabilityId;

      // Vérifier si l'ID de disponibilité existe dans le tableau des disponibilités de l'utilisateur
      //méthode Array.findIndex() pour rechercher l'index de la disponibilité dans le tableau 'data.availabilities'
      //parcourt chaque élément du tableau et exécuter la fonction pour vérifier si l'id de la dispo existe
      const availabilityIndex = data.availabilities.findIndex(availability => availability._id == availabilityId);
      //si trouve l'id va retourner l'index dans la constante availabilityIndex
        if (availabilityIndex === -1) {
          //si ne trouve pas l'id retourne -1
          return res.status(404).json({ error: "La disponibilité n'a pas été trouvée." });
        }
        
        // Supprimer la disponibilité du tableau des disponibilités
        //méthoe Array.splice pour supprimer du tableau data.availabilities
        //2 arguments: index de départ et nombre d'éléments à supprimer
        data.availabilities.splice(availabilityIndex, 1);
    
        // Enregistrer les modifications
        data.save().then(savedAvailability => {
          res.json({ result: true, UserDispos: savedAvailability.availabilities });
        });
  })
});




/////Route pour la visualisation de tous les utilisateurs dans la bdd
//pour test dans Thunder Client, non utilisé 
router.get('/Allusers', (req, res) => {
  AidantUser.find().then(data => {
    res.json({ allUsers: data });
  });
 });

//Route pour la visualisation de toutes les informations d'un utilisateur dans la bdd
//pour afficher le profil utilisateur
router.get('/Infos/:token', (req, res) => {
  AidantUser.findOne({ token: req.params.token }).then(data => {
    res.json({ result: true, Aidantinfos: data });
  });
});


module.exports = router;
