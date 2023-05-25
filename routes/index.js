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


//route pour modifier la validation de la mission de false a true
router.put('/missions/:id/validate', async (req, res) => {
  try {
    const missionId = req.params.id;
    const updatedMission = await Mission.findByIdAndUpdate(
      missionId,
      { isValidate: true },
      { new: true } // Ceci est utilisé pour renvoyer la mission mise à jour plutôt que l'ancienne
    );
    res.json(updatedMission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la mission' });
  }
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

module.exports = router;