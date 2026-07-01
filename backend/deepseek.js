const axios = require("axios");

require("dotenv").config();


async function askDeepSeek(message){

const response = await axios.post(
"https://api.deepseek.com/chat/completions",

{
model:"deepseek-chat",

messages:[
{
role:"user",
content:message
}
]

},

{
headers:{
"Authorization":`Bearer ${process.env.DEEPSEEK_KEY}`,
"Content-Type":"application/json"
}

}

);


return response.data.choices[0].message.content;

}


module.exports = askDeepSeek;
