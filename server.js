const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/ecommerceDB")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));


// --------- Schemas ---------

const variantSchema = new mongoose.Schema({
  sku: String,
  color: String,
  price: Number,
  stock: Number
});

const reviewSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  rating: Number,
  comment: String
});

const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  variants: [variantSchema],
  reviews: [reviewSchema],
  avgRating: Number
});

const Product = mongoose.model("Product", productSchema);


// --------- Routes ---------

app.get("/", (req, res) => {
 res.send("E-commerce Catalog API Running");
});

app.get("/add-product", async (req, res) => {

 const product = await Product.create({
  name: "Premium Headphones",
  category: "Electronics",

  variants:[
   {sku:"HP-BL-001", color:"Black", price:199.99, stock:15},
   {sku:"HP-WH-001", color:"White", price:209.99, stock:8}
  ],

  reviews:[
   {userId:new mongoose.Types.ObjectId(), rating:5, comment:"Excellent sound quality"}
  ],

  avgRating:5
 });

 res.send(product);

});


// Aggregation 1 - Low Stock

app.get("/low-stock", async (req,res)=>{

 const result = await Product.aggregate([
  {$unwind:"$variants"},
  {$match:{"variants.stock":{$lt:10}}}
 ]);

 res.send(result);

});


// Aggregation 2 - Category Rating

app.get("/category-rating", async (req,res)=>{

 const result = await Product.aggregate([
  {$group:{_id:"$category",avgCategoryRating:{$avg:"$avgRating"}}}
 ]);

 res.send(result);

});


// --------- Start Server ---------

app.listen(3000, () => {
 console.log("Server running on port 3000");
});