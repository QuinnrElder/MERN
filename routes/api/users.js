const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");

const { check, validationResult } = require("express-validator");

const User = require("../../Models/user");

//@route    POST api/users
//@desc     Register User
//@access   Public

router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      //VERIFY USER
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "USER ALREADY EXISTS" }] });
      }

      //VERIFY GRAVATAR
      const avatar = gravatar.url(email, { s: "200", r: "pg", d: "mm" });
      user = new User({ name, email, avatar, password });

      // ENCRYPT THE PASSWORD
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      // RETURN JSON.WEBTOKEN

      res.send("USER REGISTERED");
    } catch (err) {
      console.error(err.message);
      res.status(500).send("SERVER ERROR");
    }
  }
);

module.exports = router;