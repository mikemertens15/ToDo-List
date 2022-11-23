//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-mike:Test123@cluster0.fonaal4.mongodb.net/todolistDB");

const itemSchema = {
  name: String
}

const listSchema = {
  name: String,
  items: [itemSchema]
};

const Item = mongoose.model("Item", itemSchema);

const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "item 1"
});

const item2 = new Item({
  name: "item 2"
});

const item3 = new Item({
  name: "Item 3"
});

const defaultItems = [item1, item2, item3];

app.get("/", function(req, res) {

  Item.find({}, (err, results) => {

    if (results.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: results});
    }

  });

});

app.get("/:listName", function(req,res){
  const listName = _.capitalize(req.params.listName);

  List.findOne({name: listName}, (err, results) => {
    if (!err) {
      if (!results) {
        const list = new List({
          name: listName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + listName);
      } else {
        res.render("list", {listTitle: results.name, newListItems: results.items});
      }
    }
  });

  
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }

  

  
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, (err) => {
      if (!err) {
        console.log("success");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, (err, foundList) => {
      if (!err) {
        res.redirect("/" + listName)
      }
    });
  }

  
});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
