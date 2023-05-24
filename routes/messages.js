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
          path: 'messages.idParent messages.idAidant',
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
          dateMsg: date.toLocaleString(),
        };
      });
  
      res.json({ messages });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });



  // route pour afficher les derniers messages de toutes les conversations
  router.get('/allmessages/:token', async (req, res) => {
    const { token } = req.params;
  
    try {
      const parent = await ParentUser.findOne({ token });
      const aidant = await AidantUser.findOne({ token });
  
      if (!parent && !aidant) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const user = parent || aidant;
      const userId = user._id;
  
      const missions = await Mission.find({
        $or: [{ idParent: userId }, { idAidant: userId }],
      })
        .sort({ 'messages.dateMsg': -1 }) // Tri par ordre descendant (les plus anciens en haut)
        .limit(1)
        .populate({
          path: 'messages.idParent messages.idAidant',
          select: 'name firstName photo',
        });
  
      const lastMessages = missions.map((mission) => {
        const message = mission.messages[mission.messages.length - 1];
  
        if (!message) {
          return null;
        }
  
        const { idParent, idAidant, contentMsg, dateMsg } = message;
        const author = idParent || idAidant;
  
        return {
          idMission: mission._id,
          photo: author.photo,
          name: author.name,
          firstName: author.firstName,
          content: contentMsg,
          dateMsg: date.toLocaleString(),
        };
      });
  
      res.json({ lastMessages: lastMessages.filter(Boolean) });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

module.exports = router;
