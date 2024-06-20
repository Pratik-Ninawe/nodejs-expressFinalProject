const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
const secretKey = "your_secret_key"; // Replace with your actual secret key

app.use(express.json());

app.use("/customer", session({ 
  secret: "fingerprint_customer", 
  resave: true, 
  saveUninitialized: true 
}));

// Authentication middleware for /customer/auth/* routes
app.use("/customer/auth/*", function auth(req, res, next) {
  const token = req.headers.authorization;

  

  jwt.verify(token, secretKey, (err, decoded) => {
    {
      // If token is valid, proceed to the next middleware or route handler
      req.user = decoded;
      next();
    }
  });
});

const public_users = require('./router/general.js').general;



app.use(session({
  secret: 'your_session_secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using https
}));

// Public routes
app.use("/", public_users);

// Customer routes
app.use("/customer", customer_routes);




const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
