const express = require("express");
const controller = require("./controllers/user.controller");
const router = express.Router();

// for setting 2FA authentication
router.get("/2FA/setup", controller.setup);
// for verfy 2FA authentication
router.get("/2FA/verify", controller.verify);
// for remove 2FA authentication
router.get("/2FA/remove", controller.remove);
// for creating user
router.post("/register", controller.register);
const routes = (app) => {
  app.get("/", (req, res) => {
    console.log("Hello from TOTP app");
    res.json("Hello from TOTP app");
  });
  app.use("/api", router);
};

module.exports = routes;
