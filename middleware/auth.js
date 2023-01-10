import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
import decode from 'jwt-decode'
dotenv.config()

const auth = async (req, res, next) =>{
  try {
    const token  = req?.headers?.authorization?.split(" ")[1];
    const decodedToken = decode(token)
    const isExpire = decodedToken.exp * 1000 < new Date().getTime()
    if(isExpire){
      return res.json({message:"token expired"})
    }
    let isCustomAuth = token.length < 500
    let decodedData;
    if(isCustomAuth){
      decodedData = jwt.verify(token, process.env.SECRET)
      req.userId = decodedData?.id;
    }else{
      decodedData = jwt.decode(token)
      req.userId = decodedData?.sub;
    }
    next()
  } catch (error) {
    console.log(error)
  }
  
}

export default auth;