# ChatGPT Clone

A beautiful and functional ChatGPT clone built with vanilla HTML, CSS, and JavaScript. Features include chat history, OpenAI API integration, and a modern user interface.

## Features

- 🤖 **OpenAI API Integration** - Uses GPT-4.0-mini for conversations
- 💬 **Chat History** - Automatically saves and loads previous conversations
- 🎨 **Beautiful UI** - Modern, responsive design with smooth animations
- 💾 **Local Storage** - Chat history and API key stored locally
- ⌨️ **Keyboard Shortcuts** - Press Enter to send messages
- 📱 **Responsive** - Works on desktop and mobile devices
- 🔒 **Secure** - API key stored locally, never sent to external servers

## Getting Started

### 1. Get Your OpenAI API Key

1. Visit [https://platform.openai.com/](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to the API section
4. Go to "API Keys" in the left sidebar
5. Click "Create new secret key"
6. Copy the key (you won't be able to see it again)
7. Add billing information to your OpenAI account

### 2. Setup the Application

1. Create `constant.js` in your application
2. Enter your OpenAI API key 
3. Enjoy!

## Usage

- **New Chat**: Click the "New Chat" button to start a fresh conversation
- **Chat History**: Previous conversations are saved in the left sidebar
- **Send Messages**: Type your message and press Enter or click the send button

## Technical Details

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **API**: OpenAI GPT-4.0-mini
- **Storage**: Browser localStorage for chat history and API key
- **Styling**: CSS Grid, Flexbox, and CSS animations
- **Icons**: Font Awesome for beautiful icons

## Features in Detail

### Chat Management
- Automatic chat title generation from first message
- Persistent chat history across browser sessions
- Easy switching between different conversations

### User Interface
- Typing indicators with animated dots
- Message timestamps
- Responsive design for all screen sizes
- Smooth scrolling and animations
- Professional color scheme

### API Integration
- Secure API key storage
- Error handling for API failures
- Conversation context maintained
- Rate limiting considerations

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

This project is open source and available under the [MIT License](LICENSE).

## Note

This is a demo application for educational purposes. Make sure to follow OpenAI's usage policies and keep your API key secure.
