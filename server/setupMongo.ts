import { MongoClient } from "mongodb";
import { Operator, Customer, Product, Review, Order, Tag } from "./data";

// Connection URL
const url = process.env.MONGO_URL || "mongodb://127.0.0.1:27017";
const client = new MongoClient(url);

const reviews: Review[] = [
  {
    _id: "jim",
    userId: "Jim",
    productId: "1",
    rating: 5,
    buyAgain: true,
    text: "amazing ramen!",
    tags: [
      {
        word: "sweet",
      },
    ],
  },
  {
    _id: "mary",
    userId: "Mary",
    productId: "1",
    rating: 4,
    buyAgain: true,
    text: "nice ramen!",
    tags: [
      {
        word: "spicy",
      },
    ],
  },
];

const products: Product[] = [
  {
    _id: "1",
    name: "Shin Ramen",
    origin: "Korea",
    company: "Nongshim",
    avgRating: 4.5,
    description: "Spicy ramen ranked #1 in Korea",
    tags: [
      {
        word: "spicy",
      },
      {
        word: "korean",
      },
    ],
  },
];

async function main() {
  await client.connect();
  console.log("Connected successfully to MongoDB");

  const db = client.db("test");

  // const reviewsDB = client.db("reviews");
  // const productsDB = client.db("products");

  // const productsCollection = db.collection("products");
  // // Indexing products by name or another relevant field
  // await productsCollection.createIndex({ name: 1 });

  // set up unique index for upsert -- to make sure a customer cannot have more than one draft order
  // db.collection("orders").createIndex(
  //   { customerId: 1 },
  //   { unique: true, partialFilterExpression: { state: "draft" } }
  // );

  // add data
  console.log(
    "inserting reviews",
    await db.collection("reviews").insertMany(reviews as any)
  );
  console.log(
    "inserting products",
    await db.collection("products").insertMany(products as any)
  );

  process.exit(0);
}

main();
