const express = require("express");
const app = express();
const path = require('path');



// app.get("/", (request, response) => {
//     response.send("Hi there");
// });



app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + "/index.html"));
    
});



app.listen(5000, () => {
    console.log("Listen on the port 3000...");
});

//only two packege

//1- npm init 2- npm i express
