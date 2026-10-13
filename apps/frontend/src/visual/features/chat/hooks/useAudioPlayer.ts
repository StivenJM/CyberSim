import { useState, useRef, useCallback } from 'react';


export interface AudioPlayerState {
    isPlaying: boolean;
    currentAudioId: string | null;
    play: (base64Audio: string, audioId: string) => void;
    stop: () => void;
}

export const useAudioPlayer = (): AudioPlayerState => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentAudioId, setCurrentAudioId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const base64ToBlob = useCallback((base64: string): Blob => {
        // Remover el prefijo data:audio si existe
        const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: 'audio/mpeg' });
    }, []);

    const play = useCallback((base64Audio: string, audioId: string) => {
        if (!base64Audio) {
            console.warn('No hay audio disponible');
            return;
        }

        // Lógica de Toggle (Play/Pause) - Si es el mismo audio
        if (currentAudioId === audioId && audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                if (audioRef.current.ended) {
                    audioRef.current.currentTime = 0;
                }
                audioRef.current.play().catch(e => console.error("Error al reanudar:", e));
                setIsPlaying(true);
            }
            return;
        }

        // Si hay un audio reproduciéndose, detenerlo antes de iniciar el nuevo
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
            setIsPlaying(false);
            setCurrentAudioId(null);
        }

        try {
            console.log('Iniciando nuevo audio:', base64Audio.substring(0, 30) + '...');

            const audioBlob = base64ToBlob(base64Audio);
            const audioUrl = URL.createObjectURL(audioBlob);

            const audio = new Audio(audioUrl);
            audioRef.current = audio;
            setCurrentAudioId(audioId);

            audio.onplay = () => setIsPlaying(true);
            audio.onended = () => {
                setIsPlaying(false);
                setCurrentAudioId(null);
            };
            audio.onerror = () => {
                console.error('Error al reproducir el audio');
                setIsPlaying(false);
                audioRef.current = null;
                setCurrentAudioId(null);
            };

            audio.play();
        } catch (error) {
            console.error('Error procesando el audio:', error);
            setIsPlaying(false);
        }
    }, [base64ToBlob, currentAudioId, isPlaying]);

    const stop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0; 
            setIsPlaying(false);
            setCurrentAudioId(null);
        }
    }, []);

    return { isPlaying, currentAudioId, play, stop };
};
