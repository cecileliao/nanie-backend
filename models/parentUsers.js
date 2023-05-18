const mongoose = require('mongoose');

const talentsSchema = mongoose.Schema({
    mobility: Boolean,
    hygiene: Boolean,
    cooking: Boolean,
    entertainment: Boolean,
  });

const parentUserSchema = mongoose.Schema({
    token: String,
    photoParent: String,
    nameParent: String,
    firstNameParent: String,
    email: String,
    password: String,
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
    talents: talentsSchema,
    missions: [{ type: mongoose.Schema.Types.ObjectId, ref:'missions' }],
});

const ParentUser = mongoose.model('parentUsers', parentUserSchema);

module.exports = ParentUser;
