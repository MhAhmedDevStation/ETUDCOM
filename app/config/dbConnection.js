const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { User } = require("../../models/user");
// Connecting to the database
mongoose
  .connect(process.env.CONNECTION_STRING)

  .then(() => {
    console.log("Database connection is ready");
  })
  .catch((err) => {
    console.log("Could not connect to MongoDB.");
    process.exit();
  });
  User.insertMany([
    { 
      firstName:"admin", 
      
      lastName:"admin",
      userName:"admin admin",
      cin:"1",
      email:"isitcom.rnu@gmail.com",
      passwordHash:bcrypt.hashSync(process.env.ADMIN_PWD, 10),
      phone:"99097727",
      role:"admin",
      isActive:true
    }
  ]).then(function(){
    console.log("admin has been initiated")  
  }).catch(function(error){
    console.log("admin exists")      
  });

// Configuring the database
mongoose.Promise = global.Promise;
  