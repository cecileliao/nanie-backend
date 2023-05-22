var express = require('express');
var router = express.Router();

require('../models/connection');

const ParentUser = require('../models/parentUsers');

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
  ParentUser.findOne({ email: req.body.email }).then(data => {
    // if data null, create newParentUser
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);
    // req.body destructuration
      const {  
        photo,
        // nameParent,
        // firstNameParent,
        email,
        phone,
        // shortBio,
        name,
        firstName,
        age,
        sexe,
        address, 
        zip,
        city,
        introBio,
        longBio,
        // gemProfil,
        parent,
        talents,
        averageNote, 
        } = req.body;

      const newParentUser = new ParentUser({
        token: uid2(32),
        photo,
        // nameParent,
        // firstNameParent,
        email,
        password: hash,
        phone,
        // shortBio,
        signup: new Date(),         // Date du jour format
        averageNote,        // calcul de la moyenne pour la note et les coeurs ?
        name,
        firstName,
        age,
        sexe,
        address, 
        zip,
        city,
        introBio,
        longBio,
        // gemProfil,
        parent,
        talents,
        missions: [],
      });

      newParentUser.save().then(newDoc => {
        res.json({ result: true, token: newDoc.token });
      });
    } else {
      // User already exists in database
      res.json({ result: false, error: 'User already exists' });
    }
  });
});


//Route SignIn
router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }
  ParentUser.findOne({ email: req.body.email }).then(data => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, token: data.token });
    } else {
      res.json({ result: false, error: 'User not found or wrong password' });
    }
  });
});

//visualisation de tous les utilisateurs dans la bdd
router.get('/Allusers', (req, res) => {
  AidantUser.find().then(data => {
    res.json({ allUsers: data });
  });
 });

//Route pour la visualisation de tous les utilisateurs dans la bdd
router.get('/Allusers', (req, res) => {
  ParentUser.find().then(data => {
    res.json({ allUsers: data });
  });
 });

 //Route pour la visualisation de toutes les informations d'un utilisateur dans la bdd
router.get('/Infos/:token', (req, res) => {
  ParentUser.findOne({ token: req.params.token }).then(data => {
    console.log(data)
    res.json({ result: true, Parentinfos: data });
  });
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