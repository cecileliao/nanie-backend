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
  AidantUser.findOne({ emailAidant: req.body.email }).then(data => {
    // if data null, create newAidantUser
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);
    // req.body destructuration
      const {  
        photoAidant,
        nameAidant,
        firstNameAidant,
        emailAidant,
        phoneAidant,
        ageAidant,
        sexeAidant,
        addressAidant,
        zipAidant,
        cityAidant, 
        introBioAidant,
        longBioAidant,
        abilitiesAidant,
        ratebyHour,
        } = req.body;

      const newAidantUser = new AidantUser({
        token: uid2(32),
        photoAidant,
        nameAidant,
        firstNameAidant,
        emailAidant,
        passwordAidant: hash,
        // Date du jour format ?
        signupAidant: new Date(),
        phoneAidant,
        ageAidant,
        sexeAidant,
        addressAidant,
        zipAidant,
        cityAidant, 
        car: false,
        introBioAidant,
        longBioAidant,
        abilitiesAidant,
        ratebyHour,
        // calcul de la moyenne pour la naote et les coeurs ?
        averageNoteAidant: null,
        mobility: false,
        hygiene: false,
        cooking: false,
        entertainment: false,
        availabilities: [{
          startingDay: null,
          endingDay: null,
          startingHour: null,
          endingHour: null
        }],
        missions: [],
      });

      newAidantUser.save().then(newDoc => {
        res.json({ result: true, token: newDoc.token });
      });
    } else {
      // User already exists in database
      res.json({ result: false, error: 'User already exists' });
    }
  });
});

router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  AidantUser.findOne({ emailAidant: req.body.email }).then(data => {
    if (data && bcrypt.compareSync(req.body.password, data.passwordAidant)) {
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
