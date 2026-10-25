const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const soldierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    army_number:{
      type:Number,
      unuqie:true,
      require:true 
    },
    identity_number:{
      type:Number,
      unique:true,
      required:true
    },
    birth_date:{
      type:String,
      required:true
    },
    group:{
      type: mongoose.Schema.Types.ObjectId,
      ref:"Group"
    }
  },
);

const Soldier = mongoose.model("Soldier", soldierSchema);

module.exports = Soldier;
