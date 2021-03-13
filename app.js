/** BizTime express application. */


const express = require("express");
const companyRoutes = require("./routes/companies/companies");
const invoicesRoutes = require("./routes/invoices/invoices");
const industriesRoutes = require("./routes/industries/industries");
const ExpressError = require("./expressError")

const app = express();

app.use(express.json());
app.use("/companies", companyRoutes);
app.use("/invoices", invoicesRoutes);
app.use("/industries", industriesRoutes);

/** 404 handler */

app.use((req, res, next) => {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});

module.exports = app;
