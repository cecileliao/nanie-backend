const mongoose = require('mongoose');

const parentUserSchema = mongoose.Schema({
    token: String,
    photoParent: String,
    nameParent: String,
    firstNameParent: String,
    emailParent: String,
    passwordParent: String,
    phoneParent: String,
    shortBioParent: String,
    signupParent: Date,
    averageNoteParent: Number,
    nameAine: String,
    firstNameAine: String,
    ageAine: Number,
    sexeAine: String,
    addressAine: String, 
    zipAine: String,
    cityAine: String,
    introAine: String,
    longBioAine: String,
    gemProfil: String,
    mobility: Boolean,
    hygiene: Boolean,
    cooking: Boolean,
    entertainment: Boolean,
    missions: [{ type: mongoose.Schema.Types.ObjectId, ref:'missions' }],
});

const ParentUser = mongoose.model('parentUsers', parentUserSchema);

module.exports = ParentUser;
