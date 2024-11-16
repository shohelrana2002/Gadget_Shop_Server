const express = require("express");
const cors = require("cors");
const app = express();
// jwt token require
const jwt = require("jsonwebtoken");
require("dotenv").config();
const port = process.env.PORT || 3000;

//   middle were
app.use(cors());
app.use(express.json());

//mongoDb

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.db_user}:${process.env.db_pass}@cluster0.ykv18.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

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
    // Ensures that the client will close when you finish/error
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
