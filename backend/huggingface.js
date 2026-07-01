const axios = require("axios");

require("dotenv").config();

async function askHF(message){

const response = await axios.post(

"https://router.huggingface.co/hf-inference/models/Qwen/Qwen2.5-7B-Instruct",

{
inputs: message
},

{
headers:{
"Authorization":`Bearer ${process.env.HF_KEY}`,
"Content-Type":"application/json"
}
}

);

return response.data[0].generated_text;

}

module.exports = askHF;
