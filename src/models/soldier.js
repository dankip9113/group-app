const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const Group = require("./group");

const soldierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  army_number: {
    type: Number,
    unuqie: true,
    require: true,
  },
  identity_number: {
    type: Number,
    unique: true,
    required: true,
  },
  birth_date: {
    type: Date,
    required: true,
  },
  recruitment_date: {
    type: Date,
    required: true,
  },
  role: {
    type: String,
    required: true,
    validate(value) {
      if (!value.includes("soldier") && !value.includes("leader")) {
        throw new Error("must be leader or member");
      }
    },
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Group",
  },
  password: {
    type: String,
    trim: true,
    required: true,
    validate(value) {
      if (value.toLowerCase().includes("password")) {
        throw new Error("dont use password as password");
      } else if (value.lenght < 7) {
        throw new Error("password must be with lenght 7 minimum");
      }
    },
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

soldierSchema.pre("save", async function () {
  const soldier = this;

  if (soldier.isModified("password")) {
    soldier.password = await bcrypt.hash(soldier.password, 8);
  }
  if (soldier.isModified("group")) {
    const groupExist = await Group.exists({ _id: soldier.group });
    if (!groupExist) {
      throw new Error("group undifined");
    }
  }
});

soldierSchema.methods.getPublicProfile = function () {
  const soldier = this;
  const soldierObject = soldier.toObject();
  delete soldierObject.password;
  delete soldierObject.tokens;

  return soldierObject;
};

soldierSchema.methods.generateAuthToken = async function () {
  const soldier = this;
  const token = jwt.sign({ _id: soldier._id.toString() }, "soldier");

  soldier.tokens = soldier.tokens.concat({ token });

  await soldier.save();
  return token;
};

soldierSchema.statics.findSoldiersWithLowPazam = async (limit, page) => {
  if (page <= 0) {
    throw new Error("page must be 1 or more");
  }
  const skip = (page - 1) * limit;
  const oneYearAgo = moment().subtract(1, "years").toDate();
  const soldiers = await Soldier.find(
    { recruitment_date: { $gt: oneYearAgo } },
    {},
    {
      limit: limit,
      skip: skip,
    },
  );

  return soldiers;
};

soldierSchema.statics.findByCredetials = async (army_number, password) => {
  const soldier = await Soldier.findOne({ army_number });
  if (!soldier) {
    throw new Error("Incorrect army number");
  }

  const isMatch = await bcrypt.compare(password, soldier.password);

  if (!isMatch) {
    throw new Error("Incorrect password");
  }
  return soldier;
};

const Soldier = mongoose.model("Soldier", soldierSchema);

module.exports = Soldier;
