const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
	dateMsg: Date,
    contentMsg: String,
    author: {
        firstName: String,
        name: String,
        isParent: Boolean,
        photo: String,
	}
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
    idAidant: { type: mongoose.Schema.Types.ObjectId, ref:'aidantUsers' },
    idParent: { type: mongoose.Schema.Types.ObjectId, ref:'parentUsers' },
    rateByHour: Number,
    numberOfHour: Number,
    amount: Number,
    isValidate: Boolean,
    messages: [messageSchema],
    recommendations: [recommandationSchema],
});

const Mission = mongoose.model('missions', missionSchema);

module.exports = Mission;