const express = require("express");
const cors = require("cors");
const fusionAnswer = require("./fusion");

const app = express();

app.use(cors());
app.use(express.json());


app.post("/chat", async(req,res)=>{

let jawapan = await fusionAnswer(req.body.question);

res.json({
answer: jawapan
});

});


app.listen(3000,()=>{
console.log("Server jalan!");
});
