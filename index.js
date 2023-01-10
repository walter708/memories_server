import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import postRouter from './routes/posts.js'
import userRouter from './routes/user.js'
import dotenv from 'dotenv'


const app = express();
dotenv.config()
// Middleware 
app.use(bodyParser.json({limit:'30mb' , extended : 'true'}));
app.use(bodyParser.urlencoded({limit:'30mb' , extended : 'true'}));
app.use(cors({origin:"*"}));

app.get('/',(req, res) =>{
      res.send("Hello to postcard API")
})
// Routes Middleware 
app.use('/posts', postRouter)
app.use('/user', userRouter)


// Database 
const PORT = process.env.PORT || 5000 ;
mongoose.connect(process.env.CONNECTION_URL)
      .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
      .catch((error) => console.log(error.message));
      





