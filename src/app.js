const express = require("express");
require("./db/mongoose");
const soldierRouter = require("./routers/soldier");
const groupRouter = require("./routers/group");

const app = express();
const port = 3000;

app.use(express.json());
app.use("/soldiers",soldierRouter);
app.use("/groups",groupRouter);

app.listen(port, () => {
  console.log("server started on - localhost:" + port);
});
