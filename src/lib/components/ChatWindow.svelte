<script>
    import { BotMessageSquare } from 'lucide-svelte';
import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';
  
    let isOpen = false;
    let messages = [];
    let inputMessage = '';
  
    function toggleChat() {
      isOpen = !isOpen;
    }
  
    function sendMessage() {
      if (inputMessage.trim()) {
        messages = [...messages, { text: inputMessage, sender: 'user' }];
        inputMessage = '';
        // Simulate a response (replace with actual API call in a real scenario)
        setTimeout(() => {
          messages = [...messages, { text: "Thank you for your message. An advisor will respond shortly.", sender: 'bot' }];
        }, 1000);
      }
    }
  
    onMount(() => {
      // You can initialize the chat or load previous messages here
    });
  </script>
  
  <div class="chat-widget">
    {#if !isOpen}
      <button on:click={toggleChat} class="bg-blue-500 text-white border-none sm:px-5 sm:py-2.5 rounded-full cursor-pointer font-bold flex place-items-center" transition:fade>
        <span class='hidden sm:inline'>Further questions?</span><span class='inline'><BotMessageSquare class='h-6 w-6 m-3'/></span>
      </button>
    {:else}
      <div class="w-72 h-96 bg-white rounded-lg shadow-lg flex flex-col" transition:fly="{{ y: 50, duration: 300 }}">
        <div class="chat-header">
          <h3>Chat with us</h3>
          <button on:click={toggleChat} class="close-button">&times;</button>
        </div>
        <div class="chat-messages">
          {#each messages as message}
            <div class="message {message.sender}">
              {message.text}
            </div>
          {/each}
        </div>
        <div class="chat-input">
          <input
            type="text"
            bind:value={inputMessage}
            on:keypress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
          />
          <button on:click={sendMessage}>Send</button>
        </div>
      </div>
    {/if}
  </div>
  
  <style>
    .chat-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
    }
/*   
    .chat-button {
      background-color: #4299e1;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 20px;
      cursor: pointer;
      font-weight: bold;
    }
   */
    /* .chat-window {
      width: 300px;
      height: 400px;
      background-color: white;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
    }
   */
    .chat-header {
      background-color: #4299e1;
      color: white;
      padding: 10px;
      border-top-left-radius: 10px;
      border-top-right-radius: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  
    .chat-header h3 {
      margin: 0;
    }
  
    .close-button {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
    }
  
    .chat-messages {
      flex-grow: 1;
      overflow-y: auto;
      padding: 10px;
    }
  
    .message {
      margin-bottom: 10px;
      padding: 5px 10px;
      border-radius: 10px;
      max-width: 80%;
    }
  
    .message.user {
      background-color: #e2e8f0;
      align-self: flex-end;
      margin-left: auto;
    }
  
    .message.bot {
      background-color: #4299e1;
      color: white;
    }
  
    .chat-input {
      display: flex;
      padding: 10px;
    }
  
    .chat-input input {
      flex-grow: 1;
      padding: 5px;
      border: 1px solid #e2e8f0;
      border-radius: 5px;
    }
  
    .chat-input button {
      background-color: #4299e1;
      color: white;
      border: none;
      padding: 5px 10px;
      margin-left: 5px;
      border-radius: 5px;
      cursor: pointer;
    }
  </style>