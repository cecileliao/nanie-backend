const mongoose = require('mongoose');

const availabilitySchema = mongoose.Schema({
  startingDay: Date,
  endingDay: Date,
  startingHour: Date,
  endingHour: Date
});

const aidantUserSchema = mongoose.Schema({
  token: String,
  photoAidant: String,
  nameAidant: String,
  firstNameAidant: String,
  emailAidant: String,
  passwordAidant: String,
  signupAidant: Date,
  phoneAidant: String,
  ageAidant: Number,
  sexeAidant: String,
  addressAidant: String,
  zipAidant: String,
  cityAidant: String, 
  car: Boolean,
  introBioAidant: String,
  longBioAidant: String,
  abilitiesAidant: String,
  ratebyHour: Number,
  averageNote: Number,
  averageHeart: Number,
  mobility: Boolean,
  hygiene: Boolean,
  cooking: Boolean,
  entertainment: Boolean,
  availabilities: [availabilitySchema],
  missions: [{ type: mongoose.Schema.Types.ObjectId, ref:'missions' }],
});

const AidantUser = mongoose.model('aidantUsers', aidantUserSchema);

module.exports = AidantUser;

