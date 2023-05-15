const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
	dateMsg: Date,
    // (24/02/2023 14:00)
    contentMsg: String,
});

const recommandationSchema = mongoose.Schema({
	publicationDate: Date,
    contentReco: String,
    note: Number,
});

const missionSchema = mongoose.Schema({
	startingDay: Date,
    endingDay: Date,
    startingHour: Date,
    endingHour: Date,
    // spotter seulement les éléments utiles
    idAidant: { type: mongoose.Schema.Types.ObjectId, ref:'aidantUsers' },
    idParent: { type: mongoose.Schema.Types.ObjectId, ref:'parentUsers' },
    ratebyHour: { type: mongoose.Schema.Types.ObjectId, ref:'aidantUsers' },
    amount: Number,
    validateur: Boolean,
    messages: [messageSchema],
    recommendations: [recommandationSchema],
});

const Mission = mongoose.model('missions', missionSchema);

module.exports = Mission;