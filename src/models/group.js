const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    unique: true,
    ref: "Soldier",
  },
  members: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Soldier",
      },
    ],
    unique: true,
    validate(array) {
      if (new Set(array).size !== array.length) {
        throw new Error("members duplicated");
      }
    },
  },
});

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
