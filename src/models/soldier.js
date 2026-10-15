const mongoose = require("mongoose");

const soldierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    age: {
      type: String,
      required: true,
      validate(value) {
        if (value < 18) {
          throw new Error("and Jane you early");
        }
      },
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

soldierSchema.virtual("group", {
  ref: "Group",
  localField: "_id",
  foreignField: "members",
  justOne: true,
});

const Soldier = mongoose.model("Soldier", soldierSchema);

module.exports = Soldier;
