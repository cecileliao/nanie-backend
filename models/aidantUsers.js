const mongoose = require('mongoose');

const availabilitySchema = mongoose.Schema({
  startingDay: Date,
  endingDay: Date,
  startingHour: Date,
  endingHour: Date
});

const talentsSchema = mongoose.Schema({
    mobility: Boolean,
    hygiene: Boolean,
    cooking: Boolean,
    entertainment: Boolean,
  });

  const aidantSchema = mongoose.Schema({
    car: Boolean,
    abilities: String,
    rate: Number,
  });

const aidantUserSchema = mongoose.Schema({
  token: String,
  photo: String,
  name: String,
  firstName: String,
  email: String,
  password: String,
  signup: Date,
  phone: String,
  age: Number,
  sexe: String,
  address: String,
  zip: String,
  city: String, 
  introBio: String,
  longBio: String,
  averageNote: Number,
  averageHeart: Number,
  isParent: Boolean,
  aidant: aidantSchema,
  talents: talentsSchema,
  availabilities: [availabilitySchema],
  missions: [{ type: mongoose.Schema.Types.ObjectId, ref:'missions' }],
});

const AidantUser = mongoose.model('aidantUsers', aidantUserSchema);

module.exports = AidantUser;

