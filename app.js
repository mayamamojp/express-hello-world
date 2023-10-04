const express = require("express");
const bodyParser = require('body-parser');

const _ = require("lodash");

const sqlite = require("sqlite3");

// const db = new sqlite.Database("./test.db");

// db.serialize(() => {
//   db.run("DROP TABLE IF EXISTS recipes");
//   db.run(`
//   CREATE TABLE IF NOT EXISTS recipes (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     title TEXT NOT NULL,
//     making_time TEXT NOT NULL,
//     serves TEXT NOT NULL,
//     ingredients TEXT NOT NULL,
//     cost INTEGER NOT NULL,
//     created_at TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
//     updated_at TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime'))
//   )
//   `);
// });
// db.close();

initializeDb = () => {
  const db = new sqlite.Database("./test.db");

  db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      making_time TEXT NOT NULL,
      serves TEXT NOT NULL,
      ingredients TEXT NOT NULL,
      cost INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
      updated_at TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime'))
    )
    `);
  });

  return db;
}

insertRow = async (recipe) => {
  const db = initializeDb();

  db.serialize(() => {
    db.run(`
    INSERT INTO recipes (title, making_time, serves, ingredients, cost, created_at, updated_at)
    VALUES(
      '${recipe.title}', 
      '${recipe.making_time}', 
      '${recipe.serves}', 
      '${recipe.ingredients}', 
      '${recipe.cost}', 
      '${(new Date()).toLocaleString().replaceAll("/", "-")}', 
      '${(new Date()).toLocaleString().replaceAll("/", "-")}' 
    )
    `);
  });

  return new Promise((resolve, reject) =>{  
    db.get(
      "SELECT last_insert_rowid() as inserted", 
      (err, row) => {
        // console.log("insert result:", err, row);
        db.close();
        if (err) return reject(err);
        return resolve(row.inserted);
      }
    );
  });
}

deleteRow = async (id) => {
  const db = initializeDb();

  return new Promise((resolve, reject) =>{  
    db.run(
      `DELETE FROM recipes WHERE id = ${id}`, 
      err => {
        db.close();
        if (err) return reject(err);
        return resolve();
      }
    );
  });
}

updateRow = async (recipe) => {
  const db = initializeDb();

  return new Promise((resolve, reject) =>{  
    db.run(`
    UPDATE recipes SET
      title = '${recipe.title}', 
      making_time = '${recipe.making_time}', 
      serves = '${recipe.serves}', 
      ingredients = '${recipe.ingredients}', 
      cost = '${recipe.cost}', 
      created_at = '${(new Date()).toLocaleString().replaceAll("/", "-")}', 
      updated_at = '${(new Date()).toLocaleString().replaceAll("/", "-")}' 
    WHERE id = ${recipe.id}
    `,
    err => {
      db.close();
      if (err) return reject(err);
      return resolve();
    }
    );
  });
}

getRow = async (id) => {
  const db = initializeDb();

  return new Promise((resolve, reject) =>{  
    db.get(
      `SELECT * FROM recipes WHERE id = ${id}`, 
      (err, row) => {
        db.close();
        if (err) return reject(err);
        return resolve(row);
      }
    );
  });
}

getAllRows = async () => {
  const db = initializeDb();

  return new Promise((resolve, reject) =>{  
    db.all(
      `SELECT * FROM recipes`, 
      (err, row) => {
        // console.log(err, row);
        db.close();
        if (err) return reject(err);
        return resolve(row);
      }
    );
  });
}

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

const essentials = ["title", "making_time", "serves", "ingredients", "cost"];

app.post("/recipes", async (req, res) => {
  const existsEssentials = _.difference(essentials, Object.keys(req.body)).length == 0;
  if (existsEssentials) {
    const id = await insertRow(req.body);
    const recipe = await getRow(id);
    res.type("json").send(
      {
        "message": "Recipe successfully created!",
        "recipe": [recipe]
      }      
    );
  } else {
    res.type("json").send(
      {
        "message": "Recipe creation failed!",
        "required": "title, making_time, serves, ingredients, cost"
      }      
    )
  }
});

app.get("/recipes", async (req, res) => {
  const recipes = await getAllRows();
  res.type('json').send(recipes);
});

app.get("/recipes/:id", async (req, res) => {
  const recipe = await getRow(req.params.id);
  res.type('json').send(recipe);
});

app.patch("/recipes/:id", async (req, res) => {
  let recipe = req.body;
  recipe.id = req.params.id;
  await updateRow(recipe);
  res.type("json").send(
    {
      "message": "Recipe successfully updated!",
      "recipe": [recipe]
    }      
  );
});

app.delete("/recipes/:id", async (req, res) => {
  const recipe = await getRow(req.params.id);
  if (!recipe) {
    res.type("json").send({ "message":"No Recipe found" });
  } else {
    await deleteRow(req.params.id);
    res.type("json").send({  "message": "Recipe successfully removed!" });
  }
});


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

