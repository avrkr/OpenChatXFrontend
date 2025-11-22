import { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';
import UserSearch from '../components/UserSearch';
import FriendList from '../components/FriendList';
import ChatWindow from '../components/ChatWindow';
import './ChatPage.css';

const ChatPage = () => {
    const { user, logout } = useContext(AuthContext);
    const [selectedChat, setSelectedChat] = useState(null);

    return (
        <div className="chat-container">
            <header className="chat-header">
                <h2 className="chat-header-logo">OpenChatX</h2>
                <div className="user-info">
                    <span>{user?.name}</span>
                    <button onClick={logout} className="logout-btn">Logout</button>
                </div>
            </header>
            <div className="chat-layout">
                <aside className="sidebar">
                    <UserSearch />
                    <FriendList setSelectedChat={setSelectedChat} />
                </aside>
                <main className="chat-area">
                    <ChatWindow chat={selectedChat} setChat={setSelectedChat} />
                </main>
            </div>
        </div>
    );
};

export default ChatPage;
