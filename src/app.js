const express = require("express");
require("./db/mongoose");
const SoldierRouter = require("./routers/soldier");
const GroupRouter = require("./routers/group");

const app = express();
const port = 3000;

app.use(express.json());
app.use(SoldierRouter);
app.use(GroupRouter);

app.listen(port, () => {
  console.log("server started on - localhost:" + port);
});
