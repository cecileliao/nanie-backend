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
  const { contentMsg, token } = req.body;

  try {
    // Recherchez la mission correspondante dans la base de données
    const mission = await Mission.findById(idMission);

    if (!mission) {
      return res.status(404).json({ error: 'Mission not found' });
    }

      const parent = await ParentUser.findOne({ token });
      const aidant = await AidantUser.findOne({ token });
  
      if (!parent && !aidant) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      let author;
      if (aidant) {
        author = await AidantUser.findById(mission.idAidant);
        if (!author) {
          return res.status(404).json({ error: 'Aidant not found' });
        }
        // Créez un nouvel objet message à partir des données fournies
        const newMessage = {
          dateMsg: date.toLocaleString(),
          contentMsg,
          author:{
            firstName: author.firstName, //author.firstName vient du findById
            name: author.name,
            isParent: false,
            photo: author.photo,
          }
        };
        mission.messages.push(newMessage);                      // Ajoutez le nouveau message à la liste des messages de la mission
        await mission.save();                                   // Enregistrez les modifications de la mission dans la base de données
        res.json({ result: true, message: newMessage });        // Répondez avec le message créé
      }

      else if (parent) {
        author = await ParentUser.findById(mission.idParent);
        if (!author) {
          return res.status(404).json({ error: 'Parent not found' });
        }
        // Créez un nouvel objet message à partir des données fournies
        const newMessage = {
          dateMsg: date.toLocaleString(),
          contentMsg,
          author: {
            firstName: author.parent.firstNameParent,
            name: author.parent.nameParent,
            isParent: true,
            photo: author.photo,
          }
        };
        mission.messages.push(newMessage);                      // Ajoutez le nouveau message à la liste des messages de la mission
        await mission.save();                                   // Enregistrez les modifications de la mission dans la base de données
        res.json({ result: true, message: newMessage });        // Répondez avec le message créé
      }
      
      else {
        return res.status(404).json({ error: 'User not found' });
      }

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


// route pour afficher tous les messages dans une page de conversation

router.get('/allmessages/:token/:idMission', async (req, res) => {
  try {
    const { token, idMission } = req.params;

    const parent = await ParentUser.findOne({ token });
    const aidant = await AidantUser.findOne({ token });

    if (!parent && !aidant) {
      return res.status(404).json({ error: 'User not found' });
    }

    let user;

    if (aidant){
    user = aidant;
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
          const { author, contentMsg, dateMsg } = message;

          return {
            author:{
              photo: author.photo,
              name: author.name,
              firstName: author.firstName,
              isParent: author.isParent,
            },
            contentMsg: contentMsg,
            dateMsg: dateMsg.toLocaleString(),
          };

        });
        
        res.json({ result: true, messages })
      });
    }

    else if (parent){
    user = parent;
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
          const { author, contentMsg, dateMsg } = message;

          return {
            author:{
              photo: author.photo,
              name: author.name,
              firstName: author.firstName,
              isParent: author.isParent,
            },
            contentMsg: contentMsg,
            dateMsg: dateMsg.toLocaleString(),
          };

        });
    
        res.json({ result: true, messages })
      });
    }

    else {
      return res.status(404).json({ error: 'User not found' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// route pour afficher les derniers messages de toutes les conversations selon l'utilisateur
router.get('/allchats/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const parent = await ParentUser.findOne({ token });
    const aidant = await AidantUser.findOne({ token });

    if (!parent && !aidant) {
      return res.status(404).json({ error: 'User not found' });
    }

    else if (aidant){

      const missions = await Mission.find({ idAidant: aidant._id})
        .sort({ 'messages.dateMsg': -1 }) // Tri par ordre descendant (les plus anciens en haut)
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
      
          res.json({ lastMessages: lastMessages.filter(Boolean) }); //En utilisant lastMessages.filter(Boolean), on s'assure que seuls les objets avec des messages valides seront inclus dans le tableau lastMessages renvoyé par la route. Cela permet d'éviter d'inclure des conversations vides ou inexistantes dans la réponse.
        })
      
    }

    else if (parent){

      const missions = await Mission.find({idParent: parent._id })
        .sort({ 'messages.dateMsg': -1 }) // Tri par ordre descendant (les plus anciens en haut)
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

    else {
      return res.status(404).json({ error: 'User not found' });
    }
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
  
  

module.exports = router;
