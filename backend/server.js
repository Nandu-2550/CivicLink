const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "civiclink_jwt_secret_2026";
const AUTHORITY_ACCESS_CODE = process.env.AUTHORITY_ACCESS_CODE || "CIVICLINK_AUTH_2026";
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://gowthamkr89851_db_user:AtSe5ZmqqdRqM5fF@cluster0.ercrmin.mongodb.net/?appName=Cluster0";
const LOCAL_MONGO_URI = process.env.LOCAL_MONGO_URI || "mongodb://127.0.0.1:27017/civiclink";

const CATEGORIES = [
  "Police",
  "School/University",
  "Municipality",
  "Consumer/Cyber",
  "Human Rights",
  "Govt Dept",
  "Traffic",
  "Pollution",
];

const STATUS_STAGES = ["Pending", "Acknowledged", "Investigating", "In Progress", "Resolved"];

app.use(cors());
app.use(express.json({ limit: "10mb" }));

async function connectToDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected (Atlas).");
    return;
  } catch (atlasError) {
    console.error("MongoDB Atlas connection failed:", atlasError.message);
  }

  try {
    await mongoose.connect(LOCAL_MONGO_URI);
    console.log("MongoDB connected (Local).");
  } catch (localError) {
    console.error("Local MongoDB connection failed:", localError.message);
    console.error("Database is unavailable. Start MongoDB or fix Atlas connection.");
  }
}

connectToDatabase();

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    contactNumber: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    address: { type: String, required: true, trim: true },
    role: { type: String, enum: ["citizen", "authority-admin"], default: "citizen" },
    lastLogin: { type: Date, default: Date.now },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const complaintSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, enum: CATEGORIES, required: true },
    media: {
      name: String,
      mimeType: String,
      dataUrl: String,
    },
    location: {
      latitude: Number,
      longitude: Number,
      address: String,
    },
    status: { type: String, enum: STATUS_STAGES, default: "Pending" },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
const Complaint = mongoose.model("Complaint", complaintSchema);

const CATEGORY_KEYWORDS = {
  Police: [
    "police",
    "theft",
    "stolen",
    "robbery",
    "crime",
    "criminal",
    "assault",
    "harassment",
    "molestation",
    "extortion",
    "threat",
    "violence",
    "fir",
  ],
  "School/University": [
    "school",
    "college",
    "university",
    "campus",
    "hostel",
    "mess",
    "canteen",
    "student hostel",
    "hostel food",
    "mess food",
    "bad food",
    "food poisoning",
    "teacher",
    "faculty",
    "student",
    "exam",
    "admission",
    "scholarship",
    "classroom",
    "education",
  ],
  Municipality: [
    "municipality",
    "municipal",
    "garbage",
    "waste collection",
    "drain",
    "drainage",
    "sewage",
    "streetlight",
    "street light",
    "pothole",
    "water supply",
    "sanitation",
    "public toilet",
    "road repair",
  ],
  "Consumer/Cyber": [
    "consumer",
    "refund",
    "replacement",
    "billing",
    "overcharge",
    "cyber",
    "hacked",
    "hack",
    "online fraud",
    "upi",
    "phishing",
    "otp scam",
    "scam",
    "ecommerce",
  ],
  "Human Rights": [
    "human rights",
    "discrimination",
    "abuse",
    "child labor",
    "domestic violence",
    "trafficking",
    "rights violation",
    "custodial",
    "bonded labor",
  ],
  "Govt Dept": [
    "government office",
    "govt",
    "department",
    "certificate",
    "document",
    "delay",
    "license",
    "permit",
    "ration card",
    "aadhar",
    "pension",
    "land record",
    "revenue office",
  ],
  Traffic: [
    "traffic",
    "signal",
    "red light",
    "parking",
    "accident",
    "rash driving",
    "speeding",
    "wrong side",
    "jam",
    "highway",
    "helmet",
    "seatbelt",
    "drunk driving",
  ],
  Pollution: [
    "pollution",
    "air quality",
    "smoke",
    "dust",
    "noise",
    "industrial waste",
    "contamination",
    "factory",
    "chemical",
    "effluent",
    "burning waste",
    "river pollution",
    "water pollution",
  ],
};

function categorizeComplaint(description) {
  const text = String(description || "").toLowerCase();
  const scoreByCategory = {};

  for (const category of CATEGORIES) {
    scoreByCategory[category] = 0;
  }

  const normalizedText = text.replace(/[^a-z0-9\s]/g, " ");
  const tokens = normalizedText.split(/\s+/).filter(Boolean);
  const tokenSet = new Set(tokens);

  // Student welfare fast-path: ensure hostel/mess food complaints route to School/University.
  const hasStudentContext =
    tokenSet.has("hostel") ||
    tokenSet.has("student") ||
    tokenSet.has("campus") ||
    normalizedText.includes("school") ||
    normalizedText.includes("college") ||
    normalizedText.includes("university") ||
    tokenSet.has("mess") ||
    tokenSet.has("canteen");
  const hasFoodIssue =
    tokenSet.has("food") ||
    normalizedText.includes("food poisoning") ||
    normalizedText.includes("stale food") ||
    normalizedText.includes("bad food") ||
    normalizedText.includes("hygiene");

  if (hasStudentContext && hasFoodIssue) {
    return "School/University";
  }

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      const normalizedKeyword = keyword.toLowerCase().trim();

      if (normalizedKeyword.includes(" ")) {
        if (normalizedText.includes(normalizedKeyword)) {
          scoreByCategory[category] += 3;
        }
        continue;
      }

      if (tokenSet.has(normalizedKeyword)) {
        scoreByCategory[category] += 2;
        continue;
      }

      const hasPrefixMatch = tokens.some(
        (token) =>
          token.startsWith(normalizedKeyword) ||
          normalizedKeyword.startsWith(token)
      );
      if (hasPrefixMatch) {
        scoreByCategory[category] += 1;
      }
    }
  }

  let bestCategory = "Govt Dept";
  let bestScore = 0;
  for (const category of CATEGORIES) {
    if (scoreByCategory[category] > bestScore) {
      bestCategory = category;
      bestScore = scoreByCategory[category];
    }
  }

  return bestCategory;
}

function getDepartmentAliases(department) {
  const aliases = {
    Police: ["Police", "Law & Order"],
    "School/University": ["School/University", "Education"],
    Municipality: ["Municipality", "Municipal"],
    "Consumer/Cyber": ["Consumer/Cyber", "Consumer", "Cyber"],
    "Human Rights": ["Human Rights", "Rights"],
    "Govt Dept": ["Govt Dept", "Government Department", "Government"],
    Traffic: ["Traffic", "Road Safety"],
    Pollution: ["Pollution", "Environment"],
  };

  return aliases[department] || [department];
}

function signCitizenToken(user) {
  return jwt.sign({ role: user.role || "citizen", userId: user._id.toString() }, JWT_SECRET, { expiresIn: "7d" });
}

function signAuthorityToken(department) {
  return jwt.sign({ role: "authority", department }, JWT_SECRET, { expiresIn: "7d" });
}

function authRequired(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return res.status(401).json({ message: "Authorization token missing." });
  }

  try {
    req.auth = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

function requireCitizen(req, res, next) {
  if (req.auth?.role !== "citizen") {
    return res.status(403).json({ message: "Citizen access only." });
  }

  return next();
}

function requireAuthority(req, res, next) {
  if (req.auth?.role !== "authority") {
    return res.status(403).json({ message: "Authority access only." });
  }

  return next();
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, app: "CivicLink" });
});

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, username, email, contactNumber, address, password, role } = req.body;

    if (!name || !username || !email || !contactNumber || !address || !password) {
      return res
        .status(400)
        .json({ message: "Name, username, email, contact number, address and password are required." });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const normalizedUsername = String(username).toLowerCase().trim();

    const existing = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });
    if (existing) {
      return res.status(409).json({ message: "Account already exists for this email or username." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      username: normalizedUsername,
      email: normalizedEmail,
      contactNumber,
      address,
      role: role === "authority-admin" ? "authority-admin" : "citizen",
      password: hashedPassword,
      lastLogin: new Date(),
    });
    const token = signCitizenToken(user);

    return res.status(201).json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        username: user.username,
        role: user.role,
        contactNumber: user.contactNumber,
        email: user.email,
        address: user.address,
        registeredAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Signup failed.", error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { identifier, password, role } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "Email/username and password are required." });
    }

    const normalizedIdentifier = String(identifier).toLowerCase().trim();
    const requestedRole = role === "authority-admin" ? "authority-admin" : "citizen";

    const roleFilter =
      requestedRole === "citizen"
        ? { $or: [{ role: "citizen" }, { role: { $exists: false } }] }
        : { role: requestedRole };

    const user = await User.findOne({
      $and: [{ $or: [{ email: normalizedIdentifier }, { username: normalizedIdentifier }] }, roleFilter],
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = signCitizenToken(user);
    return res.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        username: user.username,
        role: user.role,
        contactNumber: user.contactNumber,
        email: user.email,
        address: user.address,
        registeredAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed.", error: error.message });
  }
});

app.get("/api/auth/profile", authRequired, async (req, res) => {
  try {
    if (!req.auth?.userId) {
      return res.status(400).json({ message: "Profile unavailable for this account type." });
    }

    const user = await User.findById(req.auth.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const complaintHistory = await Complaint.find({ userId: user._id }).sort({ createdAt: -1 });
    return res.json({
      user,
      complaintHistory,
      dateOfRegistration: user.createdAt,
      lastLogin: user.lastLogin,
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch profile details.", error: error.message });
  }
});

app.post("/api/auth/authority-login", (req, res) => {
  try {
    const { department, accessCode } = req.body;

    if (!department || !accessCode) {
      return res.status(400).json({ message: "Department and access code are required." });
    }

    if (!CATEGORIES.includes(department)) {
      return res.status(400).json({ message: "Invalid department selected." });
    }

    if (accessCode !== AUTHORITY_ACCESS_CODE) {
      return res.status(401).json({ message: "Invalid authority credentials." });
    }

    const token = signAuthorityToken(department);
    return res.json({ token, department });
  } catch (error) {
    return res.status(500).json({ message: "Authority login failed.", error: error.message });
  }
});

app.post("/api/complaints", authRequired, requireCitizen, async (req, res) => {
  try {
    const { name, title, description, location, media } = req.body;

    if (!name || !title || !description) {
      return res.status(400).json({ message: "Name, title and description are required." });
    }

    const mediaPayload =
      media && media.dataUrl && media.mimeType
        ? { name: media.name || "upload", mimeType: media.mimeType, dataUrl: media.dataUrl }
        : undefined;

    const complaint = await Complaint.create({
      userId: req.auth.userId,
      name,
      title,
      description,
      location,
      media: mediaPayload,
      category: categorizeComplaint(`${title} ${description}`),
    });

    return res.status(201).json(complaint);
  } catch (error) {
    return res.status(500).json({ message: "Complaint creation failed.", error: error.message });
  }
});

app.get("/api/complaints/mine", authRequired, requireCitizen, async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.auth.userId }).sort({ createdAt: -1 });
    return res.json(complaints);
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch citizen complaints.", error: error.message });
  }
});

// Backward compatibility for older frontend calls.
app.get("/api/complaints/user/:userId", authRequired, requireCitizen, async (req, res) => {
  try {
    if (String(req.params.userId) !== String(req.auth.userId)) {
      return res.status(403).json({ message: "You can only access your own complaints." });
    }
    const complaints = await Complaint.find({ userId: req.auth.userId }).sort({ createdAt: -1 });
    return res.json(complaints);
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch citizen complaints.", error: error.message });
  }
});

app.get("/api/complaints/department", authRequired, requireAuthority, async (req, res) => {
  try {
    const categoryAliases = getDepartmentAliases(req.auth.department);
    const complaints = await Complaint.find({ category: { $in: categoryAliases } }).sort({ createdAt: -1 });
    return res.json(complaints);
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch department complaints.", error: error.message });
  }
});

app.put("/api/complaints/:id/status", authRequired, requireAuthority, async (req, res) => {
  try {
    const { status } = req.body;

    if (!STATUS_STAGES.includes(status)) {
      return res.status(400).json({ message: "Invalid complaint status." });
    }

    const complaint = await Complaint.findOneAndUpdate(
      { _id: req.params.id, category: req.auth.department },
      { status },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found in your department." });
    }

    return res.json(complaint);
  } catch (error) {
    return res.status(500).json({ message: "Unable to update complaint status.", error: error.message });
  }
});

app.use((error, _req, res, next) => {
  if (error?.type === "entity.too.large") {
    return res.status(413).json({ message: "Uploaded image is too large. Please choose a smaller image." });
  }

  return next(error);
});

app.listen(PORT, () => {
  console.log(`CivicLink backend listening on port ${PORT}`);
});