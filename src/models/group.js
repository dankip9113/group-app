const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

groupSchema.virtual("members", {
  ref: "Soldier",
  localField: "_id",
  foreignField: "group",
});

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
