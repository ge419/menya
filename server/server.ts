import express, { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import pino from "pino";
import expressPinoLogger from "express-pino-logger";
import { Collection, Db, MongoClient, ObjectId } from "mongodb";
import {
  Cart,
  DraftOrder,
  Order,
  Product,
  Review,
  User,
  possibleIngredients,
} from "./data";
import session from "express-session";
import MongoStore from "connect-mongo";
import { Issuer, Strategy, generators } from "openid-client";
import passport from "passport";
import { Strategy as CustomStrategy } from "passport-custom";
import cors from "cors";
import { gitlab } from "./secrets";

// const HOST = process.env.HOST || "127.0.0.1";
const HOST = process.env.HOST || "localhost";
const OPERATOR_GROUP_ID = "";
const DISABLE_SECURITY = process.env.DISABLE_SECURITY;

const passportStrategies = [
  ...(DISABLE_SECURITY ? ["disable-security"] : []),
  "oidc",
];

// set up Mongo
// const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017";
const mongoUrl = process.env.MONGO_URL || "mongodb://db";
const client = new MongoClient(mongoUrl);
let db: Db;
let orders: Collection;
let products: Collection<Product>;
let reviews: Collection<Review>;
let carts: Collection<Cart>;
let users: Collection<User>;

// set up Express
const app = express();
const port = parseInt(process.env.PORT) || 8193;

// set up body parsing for both JSON and URL encoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// set up Pino logging
const logger = pino({ transport: { target: "pino-pretty" } });
app.use(expressPinoLogger({ logger }));

// set up CORS
app.use(
  cors({
    // origin: "http://127.0.0.1:8192",
    origin: "http://localhost:8192",
    credentials: true,
  })
);

// set up session
app.use(
  session({
    secret: "a just so-so secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },

    store: MongoStore.create({
      // mongoUrl: "mongodb://127.0.0.1:27017",
      mongoUrl: "mongodb://db",
      ttl: 14 * 24 * 60 * 60, // 14 days
    }),
  })
);
declare module "express-session" {
  export interface SessionData {
    credits?: number;
  }
}

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user: any, done) => {
  console.log("serializeUser", user);
  done(null, user);
});
passport.deserializeUser((user: any, done) => {
  console.log("deserializeUser", user);
  done(null, user);
});

app.get(
  "/api/login",
  passport.authenticate("oidc", {
    successReturnToOrRedirect: "/",
  })
);

app.get(
  "/api/login-callback",
  passport.authenticate("oidc", {
    successReturnToOrRedirect: "/",
    failureRedirect: "/",
  })
);

function checkAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    res.sendStatus(401);
    return;
  }

  next();
}

function checkRole(requiredRoles: string[]) {
  return function (req: Request, res: Response, next: NextFunction) {
    const roles = req.user?.roles || [];
    const hasRequiredRole = roles.some((role: string) =>
      requiredRoles.includes(role)
    );
    console.log("hasRequiredRole", hasRequiredRole);
    if (hasRequiredRole) {
      next(); // User has one of the required roles, proceed
    } else {
      console.log("hasRequiredRole2", hasRequiredRole);

      res
        .status(403)
        .json({ message: "Access denied: Insufficient permissions" });
    }
  };
}

// app routes

// Retrieve all products
app.get("/api/all-products", async (req, res) => {
  // res.status(200).json(await products.find({}).toArray());
  res.status(200).json(await products.find({}).toArray());
  console.log("Retrieve all products");
});

// Retrieve product details
app.get("/api/get-product/:productId", async (req, res) => {
  const _id = req.params.productId;
  const product: Partial<Product> | null = await products.findOne({
    _id,
  });
  if (product == null) {
    res.status(404).json({ _id });
    return;
  }
  // product.reviews = await reviews.find({ productId: _id }).toArray();
  res.status(200).json(product);
});

// Query product reviews
app.get("/api/get-reviews/:productId", async (req, res) => {
  const productId = req.params.productId;
  const productReviews = await reviews.find({ productId: productId }).toArray();
  res.status(200).json(productReviews);
});

// get current cart
app.get("/api/user/cart", checkAuthenticated, async (req, res) => {
  const userId = req.user.preferred_username;

  // TODO: validate customerId

  const cart = await carts.findOne({ status: "draft", userId });
  res.status(200).json(cart || { userId, products: [] });
});

// update current cart -- used in ShoppingCart
app.put("/api/user/update-cart", checkAuthenticated, async (req, res) => {
  const { products } = req.body; // Assuming that the body includes a `products` array

  // Validate products array
  if (!Array.isArray(products)) {
    return res.status(400).json({ error: "Invalid products data" });
  }

  // Validate each product in the array (if necessary, ensure they have valid IDs, quantities, etc.)
  for (const product of products) {
    if (
      !product._id ||
      typeof product.quantity !== "number" ||
      product.quantity < 1
    ) {
      return res.status(400).json({ error: "Invalid product data" });
    }
    // Optionally, check if products exist in the database
  }

  try {
    const result = await orders.updateOne(
      {
        userId: req.user.preferred_username, // Using the authenticated user's ID
        state: "draft",
      },
      {
        $set: {
          products: products, // Update the products array in the order
        },
      },
      {
        upsert: true, // Create a new draft order if one doesn't exist
      }
    );

    if (result.matchedCount === 0 && result.upsertedCount === 0) {
      throw new Error(
        "No document was updated and no new document was upserted"
      );
    }

    res
      .status(200)
      .json({ status: "ok", message: "Draft order updated successfully" });
  } catch (error) {
    console.error("Failed to update draft order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// add item to cart
app.put(
  "/api/user/add-cart/:productId",
  checkAuthenticated,
  async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: "Invalid quantity" });
    }

    try {
      const product = await products.findOne({ _id: productId });
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const userId = req.user.preferred_username; // Assuming this is your authenticated user's ID

      const updateResult = await carts.updateOne(
        {
          userId: userId,
          status: "draft",
          "products.product": productId,
        },
        {
          $inc: { "products.$.quantity": quantity },
        },
        { upsert: true }
      );

      if (updateResult.matchedCount === 0) {
        await carts.updateOne(
          { userId: userId, status: "draft" },
          {
            $push: { products: { product: product, quantity: quantity } },
            $setOnInsert: { userId: userId, status: "draft" },
          },
          { upsert: true }
        );
      }

      res.status(200).json({
        status: "ok",
        message: "Product added or updated in cart successfully.",
      });
    } catch (error) {
      console.error("Error adding or updating product in cart:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Retrieve user information
app.get("/api/get-user-info");

app.post("/api/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.get("/api/orders", async (req, res) => {
  res
    .status(200)
    .json(await orders.find({ state: { $ne: "draft" } }).toArray());
});

app.get("/api/user", (req, res) => {
  res.json(req.user || {});
});

app.get("/api/possible-ingredients", checkAuthenticated, (req, res) => {
  res.status(200).json(possibleIngredients);
});

app.get(
  "/api/customer",
  checkAuthenticated,
  checkRole(["customer"]),
  async (req, res) => {
    const _id = req.user.preferred_username;
    logger.info("/api/customer " + _id);
    const customer = {
      _id,
      name: _id,
      orders: await orders
        .find({ customerId: _id, state: { $ne: "draft" } })
        .toArray(),
    };
    res.status(200).json(customer);
  }
);

app.get(
  "/api/operator",
  checkAuthenticated,
  checkRole(["operator"]),
  async (req, res) => {
    const _id = req.user.preferred_username;
    const operator = {
      _id,
      name: _id,
      orders: await orders.find({ operatorId: _id }).toArray(),
    };
    res.status(200).json(operator);
  }
);

app.get("/api/customer/draft-order", checkAuthenticated, async (req, res) => {
  const customerId = req.user.preferred_username;

  // TODO: validate customerId

  const draftOrder = await orders.findOne({ state: "draft", customerId });
  res.status(200).json(draftOrder || { customerId, ingredients: [] });
});

app.put("/api/customer/draft-order", checkAuthenticated, async (req, res) => {
  const order: DraftOrder = req.body;

  // TODO: validate customerId

  const result = await orders.updateOne(
    {
      customerId: req.user.preferred_username,
      state: "draft",
    },
    {
      $set: {
        ingredients: order.ingredients,
      },
    },
    {
      upsert: true,
    }
  );
  res.status(200).json({ status: "ok" });
});

app.post(
  "/api/customer/submit-draft-order",
  checkAuthenticated,
  async (req, res) => {
    const result = await orders.updateOne(
      {
        customerId: req.user.preferred_username,
        state: "draft",
      },
      {
        $set: {
          state: "queued",
        },
      }
    );
    if (result.modifiedCount === 0) {
      res.status(400).json({ error: "no draft order" });
      return;
    }
    res.status(200).json({ status: "ok" });
  }
);

app.put("/api/order/:orderId", checkAuthenticated, async (req, res) => {
  const order: Order = req.body;

  // TODO: validate order object

  const condition: any = {
    _id: new ObjectId(req.params.orderId),
    state: {
      $in: [
        // because PUT is idempotent, ok to call PUT twice in a row with the existing state
        order.state,
      ],
    },
  };
  switch (order.state) {
    case "blending":
      condition.state.$in.push("queued");
      // can only go to blending state if no operator assigned (or is the current user, due to idempotency)
      condition.$or = [
        { operatorId: { $exists: false } },
        { operatorId: order.operatorId },
      ];
      break;
    case "done":
      condition.state.$in.push("blending");
      condition.operatorId = order.operatorId;
      break;
    default:
      // invalid state
      res.status(400).json({ error: "invalid state" });
      return;
  }

  const result = await orders.updateOne(condition, {
    $set: {
      state: order.state,
      operatorId: order.operatorId,
    },
  });

  if (result.matchedCount === 0) {
    res
      .status(400)
      .json({ error: "orderId does not exist or state change not allowed" });
    return;
  }
  res.status(200).json({ status: "ok" });
});

// connect to Mongo
client.connect().then(async () => {
  logger.info("connected successfully to MongoDB");
  db = client.db("test");
  orders = db.collection("orders");
  products = db.collection("products");
  reviews = db.collection("reviews");
  carts = db.collection("carts");
  users = db.collection("users");

  passport.use(
    "disable-security",
    new CustomStrategy((req, done) => {
      if (req.query.key !== DISABLE_SECURITY) {
        console.log(
          "you must supply ?key=" +
            DISABLE_SECURITY +
            " to log in via DISABLE_SECURITY"
        );
        done(null, false);
      } else {
        done(null, {
          preferred_username: req.query.user,
          roles: [].concat(req.query.role),
        });
      }
    })
  );

  {
    const issuer = await Issuer.discover("https://coursework.cs.duke.edu/");
    const client = new issuer.Client(gitlab);

    const params = {
      scope: "openid profile email",
      nonce: generators.nonce(),
      redirect_uri: `http://${HOST}:31002/api/login-callback`,
      state: generators.state(),

      // this forces a fresh login screen every time
      prompt: "login",
    };

    async function verify(tokenSet: any, userInfo: any, done: any) {
      logger.info("oidc " + JSON.stringify(userInfo));

      // const username = userInfo.preferred_username;
      // const email = userInfo.email;

      // try {
      //   // check if there is a registered user with email -- users cannot share same emails
      //   let user = await db.collection("users").findOne({ email });

      //   if (!user) {
      //     const newUser = {
      //       username: username,
      //       name: userInfo.name,
      //       email: email,
      //       address: "",
      //     };
      //     // add new user to db
      //     const { insertedId } = await db
      //       .collection("users")
      //       .insertOne(newUser);
      //     user = { ...newUser, _id: insertedId };

      //     logger.info("New user created: " + username);
      //   }
      //   // if user is found in our db, let the user login -- do nothing

      //   return done(null, userInfo);
      // } catch (error) {
      //   logger.error("Error in creating new user from OIDC in verify");
      //   return done(error);
      // }
      // console.log('userInfo', userInfo)
      // userInfo.roles = userInfo.groups.includes(OPERATOR_GROUP_ID)
      //   ? ["operator"]
      //   : ["customer"];
      return done(null, userInfo);
    }

    passport.use("oidc", new Strategy({ client, params }, verify));
  }

  app.listen(port, () => {
    console.log(`Menya server listening on port ${port}`);
  });
});
