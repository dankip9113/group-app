const express = require("express");
const Soldier = require("../models/soldier");

const router = express.Router();

router.post("", async (req, res) => {
  const soldier = new Soldier(req.body);

  try {
    await soldier.save();
    res.status(201).send(soldier);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("", async (req, res) => {
  try {
    const soldiers = await Soldier.find({});    
    if (!soldiers) {
      return res.status(404).send("we have no soldiers");
    }
    res.send(soldiers);
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/:id", async (req, res) => {
  try {
    const soldier = await Soldier.findById(req.params.id);
    if (!soldier) {
      return res.status(404).send("soldier undifined");
    }
    res.send(soldier);
  } catch (e) {
    res.status(500).send();
  }
});
router.get("/:id/group", async (req, res) => {
  try {
    const soldier = await Soldier.findById(req.params.id).populate("group");
    if (!soldier) {
      return res.status(404).send("soldier undifined");
    }

    res.send(soldier.group.name);
  } catch (e) {
    res.status(500).send(e);
  }
});
router.patch("/:id", async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "army_number","identity_number","birth_date","group"];
  const isValidOperations = updates.every((update) =>
    allowedUpdates.includes(update),
  );
  if (!isValidOperations) {
    return res.status(400).send("not valid params");
  }
  try {
    const soldier = await Soldier.findById(req.params.id);
    updates.forEach((update) => (soldier[update] = req.body[update]));
    
    if (!soldier) {
      return res.status(404).send("soldier undifined");
    }
    await soldier.save();
    res.send(soldier);
  } catch (e) {
    res.status(500).send("error in update");
  }
});
router.delete("/:id", async (req, res) => {
  try {
    const soldier = await Soldier.findByIdAndDelete(req.params.id);
    if (!soldier) {
      return res.status(404).send("soldier undifined");
    }
    const group = await soldier.populate("group")
    if(group){
      group.members = group.members.filter(member => member != soldier._id)
      await group.save()
    }
    res.send(soldier);
  } catch (e) {
    res.status(500).send();
  }
});
module.exports = router;
