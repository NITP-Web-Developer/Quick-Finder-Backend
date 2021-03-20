const express = require("express");
const cors = require("cors");
const router = express.Router();
const multer = require("multer");
var path = require("path");
var ObjectID = require("mongodb").ObjectID;

const mongoClient = require("mongodb").MongoClient;
const mongodbclient = new mongoClient(
  "mongodb+srv://Avengers8:RipunJay8@cluster0.prtvt.mongodb.net/Quick_Finder?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const Razorpay = require("razorpay");
const { customAlphabet } = require("nanoid");
const alphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-";

var razorpay = new Razorpay({
  key_id: "rzp_test_BPnc5xUi3lPSmk",
  key_secret: "ys8KrrnKFdgyaLX6GCIojvK3",
});

router.post("/razorpay", async (req, res) => {
  console.log(req.body);
  const payment_capture = 1;
  const amount = req.body.price;
  const currency = "INR";
  const type = req.body.type;
  const buyerId = req.body.buyerId;

  if (amount == undefined || type == undefined) {
    res.status(400).json({
      error: true,
      message: "Missing some parameters",
    });
    return;
  }

  try {
    if (req.body.type === 0) {
      // cash payment
      const nanoid = customAlphabet(alphabet, 21);
      const order_id = "order_" + nanoid();
      res.status(200).json({
        error: false,
        id: order_id,
      });
    } else if (req.body.type === 1) {
      console.log("online payment");
      // online payment
      const amount = req.body.price;
      const options = {
        amount: amount * 100,
        currency,
        payment_capture,
      };
      const response = await razorpay.orders.create(options);
      console.log(response);
      res.status(200).json({
        error: false,
        id: response.id,
        currency: response.currency,
        amount: response.amount / 100,
      });
    } else {
      res.status(400).json({
        error: true,
        message: "type value missing",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: true,
      message: error.message,
    });
  }
});

router.post("/order", (req, res, next) => {
  console.log(req.body);

  async function run() {
    try {
      await mongodbclient.connect();
      console.log("connection is established !");
      var database = mongodbclient.db("Quick_Finder");
      var orderCollection = database.collection("orders");

      var order = {
        ...req.body,
      };
      console.log(order);
      var result2 = await orderCollection.insertOne(order);

      console.log(
        `${result2.insertedCount} documents were inserted with the _id: ${result2.insertedId}`
      );
      var id = result2.insertedId;
      res.send({ insertid: id });
    } finally {
    }
  }
  run().catch(console.dir);
});

module.exports = router;
