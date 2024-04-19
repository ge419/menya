import { MongoClient } from "mongodb";
import { Operator, Customer, Product, Review, Order, Tag } from "./data";

// Connection URL
const url = process.env.MONGO_URL || "mongodb://127.0.0.1:27017";
// const url = process.env.MONGO_URL || "mongodb://db";
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
    price: 5.99,
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
  {
    _id: "2",
    name: "Jin Ramen Spicy",
    price: 4.99,
    origin: "Korea",
    company: "Ottogi",
    avgRating: 4.6,
    description: "Spicy ramen famous in Korea",
    tags: [
      {
        word: "spicy",
      },
      {
        word: "korean",
      },
      {
        word: "sweet",
      },
    ],
  },
  {
    _id: "3",
    name: "Jin Ramen Mild",
    price: 4.99,
    origin: "Korea",
    company: "Ottogi",
    avgRating: 4.3,
    description: "Non-spicy ramen from Korea",
    tags: [
      {
        word: "mild",
      },
      {
        word: "korean",
      },
      {
        word: "sweet",
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
  db.collection("carts").createIndex(
    { userId: 1 },
    { unique: true, partialFilterExpression: { status: "draft" } }
  );

  process.exit(0);
}

main();
