var express = require('express');
var router = express.Router();

const AidantUser = require("../models/aidantUsers");
const ParentUser = require("../models/parentUsers");
const Mission = require('../models/missions');

const { checkBody } = require('../modules/checkBody');

const date = new Date();



// route pour créer un message et le poster en base de données
router.post('/addMessage/:idMission', async (req, res) => {

    if (!checkBody(req.body, ['token','content'])) {
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
  router.get('/allmessages/:idMission', async (req, res) => {
    const { idMission } = req.params;
  
    try {
      const mission = await Mission.findById(idMission)
        .populate({
          path: 'messages.idParent',        //chemin utilisé par le populate
          select: 'name firstName photo',   //propriétés que l'on souhaite récupérer
        })
        .sort({ 'messages.dateMsg': -1 }); //pour afficher les messages par ordre décroissant 
  
      if (!mission) {
        return res.status(404).json({ error: 'Mission not found' });
      }
  
      const messages = mission.messages.map((message) => {     //permet de renvoyer un composant des infos du message
        const { idParent, idAidant, contentMsg, dateMsg } = message;
        const author = idParent || idAidant;
  
        return {
          photo: author.photo,
          name: author.name,
          firstName: author.firstName,
          content: contentMsg,
          dateMsg: dateMsg.toLocaleString(),
        };
      });
  
      res.json({ messages });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });


// route pour afficher les derniers messages de toutes les conversations selon l'utilisateur
router.get('/allmessages/:token', async (req, res) => {
  const { token } = req.params;

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

if (!aidant && parent){
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
