const express = require('express')
const bcrypt = require('bcrypt')
const User = require('../models/userModel.cjs')
const {authToken, genToken} = require("../middleware/auth.cjs");
const connectDB = require("../config/db.cjs");
const router = express.Router();

connectDB.sync().then((data)=> console.log("DB is synced and ready authRoutes")).catch(err => console.log(err))
router.post("/signup", async (req, res) =>{
    try {
        const {name, email, password} = req.body;
        const userExisting = await User.findOne({
            where: {
                email
            }
        });
        if (userExisting) {
            return res.status(503).json({message: "User already exists"})
        } else {
            let passCrypt = await bcrypt.hash(password, 10)
            const newUser = {name, email, password: passCrypt}
            await User.create(newUser);
            return res.status(200).json({message: "User created"})
        }
    } catch (err) {
        console.log(err)
        return res.status(400).json({message: "Error creating user"})
    }
})

router.post("/signin", async (req, res) =>{
    try{
        const {email, password} = req.body;
        const userExisting = await User.findOne({
            where:{
                email
            }
        });
        if (!userExisting) {
            return res.status(503).json({message: "User does not exist"})
        } else {
            let passCrypt = await bcrypt.compare(password, userExisting.password)
            if (passCrypt) {
                const token = genToken(userExisting)
                return res.status(200).json({message: "Successfully logged in", token})
            } else {
                return res.status(403).json({message: "Wrong password"})
            }
        }
    } catch (e){
        console.log(e)
        return res.status(404).json({message: "Error logging in"})
    }
})

router.get("/protected", authToken, (req, res) => {
    return res.status(201).send(JSON.stringify({
        message: "token verified",
        user: req.user
    }))
})

module.exports = router;