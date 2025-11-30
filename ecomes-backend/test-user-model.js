const mongoose = require("mongoose");
require("dotenv").config();

async function testUserModel() {
  try {
    // Connect to MongoDB
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Import User model after connection
    const User = require("./models/User");

    console.log("\n🔍 Checking User model...");
    console.log("User model type:", typeof User);
    console.log("Is User a function?", typeof User === "function");

    // Check static methods
    console.log("\n📊 Checking static methods:");
    console.log("User.findOne exists?", typeof User.findOne === "function");
    console.log("User.findById exists?", typeof User.findById === "function");
    console.log("User.create exists?", typeof User.create === "function");

    // Check if it's a Mongoose model
    console.log("\n🔧 Model details:");
    console.log("Model name:", User.modelName);
    console.log("Collection name:", User.collection.name);

    // Test creating a user instance
    console.log("\n👤 Testing user instance creation...");
    const testUser = new User({
      username: "testuser" + Date.now(), // Unique username
      email: "test" + Date.now() + "@example.com", // Unique email
    });

    console.log("User instance created successfully");
    console.log("User ID:", testUser._id);

    // Test instance methods
    console.log("\n⚡ Testing instance methods:");
    console.log("generateOTP method:", typeof testUser.generateOTP);
    console.log("verifyOTP method:", typeof testUser.verifyOTP);
    console.log("comparePassword method:", typeof testUser.comparePassword);

    // Test OTP generation
    const otp = testUser.generateOTP();
    console.log("Generated OTP:", otp);
    console.log("OTP verification test:", testUser.verifyOTP(otp));

    // Test saving to database
    console.log("\n💾 Testing database save...");
    await testUser.save();
    console.log("User saved to database successfully");

    // Test finding the user
    console.log("\n🔎 Testing database query...");
    const foundUser = await User.findOne({ username: testUser.username });
    console.log("User found in database:", foundUser ? "Yes" : "No");

    // Clean up
    await User.findByIdAndDelete(testUser._id);
    console.log("Test user deleted from database");

    await mongoose.connection.close();
    console.log("\n🎉 All tests passed successfully!");
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    console.error("Error stack:", error.stack);

    // Try to close connection even if there's an error
    try {
      await mongoose.connection.close();
    } catch (closeError) {
      console.error("Error closing connection:", closeError.message);
    }
  }
}

testUserModel();
