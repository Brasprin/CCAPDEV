const express = require("express");
const app = express();
const { engine } = require("express-handlebars");
const path = require("path");

// Define the view engine and path to views directory
app.engine(
  "hbs",
  engine({
    extname: "hbs",
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views/layouts"),
    partialsDir: path.join(__dirname, "views/partials"),
  })
);

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

app.get("/contact", (req, res) => {
  res.render("contact", {
    title: "Contact Information",
    logo: "Contact Information",
    layout: "main",
    style: "contact.css",
  });
});

app.get("/login", (req, res) => {
  res.render("login", {
    title: "Login",
    logo: "Login",
    layout: "main",
    style: "loginstyle.css",
    javascript: "loginscript.js",
  });
});

app.get("/reserveSlot", (req, res) => {
  res.render("reserveSlot", {
    title: "Reserve Slot",
    logo: "Reserve Slot",
    layout: "main",
    style: "reserveSlot.css",
    javascript: "reserveSlot.js",
  });
});

app.get("/profile", (req, res) => {
  res.render("profile", {
    title: "Profile",
    logo: "Profile",
    layout: "main",
    style: "profile.css",
    javascript: "profile.js",
  });
});

app.get("/editReservation", (req, res) => {
  res.render("editReservation", {
    title: "Edit Reservation",
    logo: "Edit Reservation",
    layout: "main",
    style: "editReservation.css",
    javascript: "editReservation.js",
  });
});

app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
