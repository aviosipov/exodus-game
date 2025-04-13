"use client"; // Required for client-side hooks and localStorage

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import * as Collapsible from '@radix-ui/react-collapsible';

// Define audio files (kept within the component for now)
const audioFiles = [
  'Whispers in the Sand.mp3',
  'Whispers in the Dunes.mp3',
];

const AudioPlayer: React.FC = () => {
  // Audio state and ref
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isAudioOptionsOpen, setIsAudioOptionsOpen] = useState(false); // State for collapsible
  const contentRef = useRef<HTMLDivElement>(null); // Ref for the collapsible content
  const [hasInteracted, setHasInteracted] = useState(false); // State to track user interaction

  // --- Interaction Listener ---
  useEffect(() => {
    const handleFirstInteraction = () => {
      setHasInteracted(true);
      // Remove the listener after the first interaction
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction); // Also listen for keydown
      document.removeEventListener('touchstart', handleFirstInteraction); // For touch devices
    };

    // Add listeners for various interaction types
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);

    // Cleanup listeners on component unmount
    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []); // Empty dependency array ensures this runs only once

  // --- Load state from localStorage on mount ---
  useEffect(() => {
    const savedTrackIndex = localStorage.getItem('bgMusicTrackIndex');
    const savedMuteState = localStorage.getItem('bgMusicMuted');

    if (savedTrackIndex !== null) {
      const trackIndex = parseInt(savedTrackIndex, 10);
      // Ensure the index is valid before setting
      if (!isNaN(trackIndex) && trackIndex >= 0 && trackIndex < audioFiles.length) {
        setCurrentTrackIndex(trackIndex);
      }
    }

    if (savedMuteState !== null) {
      setIsMuted(savedMuteState === 'true');
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // --- Save state to localStorage on change ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bgMusicTrackIndex', currentTrackIndex.toString());
    }
  }, [currentTrackIndex]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bgMusicMuted', isMuted.toString());
    }
  }, [isMuted]);

  // --- Audio Effects ---
  useEffect(() => {
    const audioElement = audioRef.current;
    if (audioElement) {
      // Load the source regardless of interaction
      const currentSrc = `/audio/${encodeURIComponent(audioFiles[currentTrackIndex])}`;
      if (audioElement.src !== currentSrc) { // Avoid reloading if src is the same
          audioElement.src = currentSrc;
          audioElement.load();
      }

      // Only attempt to play if the user has interacted
      if (hasInteracted) {
        const playPromise = audioElement.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            // Play started successfully
            audioElement.muted = isMuted; // Apply mute state after play starts
          }).catch(error => {
            // This catch might still be needed for edge cases or specific browser issues
            console.error("Audio play failed after interaction:", error);
          });
        }
      } else {
         // Optional: Log that we are waiting for interaction
         // console.log("Waiting for user interaction to play audio.");
      }
    }
    // Depend on hasInteracted as well, so it attempts to play once interaction happens
  }, [currentTrackIndex, hasInteracted, isMuted]); // Added isMuted dependency to ensure correct state on play

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // --- Control Handlers ---
  const toggleMute = () => {
    setIsMuted(!isMuted);
    setIsAudioOptionsOpen(false); // Close collapsible on action
  };

  const selectTrack = (index: number) => {
    if (index !== currentTrackIndex) {
      setCurrentTrackIndex(index);
    }
    setIsAudioOptionsOpen(false); // Close collapsible on action
  };

  return (
    <>
      {/* Collapsible Audio Player Controls (Top Left) */}
      <Collapsible.Root
        open={isAudioOptionsOpen}
        onOpenChange={setIsAudioOptionsOpen}
        // Removed fixed positioning classes (fixed top-4 left-4 z-50) - positioning is handled by GameMenu parent
        className="flex flex-col items-start bg-gray-100/90 backdrop-blur-sm p-2 rounded-lg shadow-lg w-max"
      >
        {/* Top Row: Trigger + Mute Button */}
        {/* Force LTR direction specifically for this row */}
        <div className="flex items-center gap-2 w-full" dir="ltr">
          {/* Collapsible Trigger Text (Code order 1st -> Visual order left in LTR) */}
          <Collapsible.Trigger asChild>
            <button className="text-sm font-medium text-cyan-900 hover:text-blue-600 transition-colors cursor-pointer flex-grow text-left ml-1"> {/* Adjusted text alignment/margin for LTR */}
              פסקול מוזיקה רקע
            </button>
          </Collapsible.Trigger>
           {/* Mute Button (Code order 2nd -> Visual order right in LTR) */}
           <button
            onClick={toggleMute}
            // Removed border border-gray-400
            className="p-1 hover:bg-gray-100/50 rounded-full transition-colors"
            title={isMuted ? "בטל השתקה" : "השתק"}
           >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-red-600" />
            ) : (
              <Volume2 className="w-5 h-5 text-green-600" />
            )}
          </button>
        </div>

        {/* Collapsible Content Area */}
        <Collapsible.Content
          ref={contentRef}
          className="w-full overflow-hidden transition-all duration-300 ease-in-out data-[state=closed]:h-0 data-[state=closed]:opacity-0 data-[state=open]:opacity-100"
        >
          <div className="flex flex-col items-start gap-1 mt-2 pt-2 border-t border-gray-300/50">
            {audioFiles.map((_, index) => (
                <button
                  key={index}
                  onClick={() => selectTrack(index)}
                  className={`flex items-center gap-2 text-sm p-1 rounded w-full text-right ${
                    currentTrackIndex === index
                      ? 'font-semibold text-blue-700 bg-blue-100/50'
                      : 'text-gray-700 hover:bg-gray-100/50'
                  }`}
                >
                   <span className="inline-block w-4 h-4"></span>
                   <span>רצועה {index + 1}</span>
                 </button>
               ))}
          </div>
        </Collapsible.Content>
      </Collapsible.Root>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} loop hidden playsInline />
    </>
  );
};

export default AudioPlayer;
