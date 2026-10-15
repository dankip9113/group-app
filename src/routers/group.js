const express = require("express");
const Group = require("../models/group");

const router = express.Router();

router.post("/groups", async (req, res) => {
  const group = new Group(req.body);
  try {
    await group.save();
    res.status(201).send(group);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/groups", async (req, res) => {
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

router.get("/groups/:id", async (req, res) => {
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

router.get("/groups/:id/leader", async (req, res) => {
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

router.get("/groups/:id/membersNumber", async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).send("group undifined");
    }
    res.send("number of members - " + group.members.length);
  } catch (e) {
    return res.status(500).send();
  }
});

router.get("/groups/:id/members", async (req, res) => {
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

router.patch("/groups/:id", async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "leader", "members"];
  const isValidOperations = updates.every((update) =>
    allowedUpdates.includes(update),
  );
  if (!isValidOperations) {
    return res.status(404).send("not valid params");
  }
  try {
    const group = await Group.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
    });
    if (!group) {
      return res.status(404).send("group not found");
    }
    res.send(group);
  } catch (e) {
    return res.status(500).send();
  }
});
router.delete("/groups/:id", async (req, res) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id, { new: true });
    if (!group) {
      return res.status(404).send("group undifined");
    }
    res.send(group);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
