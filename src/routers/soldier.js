const express = require("express");
const auth = require("../middleware/auth");
const Soldier = require("../models/soldier");
const Group = require("../models/group");

const router = express.Router();

router.post("", auth, async (req, res) => {
  if (!req.soldier.role === "leader") {
    res.status(400).send("you have no permition");
  }
  const soldier = new Soldier(req.body);
  try {
    await soldier.save();
    const token = await soldier.generateAuthToken();
    res.status(201).send({ soldier, token });
  } catch (e) {
    res.status(500).send(e);
  }
});
router.post("/login", auth, async (req, res) => {
  try {
    const soldier = await soldier.findByCredentials(
      req.body.army_number,
      req.body.password,
    );
    const token = await soldier.generateAuthToken();
    res.send({ soldier: soldier.getPublicProfile() }, token);
  } catch (e) {
    res.status(400).send(e);
  }
});
router.post("/logout", auth, async (req, res) => {
  try {
    req.soldier.tokens = req.soldier.tokens.filter((token) => {
      return token.token != req.token;
    });
    await req.soldier.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});
router.post("/logoutAll", auth, async (req, res) => {
  try {
    req.soldier.tokens = [];
    await req.soldier.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.get("", auth, async (req, res) => {
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
router.get("/me", auth, async (req, res) => {
  res.send(req.soldier);
});
router.get("/names_of_soldiers", async (req, res) => {
  try {
    const soldiers = await Soldier.find({
      role: { $ne: "leader" },
    });
    if (soldiers.length === 0) {
      return res.status(404).send("no soldiers");
    }
    res.send(soldiers);
  } catch (e) {
    res.status(500).send(e);
  }
});
router.get("/leaders", auth, async (req, res) => {
  try {
    const leaders = await Group.aggregate()
      .match({ leader: { $ne: null } })
      .lookup({
        from: "soldiers",
        localField: "_id",
        foreignField: "group",
        as: "members",
      })
      .addFields({
        memberCount: { $size: "$members" },
      })
      .sort({ memberCount: -1 })
      .lookup({
        from: "soldiers",
        localField: "leader",
        foreignField: "_id",
        as: "leaderInfo",
      })
      .unwind("$leaderInfo")
      .replaceRoot({
        $mergeObjects: [
          "$leaderInfo",
          { memberCount: "$memberCount", groupName: "$name" },
        ],
      });
    res.send(leaders);
  } catch (e) {
    res.status(500).send();
  }
});
router.get("/pazam", auth, async (req, res) => {
  const sort = {};
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }
  try {
    const soldiers = await Soldier.find(
      {},
      {},
      {
        sort,
      },
    );
    if (soldiers.length === 0) {
      res.status(404).send("no soldiers");
    }
    res.send(soldiers);
  } catch (e) {
    res.status(500).send();
  }
});
router.get("/pazam/childrens", auth, async (req, res) => {
  try {
    const soldiers = await Soldier.findSoldiersWithLowPazam(
      parseInt(req.query.limit),
      parseInt(req.query.page),
    );
    if (soldiers.length === 0) {
      return res.send("No childrens!!");
    }
    res.send(soldiers);
  } catch (e) {
    res.status(500).send();
  }
});
router.get("/:id", auth, async (req, res) => {
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
router.get("/:id/group", auth, async (req, res) => {
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
router.patch("/:id", auth, async (req, res) => {
  if (!req.soldier.role === "leader") {
    return res.status(400).send("you have no permition");
  }
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "name",
    "army_number",
    "identity_number",
    "birth_date",
    "group",
  ];
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
router.delete("/:id", auth, async (req, res) => {
  if (!req.soldier.role === "leader") {
    return res.status(400).send("you have no permition");
  }
  try {
    const soldier = await Soldier.findByIdAndDelete(req.params.id);
    if (!soldier) {
      return res.status(404).send("soldier undifined");
    }
    const group = await soldier.populate("group");
    if (group) {
      group.members = group.members.filter((member) => member != soldier._id);
      await group.save();
    }
    res.send(soldier);
  } catch (e) {
    res.status(500).send();
  }
});
module.exports = router;
