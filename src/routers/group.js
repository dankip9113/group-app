const express = require("express");
const Group = require("../models/group");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("", auth, async (req, res) => {
  const group = new Group(req.body);
  try {
    await group.save();
    res.status(201).send(group);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("", auth, async (req, res) => {
  try {
    const groups = await Group.find({});
    if (!groups) {
      return res.status(404).send("groups not found");
    }
    res.send(group);
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).send("group undifined");
    }
    res.send(group);
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/:id/leader", auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).send("group undifined");
    }
    await group.populate("leader");
    res.send(group.leader.name);
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/:id/membersNumber", auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate("members");
    if (!group) {
      return res.status(404).send("group undifined");
    }
    res.send("number of members - " + group.members.length);
  } catch (e) {
    return res.status(500).send();
  }
});

router.get("/:id/members", auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("members", "name -_id")
      .lean();
    if (!group) {
      return res.status(404).send("group undifined");
    }
    res.send({ members: group.members });
  } catch (e) {
    res.status(500).send();
  }
});

router.patch("/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "leader"];
  const isValidOperations = updates.every((update) =>
    allowedUpdates.includes(update),
  );
  if (!isValidOperations) {
    return res.status(400).send("not valid params");
  }
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).send("group not found");
    }
    updates.forEach((update) => (group[update] = req.body[update]));
    await group.save();
    res.send(group);
  } catch (e) {
    return res.status(500).send();
  }
});
router.delete("/:id", auth, async (req, res) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id).populate(
      "members",
    );
    if (!group) {
      return res.status(404).send("group undifined");
    }

    const members = group.members.forEach(async (member) => {
      ((member.group = undefined), await member.save());
    });

    res.send({
      group: group,
      members: members,
    });
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
