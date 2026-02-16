require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectMongo = require("./config/mongo");

connectMongo();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./mongo/routes/authRoutes"));
app.use("/api/products", require("./mongo/routes/productRoutes"));
app.use("/api/orders", require("./mongo/routes/orderRoutes"));
app.use("/api/payments", require("./mongo/routes/paymentRoutes"));
app.use("/api/webhooks", require("./mongo/routes/webhookRoutes"));
app.use("/api/subscriptions", require("./postgres/routes/subscriptionRoutes"));

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`),
);
