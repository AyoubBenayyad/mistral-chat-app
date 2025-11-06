# Mistral Chat Application

A chat interface built with Next.js and Mistral AI's API, focusing on real-time interaction and clean user experience.

## Live Demo

Experience the application live: [Mistral Chat App](https://mistral-chat-app-xi.vercel.app/)

## Overview

This project showcases a modern chat interface powered by Mistral AI's language models. I built it to demonstrate practical integration of AI capabilities in a web application while maintaining a focus on user experience and performance.

## Features

- Real-time chat interface with Mistral AI
- Multiple model selection (mistral-tiny, mistral-small, mistral-large)
- Responsive design that works on all devices
- Chat history persistence in local storage ( for simplicity  the better apporach is the use a DB)
- Streamed responses for natural conversation flow

## Tech Stack

- Frontend: Next.js 13, TypeScript, React
- Styling: Tailwind CSS
- State Management: React Hooks
- API Integration: Mistral AI API
- Testing: Jest, React Testing Library

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- Mistral AI API key

### Setup

1. Clone the repository
```bash
git clone https://github.com/AyoubBenayyad/mistral-chat-app.git
cd mistral-chat-app
```

2. Install dependencies
```bash
npm install
```

3. Add your API key to `.env.local`
```bash
MISTRAL_API_KEY=your_api_key_here
```

4. Start the development server
```bash
npm run dev
```

## Future Plans

- Authentication system
- Enhanced conversation management
- File attachments support
- Conversation export functionality

## Contact

Ayoub Benayyad  
Email: ayoub.benayyad@outlook.com  
GitHub: https://github.com/AyoubBenayyad/mistral-chat-app
