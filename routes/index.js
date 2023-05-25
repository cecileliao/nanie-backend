var express = require('express');
var router = express.Router();

const cloudinary = require('cloudinary').v2;
const uniqid = require('uniqid');
const fs = require('fs');
const AidantUser = require("../models/aidantUsers")
const ParentUser = require("../models/parentUsers")
const Mission = require("../models/missions")

router.post('/upload', async (req, res) => {
  const photoPath = `./tmp/${uniqid()}.jpg`;
  const resultMove = await req.files.photoFromFront.mv(photoPath);

  if (!resultMove) {
    const resultCloudinary = await cloudinary.uploader.upload(photoPath);
    fs.unlinkSync(photoPath);
    res.json({ result: true, url: resultCloudinary.secure_url });
  } else {
    res.json({ result: false, error: resultMove });
  }

  
});

//route pour créer une mission
router.post('/missions/:parentToken/:aidantToken', async (req, res) => {
  try {
    const parentToken = req.params.parentToken;
    const aidantToken = req.params.aidantToken;

    const parentUser = await ParentUser.findOne({ token: parentToken });
    const aidantUser = await AidantUser.findOne({ token: aidantToken });
    //console.log("parentUser", parentUser)
    console.log("aidantUserRate", aidantUser.aidant.rate)
    // Vérification si les utilisateurs existent
    if (!parentUser || !aidantUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }


    const { startingDay, endingDay, startingHour, endingHour } = req.body;

    //calcul du nombre d'heures entre la date de fin et la date de début de mission
    //besoin de configurer sous format date
    const NewstartingDay = new Date(startingDay);
    const NewendingDay = new Date(endingDay);
    const differenceInMilliseconds = NewendingDay - NewstartingDay;
    const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60); // Convertir les millisecondes en heures
    
    //calcul du montant total de la mission
    const amount = aidantUser.aidant.rate * differenceInHours
    //console.log(amount)

    const mission = new Mission({
      startingDay,
      endingDay,
      startingHour,
      endingHour,
      idAidant: aidantUser._id,
      idParent: parentUser._id,
      rateByHour: aidantUser.aidant.rate,
      numberOfHour: differenceInHours,
      amount: amount,
      isValidate:false,
      messages: [],
      recommendations: []
    });

    const savedMission = await mission.save();
    
    //ajout de l'id de la mission dans l'aidant et le parent associés 
    aidantUser.missions.push(savedMission);
    parentUser.missions.push(savedMission);
    //console.log(aidantUser.missions)

    await aidantUser.save(); // Enregistrer les modifications dans la collection aidantUsers de MongoDB
    await parentUser.save(); // Enregistrer les modifications dans la collection parentUsers de MongoDB



    res.status(201).json({ result: true, _id: savedMission._id, savedMission: savedMission });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
//mission crée Emma Lorain et Léa Colin (parent)


//route pour afficher les détails de la mission par rapport à l'id de la mission
router.get('/DetailsMission/:_id', (req, res) => {
  Mission.findOne({ _id: req.params._id}).populate('idAidant idParent')
  .then(data => {
    console.log(data)
    res.json({ result: true, Aidantinfos: data });
  });
});

//route pour afficher les détails de toutes les missions par rapport au token de la personne connectée

router.get('/missionsValidated/:token', (req, res) => {
  const token = req.params.token;
  //console.log(token)

    // Recherchez l'utilisateur connecté dans la collection AidantUser
    AidantUser.findOne({ token: token })
      .then(data => {
        //console.log("aidant", data)
        if (data) {
          // Si l'utilisateur connecté est un aidant, récupérez ses missions validées
          return Mission.find({ idAidant: data._id, isValidate: true })
            .populate('idParent');
        } else {
          // Sinon, recherchez l'utilisateur connecté dans la collection ParentUser
          return ParentUser.findOne({ token: token})
            .then(data => {
              //console.log("parent", data)
              if (data) {
                // Si l'utilisateur connecté est un parent, récupérez ses missions validées
                return Mission.find({ idParent: data._id, isValidate: true })
                  .populate('idAidant')
              } else {
                throw new Error('Utilisateur non trouvé');
              }
            });
        }
      })
      .then(missions => {
        res.json(missions);
      })
      .catch(error => {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des missions validées' });
      });
  });


//route pour modifier la validation de la mission de false a true
router.put('/missions/validate/:id', (req, res) => {
  const missionId = req.params.id;

  Mission.findById(missionId)
    .then((mission) => {
      console.log(mission)
      if (!mission) {
        return res.status(404).json({ error: 'Mission non trouvée' });
      }

      mission.isValidate = true;

      mission.save()
        .then((updatedMission) => {
          res.json({ result: true, missionValidated: updatedMission });
        })
        .catch((error) => {
          console.error(error);
          res.status(500).json({ error: 'Erreur lors de la mise à jour de la mission' });
        });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la recherche de la mission' });
    });
});


// router.post('/upload/:token', async (req, res) => {
//   const parent = ParentUser.findOne({token: req.params.token})
//   const aidant = AidantUser.findOne({token: req.params.token})

//   const photoPath = `./tmp/${uniqid()}.jpg`;
//   const resultMove = await req.files.photoFromFront.mv(photoPath);

//   if (!resultMove) {
//     const resultCloudinary = await cloudinary.uploader.upload(photoPath);
//     fs.unlinkSync(photoPath);

//     if (!parent && aidant) {
//       aidant.photo = resultCloudinary.secure_url
//       aidant.save()
//     } else if (!aidant && parent) {
//       parent.photo = resultCloudinary.secure_url
//       parent.save()
//     } else {
//       return res.json({ result: false });
//     }
    
//     res.json({ result: true, url: resultCloudinary.secure_url });
//   } else {
//     res.json({ result: false, error: resultMove });
//   }

  
// });

// route pour afficher les derniers messages de toutes les conversations
router.get('/allmessages/:token', async (req, res) => {
  const { token } = req.params;
  console.log('token', token)

    const parent = await ParentUser.findOne({ token });
    const aidant = await AidantUser.findOne({ token });

    if (!parent && !aidant) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!parent && aidant){

      const user = aidant;
      const userId = user._id;
    
      const missions = await Mission.find({ idAidant: userId })
        .sort({ 'messages.dateMsg': -1 }) // Tri par ordre descendant (les plus anciens en haut)
        .limit(1)
        .populate({
          path: 'idAidant',
          select: 'name firstName photo',
        });

        console.log('populate', populate)
  
      const lastMessages = missions.map((mission) => {
        const message = mission.messages[mission.messages.length - 1];
  
        if (!message) {
          // console.log('pas de message')
          return null;
        }
  
        const { contentMsg, dateMsg } = message;
        const author = mission.idAidant;
        console.log('coucou', message)
        return {
          idMission: mission._id,
          photo: author.photo,
          name: author.name,
          firstName: author.firstName,
          contentMsg: contentMsg,
          dateMsg: dateMsg.toLocaleString(),
        };
      });
  
      res.json({ lastMessages: lastMessages.filter(Boolean) });
      console.log(lastMessages)
    }

    if (!aidant && parent){
      const user = parent;
      const userId = user._id;

      const missions = await Mission.find({idParent: userId})
        .sort({ 'messages.dateMsg': -1 }) // Tri par ordre descendant (les plus anciens en haut)
        .limit(1)
        .populate({
          path: 'idParent',
          // select: 'parent.nameParent parent.firstNameParent photo',
        });
  // console.log('missions', missions)
      const lastMessages = missions.map((mission) => {
        const message = mission.messages[mission.messages.length - 1];
  
        if (!message) {
          // console.log('pas de message')
          return null;
        }
  
        const { contentMsg, dateMsg } = message;
        const author = mission.idParent;
        // console.log('coucou', author)
        return {
          idMission: mission._id,
          photo: author.photo,
          name: author.parent.nameParent,
          firstName: author.parent.firstNameParent,
          contentMsg: contentMsg,
          dateMsg: dateMsg.toLocaleString(),
        };
      });
      res.json({ lastMessages: lastMessages.filter(Boolean) });
      console.log(lastMessages)
    }
});

module.exports = router;