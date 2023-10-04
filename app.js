const express = require("express");
const app = express();
const port = process.env.PORT || 3001;

app.post("/recipes", (req, res) => res.type('json').send(dummy));
app.get("/recipes", (req, res) => res.type('json').send([dummy, dummy]));
app.get("/recipe/:id", (req, res) => res.type('json').send([dummy, dummy]));
app.patch("/recipe/:id", (req, res) => res.type('json').send([dummy, dummy]));
app.delete("/recipe/:id", (req, res) => res.type('json').send([dummy, dummy]));

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

const dummy = {
  "message": "Recipe successfully created!",
  "recipe": [
    {
      "id": 3,
      "title": "トマトスープ",
      "making_time": "15分",
      "serves": "5人",
      "ingredients": "玉ねぎ, トマト, スパイス, 水",
      "cost": "450",
      "created_at": "2016-01-12 14:10:12",
      "updated_at": "2016-01-12 14:10:12"
    }
  ]
};
