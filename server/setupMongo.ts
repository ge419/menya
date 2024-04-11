import { MongoClient, ObjectId } from 'mongodb'

// Connection URL
const url = 'mongodb://localhost:27017'
const client = new MongoClient(url)

async function main() {
  await client.connect()
  console.log('Connected successfully to MongoDB')

  const db = client.db("test")

  // set up unique index for upsert -- to make sure a customer cannot have more than one draft order
  db.collection("orders").createIndex(
    { customerId: 1 }, 
    { unique: true, partialFilterExpression: { state: "draft" } }
  )

  process.exit(0)
}

main()
