var express = require('express');
var router = express.Router();

const AidantUser = require("../models/aidantUsers");
const ParentUser = require("../models/parentUsers");
const Mission = require('../models/missions');

const { checkBody } = require('../modules/checkBody');

const date = new Date();



// route pour créer un message et le poster en base de données
router.post('/addMessage/:idMission', async (req, res) => {

    // if (!checkBody(req.body, ['token','content'])) {
    //     res.json({ result: false, error: 'Missing or empty fields' });
    //     return;
    // }

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
        // idAidant: mission.idAidant,
        // idParent: mission.idParent,
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
          path: 'messages.idParent',
          select: 'name firstName photo',
        })
        .sort({ 'messages.dateMsg': -1 });
  
      if (!mission) {
        return res.status(404).json({ error: 'Mission not found' });
      }
  
      const messages = mission.messages.map((message) => {
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


//route test:
router.get('/allmessages/:idMission', async (req, res) => {
  const { idMission } = req.params;

  if (user.isParent){

      const mission = await Mission.findById(idMission)
      .populate('mission.idParent', 'name firstName photo');

      if (mission) {
        const messages = mission.messages.map((message) => {
        const {contentMsg, dateMsg } = message;
        const author = mission.name; // Utilisateur unique pour le profil

        return {
          photo: author.photo,
          name: author.name,
          firstName: author.firstName,
          content: contentMsg,
          dateMsg: new Date(dateMsg).toLocaleString(),
        };
      });

      res.json({ messages });
    } 
    else {
      const mission = await Mission.findById(idMission)
      .populate({
        path: 'messages.idAidant',
        select: 'name firstName photo',
      })

      if (!mission) {
        return res.status(404).json({ error: 'Mission not found' });
      }

      const messages = mission.messages.map((message) => {
        const {contentMsg, dateMsg } = message;
        const author = mission.name; // Utilisateur unique pour le profil

        return {
          photo: author.photo,
          name: author.name,
          firstName: author.firstName,
          content: contentMsg,
          dateMsg: new Date(dateMsg).toLocaleString(),
        };
      });

      res.json({ messages });
    } 
  }
});



  
  

module.exports = router;
