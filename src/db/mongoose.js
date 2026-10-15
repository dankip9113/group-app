const mongoose = require("mongoose");

const CONNECT_URL = "mongodb://localhost:27017/task-manager-api";

mongoose.connect(CONNECT_URL);
