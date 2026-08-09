const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Rider = require("../models/Rider");
const Driver = require("../models/Driver");
const Admin = require("../models/Admin");
const dbFallback = require("../dbFallback");

const allowedRoles = ["driver", "rider", "admin"];

const findUserByEmail = async (email) => {
  const cleanEmail = email ? email.trim().toLowerCase() : "";

  if (dbFallback.isEnabled()) {
    return dbFallback.findUserByEmail(cleanEmail);
  }

  return (
    (await Rider.findOne({ email: cleanEmail }).select("+password")) ||
    (await Driver.findOne({ email: cleanEmail }).select("+password")) ||
    (await Admin.findOne({ email: cleanEmail }).select("+password"))
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

    if (!email || !password || !full_name) {
      return res.status(400).json({
        message: "Full name, email, and password are required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanFullName = full_name.trim();
    const selectedRole = allowedRoles.includes(role) ? role : "rider";

    const existingUser = await findUserByEmail(cleanEmail);

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      full_name: cleanFullName,
      email: cleanEmail,
      password: hashedPassword,
      role: selectedRole,
    };

    if (selectedRole === "driver") {
      if (!phone || !vehicleType || !vehicleNumber || !licenseNumber) {
        return res.status(400).json({
          message:
            "All driver details (phone, vehicle type, vehicle number, license number) are required.",
        });
      }

      userData.phone = phone.trim();
      userData.vehicleType = vehicleType.trim();
      userData.vehicleNumber = vehicleNumber.trim().toUpperCase();
      userData.licenseNumber = licenseNumber.trim().toUpperCase();
    }

    let user;

    if (dbFallback.isEnabled()) {
      user = await dbFallback.createUser(userData);
    } else {
      let Model = Rider;
      if (selectedRole === "driver") Model = Driver;
      if (selectedRole === "admin") Model = Admin;

      user = await Model.create(userData);
    }

    res.status(201).json({
      success: true,
      message: `${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} registered successfully`,
      user: sanitizeUser(user),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "An error occurred during registration",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const selectedRole = allowedRoles.includes(role) ? role : "rider";

    const user = await findUserByEmail(cleanEmail);

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
        full_name: user.full_name || user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        college: user.college,
        gender: user.gender,
        emergencyContact: user.emergencyContact,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "An error occurred during login" });
  }
};
