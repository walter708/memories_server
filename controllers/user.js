import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js'
import dotenv from 'dotenv'
dotenv.config()

export const signin = async (req, res) =>{
  const {email, password} = req.body;
  
  try {
    const existingUser = await User.findOne({email});
    
    if(!existingUser) return res.status(404).json({message:"user does'nt exist. "});
    
    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    
    if(!isPasswordCorrect) return res.status(400).json({message:"Invalide credentials. "});
    
    const token = jwt.sign({id:existingUser._id,email:existingUser.email}, process.env.SECRET, {expiresIn:"1h"});
    
    res.status(200).json({result:existingUser, token});
    
  } catch (error) {
    return res.status(500).json({message: "Something went wrong."});
  }
}

export const signup = async (req, res) =>{
  const {email, password, confirmPassword, firstName, lastName} = req.body;
  
  try {
    const existingUser = await User.findOne({email})
    if(existingUser) return res.status(400).json({message:"User already exists."});
    if(password !== confirmPassword) return res.status(400).json({message:"The password does not match ."});
    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await User.create({email, password:hashedPassword, name:`${firstName} ${lastName}`});
    const token = jwt.sign({email, id:result._id}, process.env.SECRET, {expiresIn:'1h'});
    
    res.status(201).json({result, token});
    
  } catch (error) {
    return res.status(500).json({message:"Something went wrong. "})
  }
}