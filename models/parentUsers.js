const mongoose = require('mongoose');

const talentsSchema = mongoose.Schema({
  mobility: Boolean,
  hygiene: Boolean,
  cooking: Boolean,
  entertainment: Boolean,
});

const parentSchema = mongoose.Schema({
nameParent: String,
firstNameParent: String,
shortBio: String,
gemProfil: String,
});

const parentUserSchema = mongoose.Schema({
    token: String,
    photo: String,
    email: String,
    password: String,
    phone: String,
    signup: Date,
    averageNote: Number,
    name: String,
    firstName: String,
    age: Number,
    sexe: String,
    address: String, 
    zip: String,
    city: String,
    introBio: String,
    longBio: String,
    parent: parentSchema,
    talents: talentsSchema,
    missions: [{ type: mongoose.Schema.Types.ObjectId, ref:'missions' }],
});

const ParentUser = mongoose.model('parentUsers', parentUserSchema);

module.exports = ParentUser;
