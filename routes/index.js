var express = require('express');
var router = express.Router();

//pour cloudinary
const cloudinary = require('cloudinary').v2;
const uniqid = require('uniqid'); //générer une id unique pour l'image
const fs = require('fs');

const AidantUser = require("../models/aidantUsers")
const ParentUser = require("../models/parentUsers")
const Mission = require("../models/missions")

///Pour enregistrer l'url Couldinary dans notre BDD MongoDB

router.post('/upload', async (req, res) => {
  const photoPath = `./tmp/${uniqid()}.jpg`; //lien local, création d'un fichier tmp temporaire 
  const resultMove = await req.files.photoFromFront.mv(photoPath); //pour le copier dans le dossier temporaire

  if (!resultMove) {
    const resultCloudinary = await cloudinary.uploader.upload(photoPath);
    fs.unlinkSync(photoPath);
    res.json({ result: true, url: resultCloudinary.secure_url });
  } else {
    res.json({ result: false, error: resultMove });
  }

  
});

//route pour créer une mission/une conversation
router.post('/missions/:parentToken/:aidantToken', async (req, res) => {
  try {
    const parentToken = req.params.parentToken;
    const aidantToken = req.params.aidantToken;

    const parentUser = await ParentUser.findOne({ token: parentToken });
    const aidantUser = await AidantUser.findOne({ token: aidantToken });

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

    await aidantUser.save(); // Enregistrer les modifications dans la collection aidantUsers de MongoDB
    await parentUser.save(); // Enregistrer les modifications dans la collection parentUsers de MongoDB


    res.status(201).json({ result: true, _id: savedMission._id, savedMission: savedMission });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


//route pour afficher les détails de la mission par rapport à l'id de la mission
router.get('/DetailsMission/:_id', (req, res) => {
  Mission.findOne({ _id: req.params._id})
  .populate('idAidant idParent')
  .then(data => {
    if (data){
      res.json({ result: true, infos: data });
    }  else {
      res.json({ result: false, error: 'No mission found' });
    }
  })
  .catch(error => {
    res.json({ result: false, error: error.message });
  });
});

//route pour afficher les détails de toutes les missions par rapport au token de la personne connectée

router.get('/missionsValidated/:token', async (req, res) => {
  const token = req.params.token;
  try {
    const parent = await ParentUser.findOne({ token });
    const aidant = await AidantUser.findOne({ token });

    if (!parent && !aidant) {
      return res.status(404).json({ error: 'User not found' });
    } 
    
    else if (aidant) {
      const user = aidant;
      const userId = user._id;
      // Si l'utilisateur connecté est un aidant, récupérez ses missions validées
      const missions = await Mission.find({ idAidant: userId, isValidate: true })
        .populate({
          path: 'idParent',
          populate: {
            path: 'parent',
            model: 'parentUsers',
          },
        })
        .then((missions) => {
          if (missions) {
            res.json({ result: true, missions: missions });
          }  else {
            res.json({ result: false, error: 'No mission found' });
          }
        })
        .catch(error => {
          res.json({ result: false, error: error.message });
        });
    } 
    
    else if (parent) {
      const user = parent;
      const userId = user._id;

      // Si l'utilisateur connecté est un parent, récupérez ses missions validées
      const missions = await Mission.find({ idParent: userId, isValidate: true })
        .populate('idAidant')
        .then((missions) => {
          if (missions) {
            res.json({ result: true, missions: missions });
          }  else {
            res.json({ result: false, error: 'No mission found' });
          }
        })
        .catch(error => {
          res.json({ result: false, error: error.message });
        });
    } 
    
    else {
      return res.status(404).json({ error: 'User not found' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des missions validées' });
  }
});


//route pour modifier la validation de la mission de false a true
router.put('/missions/validate/:id', (req, res) => {
  const missionId = req.params.id;

  Mission.findById(missionId)
    .then((mission) => {
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


// route pour supprimer une mission
router.delete('/missions/:idMission', (req, res) => {
  const idMission = req.params.idMission;

  Mission.deleteOne({ _id: idMission })
    .then(() => {
      Mission.find()
      .then(data => {
        console.log(data);
      });
      res.json({ result: true, message: 'Mission supprimée avec succès' });
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la suppression de la mission' });
    });
});


module.exports = router;