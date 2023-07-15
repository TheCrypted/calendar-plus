const jwt = require("jsonwebtoken")
const SECRET_KEY = "qnWmmdNaYVmJy9H8WZ9rDLGuyolV7lGg"
const genToken = (user) => {
    jwt.sign(user, SECRET_KEY, {
        expireIn: "1 hour"
    })
}

const authToken = (req, res, next) => {
    const token = req.headers.auth;
    if(!token){
        return req.status(403).json({message: "No token provided"})
    } else {
        jwt.verify(token, SECRET_KEY, (err, user)=> {
            if(err) {
                return req.status(403).json({message:"Could not verify token"})
            } else {
                req.user = user;
                next()
            }
        })
    }
}

module.exports = {authToken, genToken}