import { useEffect, useState, useRef, useContext } from 'react';
import Peer from 'simple-peer';
import io from 'socket.io-client';
import AuthContext from '../context/AuthContext';
import './VideoCall.css';

// Use environment variable for backend URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const socket = io(BACKEND_URL);

const VideoCall = ({ chat, onClose }) => {
    const [stream, setStream] = useState(null);
    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState('');
    const [callerSignal, setCallerSignal] = useState(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [name, setName] = useState('');
    const [me, setMe] = useState('');

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();
    const { user } = useContext(AuthContext);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            setStream(stream);
            if (myVideo.current) {
                myVideo.current.srcObject = stream;
            }
        });

        socket.emit('setup', user);
        setMe(user._id);

        socket.on('callUser', (data) => {
            setReceivingCall(true);
            setCaller(data.from);
            setName(data.name);
            setCallerSignal(data.signal);
        });

        return () => {
            socket.off('callUser');
            // Stop tracks
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        }
    }, []);

    const callUser = (id) => {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream,
        });

        peer.on('signal', (data) => {
            socket.emit('callUser', {
                userToCall: id,
                signalData: data,
                from: me,
                name: user.name,
            });
        });

        peer.on('stream', (stream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = stream;
            }
        });

        socket.on('callAccepted', (signal) => {
            setCallAccepted(true);
            peer.signal(signal);
        });

        connectionRef.current = peer;
    };

    const answerCall = () => {
        setCallAccepted(true);
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream,
        });

        peer.on('signal', (data) => {
            socket.emit('answerCall', { signal: data, to: caller });
        });

        peer.on('stream', (stream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = stream;
            }
        });

        peer.signal(callerSignal);
        connectionRef.current = peer;
    };

    const leaveCall = () => {
        setCallEnded(true);
        if (connectionRef.current) {
            connectionRef.current.destroy();
        }
        onClose();
    };

    // Determine the other user ID to call
    const otherUserId = chat.users.find(u => u._id !== user._id)?._id;

    return (
        <div className="video-call-container">
            <div className="video-wrapper">
                {stream && (
                    <div className="my-video">
                        <video playsInline muted ref={myVideo} autoPlay />
                    </div>
                )}
                {callAccepted && !callEnded && (
                    <div className="user-video">
                        <video playsInline ref={userVideo} autoPlay />
                    </div>
                )}
            </div>

            <div className="call-controls">
                {callAccepted && !callEnded ? (
                    <button onClick={leaveCall} className="end-call-btn">End Call</button>
                ) : (
                    <div className="init-controls">
                        {!receivingCall && !callAccepted && (
                            <button onClick={() => callUser(otherUserId)} className="start-call-btn">Start Call</button>
                        )}
                        <button onClick={onClose} className="close-btn">Close</button>
                    </div>
                )}

                {receivingCall && !callAccepted && (
                    <div className="incoming-call">
                        <h1>{name} is calling...</h1>
                        <button onClick={answerCall} className="answer-btn">Answer</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoCall;
