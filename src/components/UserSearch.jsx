import { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const UserSearch = () => {
    const [keyword, setKeyword] = useState('');
    const [results, setResults] = useState([]);
    const { user } = useContext(AuthContext);

    // Use environment variable for backend URL
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!keyword.trim()) return;

        if (!user || !user.token) {
            alert('Please login to search for users');
            return;
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get(`${BACKEND_URL}/api/users?search=${keyword}`, config);
            setResults(data);
        } catch (error) {
            console.error(error);
        }
    };

    const sendRequest = async (userId) => {
        if (!user || !user.token) {
            alert('Please login to send friend requests');
            return;
        }

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };
            await axios.post(`${BACKEND_URL}/api/users/friend-request`, { userId }, config);
            alert('Friend request sent!');
            setResults(results.filter(u => u._id !== userId));
        } catch (error) {
            alert(error.response?.data?.message || 'Error sending request');
        }
    };

    return (
        <div className="user-search">
            <h3>Find Friends</h3>
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Search by name or email"
                />
                <button type="submit">Search</button>
            </form>
            <div className="search-results">
                {results.map((u) => (
                    <div key={u._id} className="user-item">
                        <span>{u.name}</span>
                        <button onClick={() => sendRequest(u._id)}>Add Friend</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserSearch;
