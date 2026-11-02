
import React, { useState, useRef } from 'react';
import { editMelquiadesDaguerreotype } from '../services/geminiService';
import { UI_TEXT } from '../constants';
import { Language } from '../types';

interface MelquiadesStudioProps {
  lang: Language;
}

export const MelquiadesStudio: React.FC<MelquiadesStudioProps> = ({ lang }) => {
  const [image, setImage] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [prompt, setPrompt] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const t = UI_TEXT[lang];

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera access denied", err);
    }
  };

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      setImage(canvas.toDataURL('image/png'));
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleEdit = async () => {
    if (!image) return;
    setEditing(true);
    const result = await editMelquiadesDaguerreotype(image, prompt, lang);
    if (result) setImage(result);
    setEditing(false);
  };

  return (
    <div className="flex flex-col items-center p-6 parchment border-t-4 border-amber-900 h-full overflow-y-auto">
      <h2 className="text-3xl font-serif text-amber-900 mb-2">{t.studioTitle}</h2>
      <p className="text-stone-600 italic mb-6">{t.studioSub}</p>

      {!image ? (
        <div className="relative w-full max-w-sm aspect-[4/3] bg-black rounded-lg overflow-hidden border-4 border-stone-800">
           <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
           <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40">
              <button onClick={startCamera} className="px-4 py-2 bg-amber-800 text-white rounded font-serif mr-2">{t.openLens}</button>
              <button onClick={capture} className="px-4 py-2 bg-white text-amber-800 rounded font-serif">{t.capture}</button>
           </div>
        </div>
      ) : (
        <div className="w-full max-w-sm space-y-4">
          <div className="border-8 border-stone-800 shadow-2xl">
             <img src={image} className="w-full h-auto" alt="Daguerreotype" />
          </div>
          <div className="flex flex-col space-y-2">
            <input 
              type="text" 
              placeholder={t.revealShadows}
              className="px-3 py-2 border border-amber-800 rounded font-serif bg-transparent"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button 
              disabled={editing}
              onClick={handleEdit}
              className="bg-amber-900 text-amber-50 py-2 rounded font-serif hover:bg-amber-800 disabled:opacity-50"
            >
              {editing ? t.developing : t.applyAlchemy}
            </button>
            <button onClick={() => setImage(null)} className="text-stone-500 font-serif text-sm underline">{t.another}</button>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
