const express = require("express");
const cors = require("cors");
const app = express();
// jwt token require
const jwt = require("jsonwebtoken");
require("dotenv").config();
const port = process.env.PORT || 3000;

//   middle were
app.use(
  cors({
    origin: "http://localhost:5173",
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());

// custom middle Were
const VerificationJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).json({ message: "Unauthorized Access" });
  }
  const token = authorization.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_KEY_TOKEN, (error, decoded) => {
    if (error) {
      return res.status(401).json({ message: "Token not found" });
    }
    req.decoded = decoded;
    next();
  });
};

// verify seller middle were

const verifySeller = async (req, res, next) => {
  const email = req.decoded.email;
  const query = { email: email };
  const user = await userCollection.findOne(query);
  if (user?.role !== "seller") {
    res, send({ message: "Forbidden Access" });
  }
  next();
};

//mongoDb
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.db_user}:${process.env.db_pass}@cluster0.ykv18.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
const userCollection = client.db("gadgetShop").collection("users");
const productCollection = client.db("gadgetShop").collection("products");
async function run() {
  try {
    await client.connect();
    // insert users
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "You Have Already Exist" });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    // get user
    app.get("/user/:email", async (req, res) => {
      const query = { email: req.params.email };
      const user = await userCollection.findOne(query);
      res.send(user);
      // console.log(user);
    });
    //add Products
    app.post(
      "/add-products",
      VerificationJWT,
      verifySeller,
      async (req, res) => {
        const product = req.body;
        const result = await productCollection.insertOne(product);
        res.send(result);
      }
    );
    // get products

    // {
    // to do Name searching
    // to do filter [price]
    // to do filter category
    // to do filter brand
    // }
    app.get("/all-products", async (req, res) => {
      const { title, brand, sort, category } = req.query;
      const query = {};
      //name title category search
      if (title) {
        query.title = { $regex: title, $options: "i" };
      }
      if (brand) {
        query.brand = { $regex: brand, $options: "i" };
      }
      if (title) {
        query.category = { $regex: category, $options: "i" };
      }
      // sort
      const sortOption = sort === "asc" ? 1 : -1;
      const products = await productCollection
        .find(query)
        .sort({ price: sortOption })
        .toArray();
      res.json(products);
    });
    //  jwt token connect
    app.post("/authentication", async (req, res) => {
      const userEmail = req.body;
      const token = jwt.sign(userEmail, process.env.ACCESS_KEY_TOKEN, {
        expiresIn: "10d",
      });
      res.send({ token });
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

//api

app.get("/", (req, res) => {
  res.send("Server Is Running");
});

app.listen(port, () => {
  console.log(`Server Is Running In Port ${port}`);
});
