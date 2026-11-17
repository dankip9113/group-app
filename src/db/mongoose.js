const mongoose = require("mongoose");
require('dotenv').config()
const CONNECT_URL = process.env.CONNECT_URL;

mongoose.connect(CONNECT_URL);
