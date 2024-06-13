const express = require("express");
const path = require("path");
const app = express();

// Define routes to send HTML files

app.use("/css", express.static(__dirname + "/css"));

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.get("/contact", (req, res) => {
  res.sendFile(path.join(__dirname, "contact.html"));
});

app.get("/login/slotAvailability", (req, res) => {
  res.sendFile(path.join(__dirname, "slotAvailability.html"));
});

app.get("/login/slotAvailability/profile", (req, res) => {
  res.sendFile(path.join(__dirname, "profile.html"));
});

app.get("/login/slotAvailability/reservation", (req, res) => {
  res.sendFile(path.join(__dirname, "reservation.html"));
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).send("<h1>404 Not Found</h1>");
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
