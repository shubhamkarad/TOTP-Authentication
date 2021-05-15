const { User } = require("../models");
const speakEasy = require("speakeasy");
const QrCode = require("qrcode");
// Create a User with mail and password
const register = async (req, res) => {
  console.log("create User");
  const { email, password } = req.body;
  try {
    const user = new User({
      email: email,
      password: password,
    });
    await user.save();
    res.status(200).send({ message: "User added successfully!" });
  } catch (err) {
    console.log(err);
    res.status(400).send({ message: "Some error is there, try again!" });
  }
};
// enable the 2FA for the requested user
const setup = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email: email });

    if (!user) {
      res.status(404).send({ message: "No user found with that email" });
    } else if (user.isTwoFactorSet) {
      res
        .status(400)
        .send({ message: "2FA is already configured on this account" });
    } else {
      //If the user is present
      if (user.email === email && user.password === password) {
        //Generating unique secret for user
        const secret = speakEasy.generateSecret({ name: "Shubham TOTP" });
        console.log(secret);

        //Saving user secret to DB
        user.isTwoFactorSet = true;
        user.secret = secret;
        await user.save();

        QrCode.toDataURL(secret.otpauth_url, (err, data) => {
          if (err) {
            res
              .status(400)
              .send({ message: "Error occurred while creating qr code" });
          } else {
            res.status(200).send(`
                        <h1>2-Factor Authentication Setup</h1>
                        <p>Scan the below Qr code in your Authenticator app</p>
                        <img src=${data} alt="Qr code not available"/>
                        <br>
                        <p>or add manually by using this code: ${secret.base32}</p>
                        `);
          }
        });
      } else {
        user.isTwoFactorSet = false;
        user.secret = undefined;
        await user.save();
        res
          .status(401)
          .send({ message: "Invalid credentials, please try again" });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(400).send({ message: "Bad request, Try again" });
  }
};
const verify = async (req, res) => {
  const { email, userToken } = req.body;
  try {
    let user = await User.findOne({ email: email });

    if (!user) {
      res.status(404).send({ message: "No user found with that email" });
    } else {
      const verified = speakEasy.totp.verify({
        secret: user.secret.base32,
        encoding: "base32",
        token: userToken,
      });
      res.status(200).send({ isAuthSuccess: verified });
    }
  } catch (err) {
    console.log("error occured", err);
    res.status(401).send({ message: "Bad request, try again" });
  }
};

const remove = async (req, res) => {
  const { email, userToken } = req.body;
  try {
    let user = await User.findOne({ email: email });

    if (!user) {
      res.status(404).send({ message: "No user found with that email" });
    } else {
      const verified = speakEasy.totp.verify({
        secret: user.secret.base32,
        encoding: "base32",
        token: userToken,
      });
      if (verified) {
        user.secret = undefined;
        user.isTwoFactorSet = false;
        await user.save();
        res.status(200).send({ message: "2 FA turned off succesfully" });
      } else {
        res.status(401).send({ message: "Incorrect OTP, please try again!!" });
      }
    }
  } catch (err) {
    console.log("error occured", err);
    res.status(401).send({ message: "Bad request, try again" });
  }
};

module.exports = {
  register,
  setup,
  verify,
  remove,
};
