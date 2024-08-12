import express from "express"
import cors from 'cors'
import connection from './connection.js'
import user from "./models/userSchema.js"
import jwt from "jsonwebtoken";
import { config } from "dotenv";
import bcrypt from "bcrypt"; 
import authentication from "./auth/authenticat.js";

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}));
app.use(cors({orgin: "http://localhost:3000" })); 

config() 
let port = process.env.PORT


//-----------------------LOGIN----------------------//
app.post("/login", async(req, res) => { 

    const { username, password } = req.body;
  
    try {
      const userTryingToLogin = await user.findOne({ username });
          console.log(userTryingToLogin)
      if (userTryingToLogin) {
        const match = await bcrypt.compare(password, userTryingToLogin.password);
  
        if (match) {
          const token = jwt.sign({ userName: username }, process.env.JWT_SECRET, {expiresIn: "1d"});
          const savedToken = ("token", token);
  
          console.log("Password match"); 
          res.send({status:200, message: "Paaword match", savedToken: savedToken})
        } else {
          console.log("Password doesn't match!"); 
          res.send({status:402, message: "Password doesm't match!"})

        }
        

      } else {
        console.log("User not found!");
        res.send({status:401, message: "User not found!"})
      }
    } catch (err) { 
      res.send({status:500, message: "invalid credantial"})
    }
  }); 



//-----------------------------REGISTER-USER-------------------------------------//

  app.post("/register", async (req, res) => {
      try {
    const { name, email, phone, username, password } = req.body;
    const hashedpassword = await bcrypt.hash(password, 10);
  
    const newUser = new user({
      name,
      email,
      phone,
      username,
      password: hashedpassword,
    });
  
      const savedUser = await newUser.save();
      if(!savedUser){
        res.send({status:401, message: "failed regsiteration"})
      } 
      res.send({status:200, message: "successfully regsiter"})
    

    } catch (err) {
      res.send({status:401, message: "failed regsiteration"})

      console.log(err); 
    }
  });
  

  //--------------------------GET ALL USERS---------------------------///
app.get("/allusers/:session", authentication,  async(req, res) =>{
 
    const getAllUsers = await user.find({}); 
    //  res.status(200).send(getAllUsers);
  res.send({status:200, message: "orignalUser data", getAllUsers: getAllUsers})

})
 
 
connection.then(() => {
    app.listen(port, () =>{
        console.log(`server is running on port ${port}`)
    });
});