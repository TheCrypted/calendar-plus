const jwt = require("jsonwebtoken")
const SECRET_KEY = "qnWmmdNaYVmJy9H8WZ9rDLGuyolV7lGg"
const genToken = (user) => {
    const payload = {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password
    }
    return jwt.sign(payload, SECRET_KEY, {
        expiresIn: "1 hour"
    })
}

const authToken = (req, res, next) => {
    const token = req.headers.auth;
    if(!token){
        return res.status(403).json({message: "No token provided"})
    } else {
        jwt.verify(token, SECRET_KEY, (err, user)=> {
            if(err) {
                return res.status(403).json({message:"Could not verify token"})
            } else {
                req.user = user;
                next()
            }
        })
    }
}

const checkAuth = async (token) => {
    try {
        return await jwt.verify(token, SECRET_KEY)
    } catch (e) {
        return false
    }
}
module.exports = {authToken, genToken, checkAuth}