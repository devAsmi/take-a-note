const express = require("express");
const path = require("path");
const fs = require("fs");
const util = require("util");
const crypto = require("crypto");
const app = express();
const port = 3333;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "/index.html"));
});

app.get("/notes", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "/notes.html"));
});

// Promise version of fs.readFile
const readFromFile = util.promisify(fs.readFile);

// create a /api/notes route which will return back all the notes from db
app.get("/api/notes", function (req, res) {
  // read db.json file
  console.log("Getting notes from db");
  readFromFile("./db/db.json").then((data) => res.json(JSON.parse(data)));
});

// create a POST /api/notes route which will create a new note and save it in db.json
app.post("/api/notes", function (req, res) {
  const { title, text } = req.body;

  if (title && text) {
    const note = {
      title: title,
      text: text,
      id: crypto.randomUUID(),
    };

    // save the note to db
    const file = "./db/db.json";
    fs.readFile(file, "utf8", (err, data) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
      } else {
        const notesData = JSON.parse(data);
        notesData.push(note);

        fs.writeFile(file, JSON.stringify(notesData, null, 2), (err) => {
          if (err) {
            console.error(err);
            res.sendStatus(500);
          }
          console.info(`Data written to db.json`);
          res.send(note);
        });
      }
    });
  } else {
    res.status(400).send("Error in creating note!");
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
