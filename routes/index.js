var express = require('express');
var router = express.Router();

const cloudinary = require('cloudinary').v2;
const uniqid = require('uniqid');
const fs = require('fs');
const AidantUser = require("../models/aidantUsers")
const ParentUser = require("../models/parentUsers")

router.post('/upload', async (req, res) => {
  const photoPath = `./tmp/${uniqid()}.jpg`;
  const resultMove = await req.files.photoFromFront.mv(photoPath);

  if (!resultMove) {
    const resultCloudinary = await cloudinary.uploader.upload(photoPath);
    fs.unlinkSync(photoPath);
    res.json({ result: true, url: resultCloudinary.secure_url });
  } else {
    res.json({ result: false, error: resultMove });
  }

  
});

// router.post('/upload/:token', async (req, res) => {
//   const parent = ParentUser.findOne({token: req.params.token})
//   const aidant = AidantUser.findOne({token: req.params.token})

//   const photoPath = `./tmp/${uniqid()}.jpg`;
//   const resultMove = await req.files.photoFromFront.mv(photoPath);

//   if (!resultMove) {
//     const resultCloudinary = await cloudinary.uploader.upload(photoPath);
//     fs.unlinkSync(photoPath);

//     if (!parent && aidant) {
//       aidant.photo = resultCloudinary.secure_url
//       aidant.save()
//     } else if (!aidant && parent) {
//       parent.photo = resultCloudinary.secure_url
//       parent.save()
//     } else {
//       return res.json({ result: false });
//     }
    
//     res.json({ result: true, url: resultCloudinary.secure_url });
//   } else {
//     res.json({ result: false, error: resultMove });
//   }

  
// });

module.exports = router;