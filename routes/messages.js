var express = require('express');
var router = express.Router();

const AidantUser = require("../models/aidantUsers");
const ParentUser = require("../models/parentUsers");
const Mission = require('../models/missions');

const { checkBody } = require('../modules/checkBody');

const date = new Date();



// route pour créer un message et le poster en base de données
router.post('/addMessage/:idMission', async (req, res) => {

    if (!checkBody(req.body, ['token','contentMsg'])) {
        res.json({ result: false, error: 'Missing or empty fields' });
        return;
    }

    const { idMission } = req.params;
    const { contentMsg } = req.body;
  
    try {
      // Recherchez la mission correspondante dans la base de données
      const mission = await Mission.findById(idMission);
  
      if (!mission) {
        return res.status(404).json({ error: 'Mission not found' });
      } 

      // Créez un nouvel objet message à partir des données fournies
      const newMessage = {
        dateMsg: date.toLocaleString(),
        contentMsg,
        idAidant: mission.idAidant,
        idParent: mission.idParent,
      };
  
      // Ajoutez le nouveau message à la liste des messages de la mission
      mission.messages.push(newMessage);
  
      // Enregistrez les modifications de la mission dans la base de données
      await mission.save();
  
      // Répondez avec le message créé
      res.json({ result: true, message: newMessage });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });



  // route pour afficher tous les messages dans une page de conversation
  router.get('/allmessages/:token/:idMission', async (req, res) => {
    const { token, idMission } = req.params;

    const parent = await ParentUser.findOne({ token });
    const aidant = await AidantUser.findOne({ token });

    if (!parent && !aidant) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (aidant){

    const mission = await Mission.findById(idMission)
      .populate({
        path: 'idParent idAidant',
      })
      .sort({ 'messages.dateMsg': -1 })
      .then(missionData => {
        if (!missionData) {
          return res.status(404).json({ error: 'Mission not found' });
        }
       
        const messages = missionData.messages.map((message) => {
          const { contentMsg, dateMsg } = message;
          const author = missionData.idAidant;
          return {
            photo: author.photo,
            name: author.name,
            firstName: author.firstName,
            contentMsg: contentMsg,
            dateMsg: dateMsg.toLocaleString(),
          };

        });
        res.json({ result: true, messages })
      });
    }

    if (parent){
    const mission = await Mission.findById(idMission)
      .populate({
        path: 'idParent idAidant',
      })
      .sort({ 'messages.dateMsg': -1 })
      .then(missionData => {

        if (!missionData) {
          return res.status(404).json({ error: 'Mission not found' });
        }
      
        const messages = missionData.messages.map((message) => {
          const { contentMsg, dateMsg } = message;
          const author = missionData.idParent;
          return {
            photo: author.photo,
            name: author.parent.nameParent,
            firstName: author.parent.firstNameParent,
            contentMsg: contentMsg,
            dateMsg: dateMsg.toLocaleString(),
          };

        });
    
        res.json({ result: true, messages })
      });
    }
  });


// route pour afficher les derniers messages de toutes les conversations selon l'utilisateur
router.get('/allchats/:token', async (req, res) => {
  const { token } = req.params;

const parent = await ParentUser.findOne({ token });
const aidant = await AidantUser.findOne({ token });

if (!parent && !aidant) {
  return res.status(404).json({ error: 'User not found' });
}

if (aidant){

  const user = aidant;
  const userId = user._id;

  const missions = await Mission.find({ idAidant: userId })
    .sort({ 'messages.dateMsg': -1 }) // Tri par ordre descendant (les plus anciens en haut)
    .limit(1) //afficher 1 seul msg
    .populate({
      path: 'idAidant idParent',
    })
    .then(missions => {


      const lastMessages = missions.map((mission) => { //afficher les missions avec le dernier msg
        const message = mission.messages[mission.messages.length - 1]; //permet de récupérer l'index du dernier msg
  
        if (!message) {
          return null;
        }
  
        const { contentMsg, dateMsg } = message;
        const author = mission.idParent; 
        return {
          idMission: mission._id,
          photo: author.photo,
          name: author.parent.nameParent,
          firstName: author.parent.firstNameParent,
          contentMsg: contentMsg,
          dateMsg: dateMsg.toLocaleString(),
        };
      });
  
      res.json({ lastMessages: lastMessages.filter(Boolean) }); //filtre le tableau lastMessages et supprimer les valeurs nulles et undefined
      //filtre les valeurs pas utiles
    })
  
}

if (parent){
  const user = parent;
  const userId = user._id;

  const missions = await Mission.find({idParent: userId})
    .sort({ 'messages.dateMsg': -1 }) // Tri par ordre descendant (les plus anciens en haut)
    .limit(1)
    .populate({
      path: 'idParent idAidant',
    })
    .then((missions) => {


      const lastMessages = missions.map((mission) => {
        const message = mission.messages[mission.messages.length - 1];

        if (!message) {
          console.log('pas de message')
          return null;
        }
  
        const { contentMsg, dateMsg } = message;
        const author = mission.idAidant;
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
    });
}
});
  
  

module.exports = router;
