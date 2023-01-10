import mongoose from "mongoose";
import PostMessage from "../models/postMessage.js";

export const getPosts = async (req, res) =>{
  const {page} = req.query;
  const LIMIT = 10;
  const startIndex = (Number(page) - 1) * LIMIT; // to get the start Index
  
  try {
    const total = await PostMessage.countDocuments({});
    const posts = await PostMessage.find().sort({ _id: -1 }).limit(LIMIT).skip(startIndex)
    return res.status(200).json({data:posts, currentPage:Number(page), numberOfPages:Math.ceil(total/LIMIT)})
  } catch (error) {
    return res.status(404).status({message:error.message})
  }
}

export const getPost = async (req, res) =>{
  const {id} = req.params;
  try {
    const post = await PostMessage.findById(id);
    return res.status(200).json({data:post})
  } catch (error) {
    return res.status(404).status({message:error.message})
  }
}

export const getPostsBySearch = async (req, res) =>{
  const {searchQuery, tags} = req.query;
  let trimTag = tags.trim()
  try {
    const title = new RegExp(searchQuery, 'i');
    const posts = await PostMessage.find({ $or:[{title}, {tags: { $in: trimTag.split(",")} }]} )
    res.json({data:posts})
    
  } catch (error) {
    res.status(404).json({message: error.message})
  }
}

export const createPost = async (req, res ) =>{
  const post = req.body;
  const newPost = new PostMessage({...post, creator:req.userId, createdAt: new Date().toISOString()});
  
  try {
    await newPost.save()
    return res.status(201).json(newPost);
  } catch (error) {
    return res.status(409).json({message:error.message});
  }
}

export const updatePost = async (req, res ) =>{
  const {id} = req.params;
  const {title, message, creator, selectedFile, tags} = req.body;
  if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send("No object with that Id")
  
  const updatedPost = {title, message, creator, selectedFile, tags, _id:id}
  
  try {
    await PostMessage.findByIdAndUpdate(id, updatedPost, { new:true });
    return res.json(updatedPost)
  } catch (error) {
    return res.status(409).json({message:error.message});
  }
  
  
  
}

export const deletePost = async (req, res ) =>{
  const {id} = req.params;
  if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send("No object with that Id");
  
  try {
    await PostMessage.findByIdAndRemove(id);
    return res.json({message:"post deleted sucessfull!"});
  } catch (error) {
    return res.status(409).json({message:error.message});
  }
  
}




export const likePost = async (req, res ) =>{
  const {id} = req.params;
  if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send("No object with that Id");

  try {
    if(!req.userId){
     return res.json({message:'Unauthenticated'});
    }else{
    const post = await PostMessage.findById(id);
    const index = post.likes.findIndex((id) => id === String(req.userId))
    if(index === -1){
      post.likes.push(req.userId)
    }else{
      post.likes = post.likes.filter((id) => id !== req.userId)
    }
    const updatedPost = await PostMessage.findByIdAndUpdate(id, post, {new:true})
    return res.json(updatedPost)
    }
    
  } catch (error) {
    return res.status(409).json({message:error.message});
  }
  
}

export const commentPost = async(req, res) => {
  const { id } = req.params;
  const { value } = req.body;
  try {
    const post = await  PostMessage.findById(id);
    post.comments.push(value);
    const updatedPost  = await PostMessage.findByIdAndUpdate(id, post, {new :true})
    return res.status(200).json(updatedPost)
  } catch (error) {
    return res.status(404).json({error:error.message})
  }
}