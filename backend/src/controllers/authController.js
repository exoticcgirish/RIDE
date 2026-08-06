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
    const {
      full_name,
      email,
      password,
      role,

      phone,
      vehicleType,
      vehicleNumber,
      licenseNumber,
    } = req.body;

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
        full_name,
        email,
        password: hashedPassword,
        role: selectedRole,
        phone,
        vehicleType,
        vehicleNumber,
        licenseNumber,
      });
    } else {
      let Model = Rider;

      if (selectedRole === "driver") {
        Model = Driver;
      } else if (selectedRole === "admin") {
        Model = Admin;
      }

      const data = {
        full_name,
        email,
        password: hashedPassword,
        role: selectedRole,
      };

      if (selectedRole === "driver") {
        data.phone = phone;
        data.vehicleType = vehicleType;
        data.vehicleNumber = vehicleNumber;
        data.licenseNumber = licenseNumber;
      }

      user = await Model.create(data);
    }

    res.status(201).json({
      success: true,
      message: `${selectedRole} registered successfully`,
      user: sanitizeUser(user),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
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
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        college: user.college,
        gender: user.gender,
        emergencyContact: user.emergencyContact,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
