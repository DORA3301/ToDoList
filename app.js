const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const items = ["Item 1", "Item 2", "Item 3"]; // items deklarisemo sa const jer push metoda kod JS radi na const deklarisanim varijablama

app.get("/", function(req, res){
  const day = date.getDate();
  res.render("list", {kindOfDay: day, newListItems: items});

});

app.post("/", function(req, res){
  item = req.body.newItem;
  items.push(item);
  res.redirect("/");
});

app.listen(process.env.PORT || 3000, function(){
  console.log("Server is running on port 3000");
});
