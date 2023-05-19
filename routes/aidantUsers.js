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
  // console.log(req.body) pour verifier la route
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
        signup: new Date(),        // Date du jour format ?
        phone,
        age,
        sexe,
        address,
        zip,
        city, 
        introBio,
        longBio,
        isParent,
        averageNote,        // calcul de la moyenne pour la note et les coeurs ?
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


//Route pour la visualisation de tous les utilisateurs dans la bdd
router.get('/Allusers', (req, res) => {
  AidantUser.find().then(data => {
    res.json({ allUsers: data });
  });
 });

 //Route pour la visualisation de toutes les informations d'un utilisateur dans la bdd
router.get('/Infos/:token', (req, res) => {
  AidantUser.findOne({ token: req.params.token }).then(data => {
    console.log(data)
    res.json({ result: true, Aidantinfos: data });
  });
});

//Route pour les messages?
router.get('/Messages/:token', (req, res) => {
  AidantUser.findOne({ token: req.params.token }).then(data => {
    console.log(data);

    Mission.find({ idAidant: data._id })
      .populate('messages') // Charger les messages de la mission
      .then(missions => {
        console.log(missions);
        res.json({ result: true, Aidantinfos: data, messages: messages });
      })
  })
});

// router.get('/canBookmark/:token', (req, res) => {
//   User.findOne({ token: req.params.token }).then(data => {
//     if (data) {
//       res.json({ result: true, canBookmark: data.canBookmark });
//     } else {
//       res.json({ result: false, error: 'User not found' });
//     }
//   });
// });


module.exports = router;
