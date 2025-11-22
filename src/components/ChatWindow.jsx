import { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import AuthContext from '../context/AuthContext';
import VideoCall from './VideoCall';
import './ChatWindow.css';

let socket;

const ChatWindow = ({ chat, setChat }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socketConnected, setSocketConnected] = useState(false);
    const [showVideoCall, setShowVideoCall] = useState(false);
    const { user } = useContext(AuthContext);
    const messagesEndRef = useRef(null);

    // Use environment variable for backend URL
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

    useEffect(() => {
        socket = io(BACKEND_URL);
        socket.emit('setup', user);
        socket.on('connected', () => setSocketConnected(true));
        socket.on('message received', (newMessageReceived) => {
            if (!chat || chat._id !== newMessageReceived.chat._id) {
                // Give notification
            } else {
                setMessages([...messages, newMessageReceived]);
            }
        });

        return () => {
            socket.disconnect();
        }
    }, []);

    useEffect(() => {
        if (!chat) return;

        if (!user || !user.token) {
            console.log('User not authenticated');
            return;
        }

        const fetchMessages = async () => {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                const { data } = await axios.get(`${BACKEND_URL}/api/messages/${chat._id}`, config);
                setMessages(data);
                socket.emit('join chat', chat._id);
            } catch (error) {
                console.error(error);
            }
        };

        fetchMessages();
    }, [chat, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (e) => {
        if (e.key === 'Enter' && newMessage) {
            if (!user || !user.token) {
                alert('Please login to send messages');
                return;
            }

            try {
                const config = {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                setNewMessage('');
                const { data } = await axios.post(
                    `${BACKEND_URL}/api/messages`,
                    { content: newMessage, chatId: chat._id },
                    config
                );
                socket.emit('new message', data);
                setMessages([...messages, data]);
            } catch (error) {
                console.error(error);
            }
        }
    };

    const getSender = (loggedUser, users) => {
        return users[0]._id === loggedUser._id ? users[1].name : users[0].name;
    };

    if (!chat) return <div className="no-chat-selected">Select a chat to start messaging</div>;

    return (
        <div className="chat-window">
            {showVideoCall && <VideoCall chat={chat} onClose={() => setShowVideoCall(false)} />}
            <div className="chat-header-window">
                <h3>{chat.isGroupChat ? chat.chatName : getSender(user, chat.users)}</h3>
                <div className="header-actions">
                    <button onClick={() => setShowVideoCall(true)} className="video-btn">Video Call</button>
                    <button onClick={() => setChat(null)} className="back-btn">Back</button>
                </div>
            </div>
            <div className="messages-box">
                {messages.map((m, i) => (
                    <div
                        key={m._id}
                        className={`message ${m.sender._id === user._id ? 'my-message' : 'other-message'}`}
                    >
                        <span className="message-content">{m.content}</span>
                        <span className="message-time">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="input-box">
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={sendMessage}
                />
            </div>
        </div>
    );
};

export default ChatWindow;
