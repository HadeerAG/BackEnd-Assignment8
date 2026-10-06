import express from "express"
import connectionDB from "./DB/connectionDB.js";
import userRouter from "./modules/users/user.controller.js";
import cors from "cors"
const app = express();
const port = 3000;



const bootstrap = async ()=>{

  app.use(cors({
    origin:"*"
  }))

app.use(express.json());

await connectionDB();



app.get("/",(req,res)=> res.status(200).json("Welcome to my Saraha app .. 🤗"));

app.use("/users", userRouter)


app.use("{/*demo}",(req,res,next)=>{
    // res.status(404).json({message:,
    // statusCode: 404})
    throw new Error(`Url:${req.originalUrl} with method ${req.method} not found`,{cause:404})
})


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.cause || 500).json({message: err.message, stack: err.stack});
});

app.listen(port, ()=> console.log(`Example app is listening on port ${port} `));
};

export default bootstrap