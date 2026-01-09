
import React, { useRef, useEffect, useState } from 'react';
import { Html } from '@react-three/drei'; // Not needed if outside canvas
import './AudioPlayer.css'; // We'll create some basic styles or inline them

const AudioPlayer = ({ src, isPlaying, initialVolume = 0.5, initialMuted = false }) => {
    const audioRef = useRef(null);
    const [volume, setVolume] = useState(initialVolume);
    const [muted, setMuted] = useState(initialMuted);
    const [status, setStatus] = useState('INIT'); // INIT, PLAYING, PAUSED, BLOCKED, ENDED
    const [hasPlayedOnce, setHasPlayedOnce] = useState(false);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const attemptPlay = async () => {
            try {
                if (isPlaying && !hasPlayedOnce && status !== 'PLAYING') {
                    await audio.play();
                    setStatus('PLAYING');
                } else if (!isPlaying || hasPlayedOnce) {
                    audio.pause();
                    setStatus(hasPlayedOnce ? 'ENDED' : 'PAUSED');
                }
            } catch (err) {
                console.warn("Audio Playback Blocked/Failed:", err);
                setStatus('BLOCKED');
            }
        };

        attemptPlay();
    }, [isPlaying, hasPlayedOnce, src]); // Retrigger on src change

    const handleEnded = () => {
        setHasPlayedOnce(true);
        setStatus('ENDED');
    };

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (status === 'PLAYING') {
            audioRef.current.pause();
            setStatus('PAUSED');
        } else {
            audioRef.current.play().then(() => setStatus('PLAYING')).catch(() => setStatus('BLOCKED'));
        }
    };

    const toggleMute = () => {
        setMuted(!muted);
        if (audioRef.current) {
            audioRef.current.muted = !muted;
        }
    };

    return (
        <div className="audio-player-hud">
            <audio
                ref={audioRef}
                src={src}
                loop={false}
                onEnded={handleEnded}
            />

            <div className="audio-controls">
                <button
                    className={`audio-btn ${status === 'BLOCKED' ? 'blocked' : ''}`}
                    onClick={togglePlay}
                    title={status === 'BLOCKED' ? 'Click to Enable Audio' : 'Play/Pause'}
                >
                    {status === 'PLAYING' ? '⏸' : '▶'}
                </button>

                <button
                    className={`audio-btn ${muted ? 'muted' : ''}`}
                    onClick={toggleMute}
                >
                    {muted ? '🔇' : '🔊'}
                </button>

                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="volume-slider"
                />
            </div>

            <div className="track-info">
                <span className="scrolling-text">
                    {status === 'BLOCKED' ? '[CLICK TO START]' : (src ? src.split('/').pop().toUpperCase() : 'NO SIGNAL')}
                </span>
            </div>
        </div>
    );
};

export default AudioPlayer;
