const express = require("express");
const router = express.Router();
var multer = require("multer");
var upload = multer();
var sellProduct = require("./models/sell_model");
var userProduct = require("./models/user_product_model");
var ObjectID = require("mongodb").ObjectID;
const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const mongoClient = require("mongodb").MongoClient;
const mongodbclient = new mongoClient(
  "mongodb+srv://Avengers8:RipunJay8@cluster0.prtvt.mongodb.net/Quick_Finder?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

//uploading a image of product

/*var time;
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    console.log(file);
    time = Date.now();
    cb(null, file.originalname + "_" + time + path.extname(file.originalname));
  },
});
const filefilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb({ message: "Unsupported file format" }, false);
  }
};

var upload = multer({
  storage: storage,
  limit: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: filefilter,
});
*/
//Routing start from here

router.get("/", (req, res) => {
  res.send("Hello world backsell");
});

router.post("/SellNow", (req, res) => {
  var Name = req.body.product_name;
  var Type = req.body.product_type;
  var Status = req.body.status;
  var Price = req.body.price;
  var Description = req.body.description;
  var seller = req.body.seller;
  const files = req.files.uploadFiles;
  console.log(req.files);

  async function run() {
    try {
      console.log("this is running");
      await mongodbclient.connect();
      console.log("connection is established !");
      var database = mongodbclient.db("Quick_Finder");
      var sellProductCollection = database.collection("sellProducts");
      var sellImageUrl = [];

      const promises = files.map(async (file) => {
        if (file.truncated) {
          throw new Error("file size is too big");
        }

        console.log(file);
        var fileName = Date.now() + "_" + file.name;
        await cloudinary.uploader.upload(file.tempFilePath, (result) => {
          console.log("result", result);
          sellImageUrl.push(result.url);
        });
      });

      await Promise.all(promises);

      console.log(sellImageUrl);
      //  create a document to be inserted
      var sellproduct = sellProduct({
        product_images: sellImageUrl,
        product_name: Name,
        product_type: Type,
        status: Status,
        price: Price,
        description: Description,
        sold: false,
        seller: seller,
        buyer: "",
      });

      //   for (var k = 0; k < len; k++) {
      // sellproduct.product_images[k] =
      //   req.files[k].originalname +
      //   "_" +
      //   time +
      //   path.extname(req.files[k].originalname);
      //   }
      console.log(sellproduct);
      var result1 = await sellProductCollection.insertOne(sellproduct);
      console.log(
        `${result1.insertedCount} documents were inserted with the _id: ${result1.insertedId}`
      );
      var ProductId = result1.insertedId.toString();
      console.log(ProductId);
      res.send({ mess: "Product is added to sell ", ProductId: ProductId });
    } catch (err) {
      res.send("Error in  Uploading file");
      console.log(err);
    } finally {
    }
  }
  run().catch(console.dir);
});

router.post("/Products", (req, res, next) => {
  console.log(req.body);
  var seller = req.body.SellerId;
  var product = req.body.ProductId;

  async function run() {
    try {
      await mongodbclient.connect();
      console.log("connection is established !");
      var database = mongodbclient.db("Quick_Finder");
      var productsCollection = database.collection("userProducts");

      var sellerId = new ObjectID(seller);
      var productId = new ObjectID(product);
      console.log(seller);
      console.log(product);
      var productObject = {
        ProductId: productId,
        Time: new Date(),
      };

      var userproduct = userProduct({
        _id: new ObjectID(sellerId),
        sell: productObject,
        buy: null,
      });

      var result2 = await productsCollection.updateOne(
        { _id: sellerId },
        { $addToSet: { sell: productObject } },
        { upsert: true }
      );

      console.log(
        `${result2.insertedCount} documents were inserted with the _id: ${result2.insertedId}`
      );
      res.send({ mess: "product is added" });
    } finally {
    }
  }
  run().catch(console.dir);
});

router.post("/usersellproduct", (req, res) => {
  var id = req.body.userdata.Id;
  console.log(id);

  async function run() {
    try {
      await mongodbclient.connect();
      console.log("connection is established !");
      var database = mongodbclient.db("Quick_Finder");
      var productsCollection = database.collection("userProducts");

      var Id = new ObjectID(id);
      console.log(Id);
      var array = [];

      var result3 = await productsCollection
        .find({ _id: Id })
        .toArray((err, result) => {
          if (err) throw err;
          try {
            for (var i = 0; i < result[0].sell.length; i++) {
              var sell = {};
              sell.BuyerId = result[0].sell[i].BuyerId.toString();
              sell.ProductId = result[0].sell[i].ProductId.toString();
              sell.Sold = result[0].sell[i].Sold.toString();
              sell.Time = result[0].sell[i].Time.toString();
              array.push(sell);
            }
            console.log(array);
            res.send(array);
          } catch (err) {
            res.send({ value: null });
          }
        });
    } finally {
    }
  }
  run().catch(console.dir);
});

router.post("/userbuyproduct", (req, res) => {
  var id = req.body.userdata.Id;
  console.log(id);

  async function run() {
    try {
      await mongodbclient.connect();
      console.log("connection is established !");
      var database = mongodbclient.db("Quick_Finder");
      var productsCollection = database.collection("userProducts");

      var Id = new ObjectID(id);
      console.log(Id);
      var array = [];

      var result3 = await productsCollection
        .find({ _id: Id })
        .toArray((err, result) => {
          if (err) throw err;
          try {
            for (var i = 0; i < result[0].purchased.length; i++) {
              var purchased = {};
              purchased.ProductId = result[0].purchased[i].ProductId.toString();
              purchased.BuyerId = result[0].purchased[i].SellerId.toString();
              purchased.orderId = result[0].purchased[i].orderId.toString();
              purchased.razorpay_orderId = result[0].purchased[
                i
              ].razorpay_orderId.toString();
              purchased.Time = result[0].purchased[i].Time.toString();
              array.push(purchased);
            }
            console.log(array);
            res.send(array);
          } catch (err) {
            res.send({ value: null });
          }
        });
    } finally {
    }
  }
  run().catch(console.dir);
});

router.post("/buy", (req, res) => {
  var buyerID = req.body.buyDetails.buyerID;
  var sellerID = req.body.buyDetails.sellerID;
  var razorpay_orderID = req.body.buyDetails.razorpay_orderId;
  var orderID = req.body.buyDetails.orderId;
  var ProductID = req.body.buyDetails.ProductId;

  async function run() {
    try {
      await mongodbclient.connect();
      console.log("connection is established !");
      var database = mongodbclient.db("Quick_Finder");
      var Buy = database.collection("userProducts");

      console.log(orderID.length);
      let buyDocument = {
        ProductId: new ObjectID(ProductID),
        SellerId: new ObjectID(sellerID),
        orderId: new ObjectID(orderID),
        razorpay_orderId: razorpay_orderID,
        Time: new Date(),
      };
      console.log(buyDocument);
      var BuyerId = new ObjectID(buyerID);

      var result = Buy.updateOne(
        { _id: BuyerId },
        { $addToSet: { purchased: buyDocument } },
        { upsert: true }
      );

      res.send({ mes: "sucessfully buyed" });
    } finally {
    }
  }
  run().catch(console.dir);
});

router.post("/findproduct", (req, res, next) => {
  var id = req.body.userdata.Id;

  async function run() {
    try {
      await mongodbclient.connect();
      console.log("connection is established !");
      var database = mongodbclient.db("Quick_Finder");
      var productsCollection = database.collection("sellProducts");
      var Id = new ObjectID(id);

      var result3 = await productsCollection
        .findOne({ _id: Id })
        .then((result) => {
          res.status(200).json({ item: result });
        })
        .catch((err) => {
          res.status(500).json({ item: null });
        });
    } catch {
      res.status(500).json({ item: null });
    }
  }
  run().catch(console.dir);
});

router.post("/userDetails", (req, res) => {
  var details = req.body;
  async function run() {
    try {
      await mongodbclient.connect();
      console.log("connection is established !");
      var database = mongodbclient.db("Quick_Finder");
      var detailsCollection = database.collection("userDetails");

      var result1 = await detailsCollection.insertOne(details);
      console.log(
        `${result1.insertedCount} documents were inserted with the _id: ${result1.insertedId}`
      );

      res.send({ mess: "user details added" });
    } catch {
      console.log("error in server side");
      res.send({ error: true });
    }
  }
  run().catch(console.dir);
});

router.post("/SellStatus", (req, res) => {
  var ProductID = req.body.ProductId;
  var BuyerID = req.body.BuyerId;
  async function run() {
    try {
      await mongodbclient.connect();
      console.log("connection is established !");
      var database = mongodbclient.db("Quick_Finder");
      var Buy = database.collection("sellProducts");

      var ProductId = new ObjectID(ProductID);
      var BuyerId = new ObjectID(BuyerID);

      var result = Buy.updateOne(
        { _id: ProductId },
        { $set: { sold: true, buyer: BuyerId } }
      );

      res.send({ mes: "sucessfully change sold status" });
    } finally {
    }
  }
  run().catch(console.dir);
});

/*
router.post("/addrequests",(req,res)=>{
  var seller   = req.body.userid.SellerId;
  var buyer    =  req.body.userid.BuyerId;
  var product  = req.body.userid.ProductId;
  console.log(id);
     async function run() {
   try {
     await mongodbclient.connect();
     console.log("connection is established !");
     var database = mongodbclient.db("Quick_Finder");
     var productsCollection = database.collection("userProducts");
     var SellerId = new ObjectID(seller);
     var BuyerId = new ObjectID(buyer);
     var ProductId = new ObjectID(product);
   var result2 = await productsCollection.bulkwrite(
      [
        {
          updateOne :
             {
                 "filter" : {"_id":SellerId},
                 "update" :{$addToSet:{"sell":{$elemMatch:{ProductId:{$elemMatch:{Requests : BuyerId}}}}}},
                 "upsert" :true
            }
        },
        {
          updateOne :
            {
                "filter" : {"_id":BuyerId},
                  "update" :{$addToSet:{"purchased":{$elemMatch:{ProductId:{$elemMatch:{Requests : BuyerId}}}}}},
                  "upsert" :true
          }
        }
     ]
   );
      } finally {
      }
      }
     run().catch(console.dir);
});
*/

// app.use("/backend", router);
// app.listen(5000, () => {
//   console.log("server is running");
// });
module.exports = router;
