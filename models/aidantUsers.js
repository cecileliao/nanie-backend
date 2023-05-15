const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  email: String,
  password: String,
  token: String,
});

Aidant
photoAidant: String
nameAidant: String 
firstNameAidant: String

emailAidant: String
passwordAidant: String
signupAidant: Date

phoneAidant: Number
ageAidant: Number 
sexeAidant: String

adressAidant: String
zipAidant: String
cityAidant: String 

car: Booleen 

introBioAidant: String
longBioAidant: String
abilitiesAidant: String

ratebyHour: Number
averageNote: Number
averageHeart: Number

mobility: Boolean
hygiene: Boolean
cooking: Boolean
entertainment: Boolean

availabilities : [{}]
Availabilities
startingDay: Date
endingDay: Date
startingHour: Date
endingHour: Date

**Missions/Conversations: ObjectID

const User = mongoose.model('users', userSchema);

module.exports = User;

