const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes.cjs");
const connectDB = require("./config/db.cjs")
const {urlencoded} = require("express");
require("dotenv").config();
const PORT = 3000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(urlencoded({extended: true}));
app.use("/auth", authRoutes);
connectDB.sync().then((data)=> console.log("DB is synced and ready")).catch(err => console.log(err))

const init = async()=>{
    app.listen(PORT, ()=>{
        console.log(`App is running on Port: ${PORT}`);
    })
}

init().catch((error) => {
    console.error('Error occurred during app initialization:', error);
});