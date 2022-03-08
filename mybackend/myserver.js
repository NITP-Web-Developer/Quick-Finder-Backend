var express = require("express");
var cors = require("cors");
var router = express.Router();

// app.use(cors());

// app.use(
//   bodyParser.urlencoded({
//     extended: true,
//   })
// );

// app.use(bodyParser.json());

const MongoClient = require("mongodb").MongoClient;
const { ObjectId } = require("mongodb");
const { isEmptyBindingElement } = require("typescript");
const url =
  "mongodb+srv://Avengers8:RipunJay8@cluster0.prtvt.mongodb.net/Quick_Finder?retryWrites=true&w=majority";

const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const dbName = "Quick_Finder";
router.post("/filter", function (req, res) {
  const request = req;
  async function run() {
    await client.connect();
    // console.log("Connected correctly to server");
    const db = client.db(dbName);
    var array = [];
    array = await db.collection("sellProducts").distinct("product_type");
    res.json({ mes: array });
  }
  run().catch(console.dir);
});
router.post("/getData", function (req, res) {
  const request = req;
  var search_id = req.body.obj.search_id;
  async function run() {
    await client.connect();
    // console.log("Connected correctly to server");
    const db = client.db(dbName);
    var array=[];
    array = await db.collection("sellProducts").findOne({_id:ObjectId(search_id)});
    // console.log(array);
    res.json({ mes: array });
  }
  run().catch(console.dir);
});
router.post("/getUserData", function (req, res) {
  const request = req;
  var user = req.body.obj.username;
  async function run() {
    await client.connect();
    // console.log("Connected correctly to server");
    const db = client.db(dbName);
    var array=[];
    array = await db.collection("users").findOne({_id:ObjectId(user)});
    // console.log(array);
    res.json({ mes: array });
  }
  run().catch(console.dir);
});
function filterByValue(array, string) {
  return array.filter((o) =>
    Object.keys(o).some((k) =>
      o[k].toLowerCase().includes(string.toLowerCase())
    )
  );
}
function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
  
      // Generate random number
      var j = Math.floor(Math.random() * (i + 1));
                  
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
  }
      
  return array;
}
router.post("/getDetails", function (req, res) {
  
  var search_input = req.body.obj.search_input;
  console.log("Ya its running ");
  const request = req;
  async function run() {
    await client.connect();
    // console.log("Connected correctly to server");
    const db = client.db(dbName);
    var array = [];
    db.collection("sellProducts")
    .find()
    .toArray(function (err, result) {
        if (err) throw err;
        result= shuffleArray(result)
        for (var i = 0; i < result.length; i++) {
          console.log(result[i].product_name);
          var obj = {};
          obj.product_name = result[i].product_name;
          obj.product_type = result[i].product_type;
          obj.status = result[i].status;
          obj.price = result[i].price;
          obj.description = result[i].description;
          obj.product_images = result[i].product_images[0];
          obj.product_id = ObjectId(result[i]._id).toString();
          obj.seller_id = ObjectId(result[i].seller).toString();
          // //   var seller_id= new ObjectId(result[i].seller);
          //   var sell_name="";
          //   var sell_address="";
          //   db.collection("Users").find({"_id":seller_id}).toArray(function(err, result2) {
          //   if (err) throw err;
          //   for(var j=0;j<1;j++){
          //   sell_name=result2[j].name;
          //   sell_address=result2[j].address;
          //   }
          //   obj.seller_name=sell_name;
          //   obj.seller_address=sell_address;
          // });
          array.push(obj);
        }
        var anoarray = array;
        anoarray = anoarray.concat(array);
        res.json({ mes: anoarray });
      });
  }
  run().catch(console.dir);
});

// app.listen(3005, () => {
//   console.log("Server is running ");
// });
module.exports = router;
