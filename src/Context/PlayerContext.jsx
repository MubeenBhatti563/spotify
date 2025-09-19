import { createContext, useRef, useState, useEffect } from "react"
import { songsData } from "../assets/assets";

export const PlayerContext = createContext()

const PlayerContextProvider = (props) => {

    const audioRef = useRef();
    const seekBar = useRef();
    const seekBg = useRef();

    const [track, setTrack] = useState(songsData[0]);
    const [playStatus, setPlayStatus] = useState(false);
    const [time, setTime] = useState({
        currentTime: {
            second: 0,
            minute: 0,
        },
        totalTime: {
            second: 0,
            minute: 0,
        }
    })

    const play = () => {
        audioRef.current.play();
        setPlayStatus(true)
    }

    const pause = () => {
        audioRef.current.pause();
        setPlayStatus(false)
    }

    const playWithId = async (id) => {
        await setTrack(songsData[id]);
        await audioRef.current.play();
        setPlayStatus(true);
    }

    const previous = async () => {
        if (track.id > 0) {
            await setTrack(songsData[track.id - 1]);
            await audioRef.current.play();
            setPlayStatus(true);
        }
    }

    const next = async () => {
        if (track.id < songsData.length - 1) {
            await setTrack(songsData[track.id + 1]);
            await audioRef.current.play();
            setPlayStatus(true);
        }
    }

    const seekSong = (e) => {
        if (!audioRef.current || !seekBg.current) return;

        const duration = audioRef.current.duration;
        if (!duration || isNaN(duration)) return; // duration not loaded yet

        const clickX = e.nativeEvent.offsetX;
        const width = seekBg.current.offsetWidth;
        const newTime = (clickX / width) * duration;

        if (!isNaN(newTime) && isFinite(newTime)) {
            audioRef.current.currentTime = newTime;
        }
    };

    useEffect(() => {
        if (!audioRef.current) return; // stop if no audio element

        const updateTime = () => {
            const { currentTime, duration } = audioRef.current;
            if (!duration || isNaN(duration)) return;

            if (seekBar.current) {
                seekBar.current.style.width =
                    Math.floor((currentTime / duration) * 100) + "%";
            }

            setTime({
                currentTime: {
                    second: Math.floor(currentTime % 60),
                    minute: Math.floor(currentTime / 60),
                },
                totalTime: {
                    second: Math.floor(duration % 60),
                    minute: Math.floor(duration / 60),
                },
            });
        };

        audioRef.current.ontimeupdate = updateTime;

        return () => {
            if (audioRef.current) {
                audioRef.current.ontimeupdate = null;
            }
        };
    }, [audioRef]);

    const contextValue = {
        audioRef,
        seekBar,
        seekBg,
        track, setTrack,
        playStatus, setPlayStatus,
        time, setTime,
        play, pause,
        playWithId,
        next, previous,
        seekSong,
    }

    return (
        <PlayerContext.Provider value={contextValue}>
            {props.children}
        </PlayerContext.Provider>
    )
}

export default PlayerContextProvider