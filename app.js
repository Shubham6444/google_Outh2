


require("dotenv").config();
const express = require("express");
const { google } = require("googleapis");

const app = express();

// OAuth client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

app.get("/auth/google", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  });

  res.redirect(url);
});

app.get("/oauth/callback", async (req, res) => {
  try {
    const code = req.query.code;

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user profile
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const userInfo = await oauth2.userinfo.get();

    // Send user data
    res.json({
      success: true,
      user: userInfo.data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
});

app.listen(2000, () => {
  console.log("Server running on http://localhost:2000");
});
