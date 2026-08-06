const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Rider = require("../models/Rider");
const Driver = require("../models/Driver");
const Admin = require("../models/Admin");
const dbFallback = require("../dbFallback");

const allowedRoles = ["driver", "rider", "admin"];

const findUserByEmail = async (email) => {
  if (dbFallback.isEnabled()) {
    return dbFallback.findUserByEmail(email);
  }

  return (
    (await Rider.findOne({ email }).select("+password")) ||
    (await Driver.findOne({ email }).select("+password")) ||
    (await Admin.findOne({ email }).select("+password"))
  );
};

const sanitizeUser = (user) => {
  if (!user) return null;

  const safeUser = {
    ...((typeof user.toObject === "function" && user.toObject()) || user),
    ...(user._doc || {}),
  };

  delete safeUser.password;
  return safeUser;
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const selectedRole = allowedRoles.includes(role) ? role : "rider";

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let user;

    if (dbFallback.isEnabled()) {
      user = await dbFallback.createUser({
        name,
        email,
        password: hashedPassword,
        role: selectedRole,
      });
    } else {
      let Model = Rider;
      if (selectedRole === "driver") Model = Driver;
      else if (selectedRole === "admin") Model = Admin;

      user = await Model.create({
        name,
        email,
        password: hashedPassword,
        role: selectedRole,
      });
    }

    res.status(201).json({
      message: `${selectedRole} registered successfully`,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const selectedRole = allowedRoles.includes(role) ? role : "rider"; // use enums

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    if (user.role !== selectedRole) {
      return res.status(400).json({
        message: "Role does not match",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
