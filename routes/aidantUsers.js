var express = require('express');
var router = express.Router();

require('../models/connection');

const AidantUser = require('../models/aidantUsers');

const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');

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
        averageNoteAidant,
        isParent,
        } = req.body;

      const newAidantUser = new AidantUser({
        token: uid2(32),
        photo,
        name,
        firstName,
        email,
        password: hash,
        // Date du jour format ?
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
        // calcul de la moyenne pour la naote et les coeurs ?
        averageNoteAidant,
        aidant,
        talents,
        availabilities: [],
        missions: [],
      });

      newAidantUser.save().then(newDoc => {
        res.json({ result: true, token: newDoc.token });
      });
    } 
    //else {
      // User already exists in database
    //   res.json({ result: false, error: 'User already exists' });
    // }
  }).catch((err) => console.log(err))
});

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

// router.get('/canBookmark/:token', (req, res) => {
//   User.findOne({ token: req.params.token }).then(data => {
//     if (data) {
//       res.json({ result: true, canBookmark: data.canBookmark });
//     } else {
//       res.json({ result: false, error: 'User not found' });
//     }
//   });
// });

//visualisation de tous les utilisateurs dans la bdd
router.get('/Allusers', (req, res) => {
  AidantUser.find().then(data => {
    res.json({ allUsers: data });
  });
 });

router.get('/Infos/:token', (req, res) => {

  AidantUser.findOne({ token: req.params.token }).then(data => {
    console.log(data)
              res.json({ result: true, Aidantinfos: data });
            });
        });



module.exports = router;
