import { useState } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator} from "@chatscope/chat-ui-kit-react";
import chatLogo from "../src/assets/gpt.png";

const API_KEY = import.meta.env.VITE_AI_API_KEY;

function App() {
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hello, I am ChatGPT! Ask me anything.",
      sender: "ChatGPT",
      direction: "incoming"
    }
  ])

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing"
    }

    const newMessages = [...messages, newMessage]; // All the old messages, + the new message

    // Update our message state
    setMessages(newMessages);

    // Set a typing indicator (ChatGPT is typing)
    setTyping(true);
    
    // Process message to chatGPT (send it over and see the response)
    await processMessageToChatGPT(newMessages);
  }

  async function processMessageToChatGPT(chatMessages){
    // chatMessages {sender: "user" or "ChatGPT", message: "The message content here"}
    // apiMessages {role: "user" or "assistant", content: "The message content here"}
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if(messageObject.sender === "ChatGPT") {
        role = "assistant"
      }else{
        role = "user"
      }
      return { role: role, content: messageObject.message }
    })

    // role: "user" -> a message from the user, "assistant" -> a response from chatGPT
    // "system" -> generally one initial message defining HOW we want chatgpt to talk

    const systemMessage = {
      role: "system",
      content: "Explain all concepts like I am normal human." // Speak like a pirate, speak like I'm 10 years old, etc
    }

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,
        ...apiMessages // [message1,message2,message3]
      ]
    }

    await fetch("https://api.openai.com/v1/chat/completions", 
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      console.log(data);
      console.log(data.choices[0].message.content);
      setMessages(
        [...chatMessages, {
          message: data.choices[0].message.content,
          sender: "ChatGPT",
          direction: "incoming"
        }]
      );
      setTyping(false);
    });
  }

  return (
    <div className='App'>
      <div className="chat-container">
        <img src={chatLogo} alt="ChatGPT Clone" style={{width: "50px"}}/>
        <MainContainer>
          <ChatContainer>
            <MessageList
            scrollBehavior='smooth'
              typingIndicator={typing ? <TypingIndicator content="ChatGPT is typing" /> : null}
            >
              {messages.map((message, i) => {
                return <Message key={i} model={message} />
              })}
            </MessageList>
            <MessageInput placeholder='Type message here' onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  )
}

export default App
