import { MongoClient } from 'mongodb'
import { Operator, Customer } from './data'

// Connection URL
const url = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017'
const client = new MongoClient(url)

const operators: Operator[] = [
  {
    _id: "jim",
    name: "Jim",
  },
  {
    _id: "mary",
    name: "Mary",
  },
]

const customers: Customer[] = [
  {
    _id: "alice",
    name: "Alice",
  },
  {
    _id: "bob",
    name: "Bob",
  },
]

async function main() {
  await client.connect()
  console.log('Connected successfully to MongoDB')

  const db = client.db("test")

  // set up unique index for upsert -- to make sure a customer cannot have more than one draft order
  db.collection("orders").createIndex(
    { customerId: 1 }, 
    { unique: true, partialFilterExpression: { state: "draft" } }
  )

  // add data
  console.log("inserting customers", await db.collection("customers").insertMany(customers as any))
  console.log("inserting operators", await db.collection("operators").insertMany(operators as any))

  process.exit(0)
}

main()
