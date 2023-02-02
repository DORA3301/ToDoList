const express = require("express");
const bodyParser = require("body-parser");
//const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set( "strictQuery", false );
mongoose.connect( "mongodb+srv://edis:test123@cluster0.cimntyd.mongodb.net/todolistDB", () => {
    console.log(`Connected to MongoDB`)
});

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your To Do List",
});

const item2 = new Item({
  name: "Click the + button to add a new item.",
});

const item3 = new Item({
  name: "Click on checkbox to delete an item.",
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);



// const items = ["Item 1", "Item 2", "Item 3"]; // items deklarisemo sa const jer push metoda kod JS radi na const deklarisanim varijablama

app.get("/", function(req, res){

  Item.find({}, function(err, foundItems){
    
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if (err) {
            console.log(err);
        } else {
            console.log("Saved all items to todolistDB");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {kindOfDay:"This is a Default ToDo List.", newListItems: foundItems});
    }
});
  //const day = date.getDate();
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.button;

  const item = new Item({
    name: itemName
  });

  if (listName === "This is a Default ToDo List."){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName); 
    });
  }
  
  
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "This is a Default ToDo List."){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (err){
        console.log(err);
      } else {
        console.log("Item removed");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }

 
});

app.get("/:dynamicRoute", function(req, res){
  const dynamicRoute = _.capitalize(req.params.dynamicRoute);

  List.findOne({name: dynamicRoute}, function(err, foundList){
    if (!err){
      if (!foundList){
        //Create a new list
        const list = new List({
          name: dynamicRoute,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + dynamicRoute);
      } else {
        //Show an existing list
        res.render("list", {kindOfDay: foundList.name, newListItems: foundList.items});
      }
    }
  });


});


app.listen(process.env.PORT || 3000, function(){
  console.log("Server is running on port 3000");
})
