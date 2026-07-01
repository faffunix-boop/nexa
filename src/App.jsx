import { useState } from "react";
import "./App.css";

export default function App(){

  const [input,setInput] = useState("");
  const [messages,setMessages] = useState([]);


  async function send(){

    if(!input.trim()) return;

    const question = input;


    setMessages(prev=>[
      ...prev,
      {
        role:"user",
        text:question
      },
      {
        role:"ai",
        text:"Thinking..."
      }
    ]);


    setInput("");


    try{

      const res = await fetch(
        "http://localhost:3000/chat",
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          body:JSON.stringify({
            question:question
          })
        }
      );


      const data = await res.json();


      setMessages(prev=>[
        ...prev.slice(0,-1),
        {
          role:"ai",
          text:data.answer
        }
      ]);


    }catch(e){

      setMessages(prev=>[
        ...prev.slice(0,-1),
        {
          role:"ai",
          text:"Server error"
        }
      ]);

    }

  }



  return(

    <div className="app">

      <div className="chatBox">


        <div className="header">

          <div className="logo">
            ✦
          </div>


          <div>
            <h2>FusionAI</h2>
            <p>Multi AI Assistant</p>
          </div>

        </div>



        <div className="messages">

          {messages.map((m,i)=>(

            <div
            key={i}
            className={m.role}
            >
              {m.text}
            </div>

          ))}

        </div>



        <div className="inputBox">

          <input
          value={input}
          onChange={(e)=>setInput(e.target.value)}
          placeholder="Message FusionAI..."
          />


          <button onClick={send}>
            ➤
          </button>


        </div>


      </div>

    </div>

  );

}
