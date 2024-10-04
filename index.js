const express = require("express");
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

app.use(cors());
app.use(express.json()); // To parse JSON bodies

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4fvtstz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const port = process.env.PORT || 5000;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  connectTimeoutMS: 60000,  // Increase the timeout
  socketTimeoutMS: 60000,
});

async function run() {
  try {
    await client.connect();  // Connect only once during startup

    const houseCollection = client.db("AirBub").collection("houses");
 
    // Filtered search using query parameters (e.g., ?cat=gooms)
    app.get("/house", async (req, res) => {
      try {
        const { cat } = req.headers;  // Use query params for filtering
        const {rang,sort}=req.query;

        
        let result;
        if (cat) {
          result = await houseCollection.find({ cat }).toArray();
        } 
        else if(rang && sort){
          result= await houseCollection.find({price:{$lte:parseInt(rang)}}).sort({price: parseInt(sort)}).toArray()
          console.log(result);
          
        }
        
        else {
          result = await houseCollection.find().toArray();
        }

        res.status(200).json(result);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch houses", message: error.message });
      }
    });

    // Ping to confirm successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  } finally {
    // Optionally handle app closing to disconnect MongoDB
    process.on('SIGINT', async () => {
      await client.close();
      console.log("MongoDB connection closed.");
      process.exit(0);
    });
  }
}

run().catch(console.dir);

// Default route
app.get("/", (req, res) => {
  res.send("Server is working!");
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
