var express = require('express');
var router = express.Router();

require('../models/connection');

const ParentUser = require('../models/parentUsers');

const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');

router.post('/signup', (req, res) => {
  console.log(req.body)
  if (!checkBody(req.body, ['emailParent', 'passwordParent'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  // Check if the user has not already been registered
  ParentUser.findOne({ emailParent: req.body.emailParent }).then(data => {
    // if data null, create newParentUser
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.passwordParent, 10);
    // req.body destructuration
      const {  
        photoParent,
        nameParent,
        firstNameParent,
        emailParent,
        phoneParent,
        shortBioParent,
        nameAine,
        firstNameAine,
        ageAine,
        sexeAine,
        addressAine, 
        zipAine,
        cityAine,
        introAine,
        longBioAine,
        gemProfil, 
        } = req.body;

      const newParentUser = new ParentUser({
        token: uid2(32),
        photoParent,
        nameParent,
        firstNameParent,
        emailParent,
        passwordParent: hash,
        phoneParent,
        shortBioParent,
        // Date du jour format
        signupParent: new Date(),
        // calcul de la moyenne pour la naote et les coeurs ?
        averageNoteParent: null,
        nameAine,
        firstNameAine,
        ageAine,
        sexeAine,
        addressAine, 
        zipAine,
        cityAine,
        introAine,
        longBioAine,
        gemProfil,
        mobility: false,
        hygiene: false,
        cooking: false,
        entertainment: false,
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

router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['emailParent', 'passwordParent'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  ParentUser.findOne({ emailParent: req.body.emailParent }).then(data => {
    if (data && bcrypt.compareSync(req.body.passwordParent, data.passwordParent)) {
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

module.exports = router;