const express = require('express')
const mongoose=require('mongoose')
const bodyParser = require('body-parser');

const app = express()
const port = 5000
const mongoDB =require("./db")
mongoDB();


app.get('/', (req, res) => {
  res.send(`<h1>MR. Shakya , Your app listening on port ${port} </h1>`)
})
// app.use((req,res,next)=>{
//   res.setHeader("Access-Control-Allow-Origin","http://localhost:3000");
//   res.header("Access-Control-Allow-Headers",
//   "Origin,X-Requested-With,Content-Type,Accept"
//   );
//   next();
// })
// app.use(express.json());
// app.use("/api/",require("./Routes/CreateUser"));
// app.use("/api/",require("./Routes/DisplayData"));
// app.use("/api/",require("./Routes/OrderData"));



app.use(bodyParser.urlencoded({extended:false}));
app.use(express.json())


// Schema
const productSchema = new mongoose.Schema({
    name:String,
    description:String,
    price:Number
})

//model

const Product = new mongoose.model("Product",productSchema)


//create product
app.post("/api/v1/product/new",async(req,res)=>{
    const product =await Product.create(req.body);

    res.status(200).json({
        success:true,
        product
    })
})

// app.get("/api/v1/product/new",async(req,res)=>{
//     try {
//     const product = await Product.create(req.body);
//     res.send("ajju is heres")

//     res.status(200).json({
//         success: true,
//         // product
//     });
// } catch (error) {
//     console.log(error);
//     res.status(500).json({
//         success: false,
//         error: "Internal Server Error"
//     });
// }

// })


app.listen(port, () => {
  console.log(`Your app listening on port ${port}`)
})

