const jwt = require("jsonwebtoken");
const Soldier = require("../models/soldier");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer", "");
    const decoded = jwt.verify(token, "soldier");
    const soldier = await Soldier.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!soldier) {
      throw new Error();
    }
    req.token = token;
    req.soldier = soldier;
    next();
  } catch (e) {
    res.status(401).send({ error: "please authenticate" });
  }
};

module.exports = auth;
