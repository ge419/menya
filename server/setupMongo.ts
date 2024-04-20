import { MongoClient } from "mongodb";
import { Cart, Product, Review } from "./data";

// Connection URL
const url = process.env.MONGO_URL || "mongodb://127.0.0.1:27017";
// const url = process.env.MONGO_URL || "mongodb://db";
const client = new MongoClient(url);

const reviews: Review[] = [
  {
    _id: "review1",
    userId: "Jim",
    productId: "1",
    rating: 5,
    buyAgain: true,
    text: "amazing ramen!",
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
    _id: "review2",
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
    description: "Spicy ramen ranked #1 in Korea",
    // tags: [
    //   {
    //     word: "spicy",
    //   },
    //   {
    //     word: "korean",
    //   },
    // ],
  },
  {
    _id: "2",
    name: "Jin Ramen Spicy",
    price: 4.99,
    origin: "Korea",
    company: "Ottogi",
    description: "Spicy ramen famous in Korea",
    // tags: [
    //   {
    //     word: "spicy",
    //   },
    //   {
    //     word: "korean",
    //   },
    //   {
    //     word: "sweet",
    //   },
    // ],
  },
  {
    _id: "3",
    name: "Jin Ramen Mild",
    price: 4.99,
    origin: "Korea",
    company: "Ottogi",
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

const orders: Cart[] = [
  {
    _id: "123",
    userId: "test",
    products: [
      {
        product: {
          name: "Test",
          price: 10,
          _id: "test",
          origin: "test",
          company: "test",
          description: "test",
        },
        quantity: 2,
      },
    ],
    status: "paid",
    totalCost: 10,
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
  console.log(
    "inserting test order",
    await db.collection("carts").insertMany(orders as any)
  );

  process.exit(0);
}

main();
