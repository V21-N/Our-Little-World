"use client";

import { createContext, useContext, useState } from "react";
import {
  YouTubePlaylistPlayer,
  type YouTubeTrack,
} from "@/components/youtube-playlist-player";

type YouTubePlayerContextValue = {
  track: YouTubeTrack | null;
  setTrack: (track: YouTubeTrack) => void;
  setQueue: (tracks: YouTubeTrack[], index: number) => void;
  shuffleQueue: () => void;
  clearTrack: () => void;
};

const YouTubePlayerContext = createContext<YouTubePlayerContextValue | null>(null);

export function YouTubePlayerProvider({ children }: { children: React.ReactNode }) {
  const [track, setTrack] = useState<YouTubeTrack | null>(null);
  const [queue, setQueue] = useState<YouTubeTrack[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);

  const playQueueTrack = (tracks: YouTubeTrack[], index: number) => {
    setQueue(tracks);
    setQueueIndex(index);
    setTrack(tracks[index] ?? null);
  };

  const moveQueue = (direction: -1 | 1) => {
    const nextIndex = queueIndex + direction;
    if (nextIndex < 0 || nextIndex >= queue.length) return;
    setQueueIndex(nextIndex);
    setTrack(queue[nextIndex]);
  };

  const shuffleQueue = () => {
    if (queue.length < 2) return;
    const shuffled = [...queue];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }
    const currentIndex = Math.max(0, shuffled.findIndex((item) => item.url === track?.url));
    setQueue(shuffled);
    setQueueIndex(currentIndex);
    const nextIndex = (currentIndex + 1) % shuffled.length;
    setQueueIndex(nextIndex);
    setTrack(shuffled[nextIndex]);
  };

  return (
    <YouTubePlayerContext.Provider
      value={{
        track,
        setTrack,
        setQueue: playQueueTrack,
        shuffleQueue,
        clearTrack: () => setTrack(null),
      }}
    >
      {children}
      <YouTubePlaylistPlayer
        track={track}
        onPrevious={() => moveQueue(-1)}
        onNext={() => moveQueue(1)}
        canNavigatePrevious={queueIndex > 0}
        canNavigateNext={queueIndex >= 0 && queueIndex < queue.length - 1}
        onShuffle={shuffleQueue}
        canShuffle={queue.length > 1}
      />
    </YouTubePlayerContext.Provider>
  );
}

export function useYouTubePlayer() {
  const context = useContext(YouTubePlayerContext);
  if (!context) {
    throw new Error("useYouTubePlayer must be used inside YouTubePlayerProvider");
  }
  return context;
}
