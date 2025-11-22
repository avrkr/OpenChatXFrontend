import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const FriendList = ({ setSelectedChat }) => {
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const { user } = useContext(AuthContext);

    // Use environment variable for backend URL
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

    const fetchFriends = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get(`${BACKEND_URL}/api/users/friends`, config);
            setFriends(data.friends);
            setRequests(data.friendRequests);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchFriends();
    }, []);

    const handleResponse = async (requestId, action) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };
            await axios.put(`${BACKEND_URL}/api/users/friend-request`, { requestId, action }, config);
            fetchFriends();
        } catch (error) {
            console.error(error);
        }
    };

    const startChat = async (userId) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.post(`${BACKEND_URL}/api/chats`, { userId }, config);
            setSelectedChat(data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="friend-list-container">
            <div className="requests-section">
                <h3>Friend Requests</h3>
                {requests.length === 0 && <p>No pending requests</p>}
                {requests.map((req) => (
                    <div key={req._id} className="request-item">
                        <span>{req.from.name}</span>
                        <div>
                            <button onClick={() => handleResponse(req._id, 'accept')} className="accept-btn">Accept</button>
                            <button onClick={() => handleResponse(req._id, 'reject')} className="reject-btn">Reject</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="friends-section">
                <h3>My Friends</h3>
                {friends.length === 0 && <p>No friends yet</p>}
                {friends.map((friend) => (
                    <div key={friend._id} className="friend-item">
                        <div className={`status-indicator ${friend.status}`}></div>
                        <span>{friend.name}</span>
                        <button onClick={() => startChat(friend._id)} className="chat-btn">Chat</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FriendList;
