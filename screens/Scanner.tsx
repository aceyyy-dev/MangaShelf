import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useStore } from '../StoreContext';
import { Series, Volume } from '../types';
import { GoogleGenAI } from "@google/genai";

interface ScannedItemState {
    title: string;
    author: string;
    volumeNumber: number;
    coverUrl: string;
    publisher: string;
    publishYear: string;
    totalVolumes?: number;
    tags?: string[];
    status?: 'Reading' | 'Completed';
}

const PLACEHOLDER_COVER = "https://placehold.co/400x600/1e293b/ffffff?text=?";

const Scanner: React.FC = () => {
  const navigate = useNavigate();
  const { series, addSeries, addVolume, updateSeries } = useStore();
  
  const [showResult, setShowResult] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'barcode' | 'cover'>('barcode');
  const [zoomLevel, setZoomLevel] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default scanned item state
  const [scannedItem, setScannedItem] = useState<ScannedItemState>({
      title: '',
      author: '',
      volumeNumber: 1,
      coverUrl: '',
      publisher: '',
      publishYear: '',
      totalVolumes: 0,
      tags: [],
      status: 'Reading'
  });

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          zoom: true
        } as any,
        audio: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleZoom = async (level: number) => {
    setZoomLevel(level);
    if (!streamRef.current) return;
    const [track] = streamRef.current.getVideoTracks();
    const capabilities = track.getCapabilities() as any;

    if (capabilities && 'zoom' in capabilities) {
      try {
        let targetZoom = level;
        if (targetZoom < capabilities.zoom.min) targetZoom = capabilities.zoom.min;
        if (targetZoom > capabilities.zoom.max) targetZoom = capabilities.zoom.max;
        await track.applyConstraints({ advanced: [{ zoom: targetZoom }] } as any);
      } catch (e) {
        console.log("Zoom not supported directly on this track", e);
      }
    }
  };

  const handleSimulateScan = async () => {
      // 1. Simulate finding a barcode or cover match
      setIsLoading(true);
      const detectedTitle = "Jujutsu Kaisen"; // Simulating a detection
      const detectedVol = 1;
      const detectedCover = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUtjbOS92RGEuZrcoTRz-_BbRj__BXyexZhvhmsafpRXUj97H4ZGkjNGeHjodLBQVDQVnOwHtu-O8Peg7Hp46vjzqZE72qTJtUXoVNytb7ZPd58hT7Ay3oE6VZs9xmVgHTFD2pUG_SE7ukMwtzBqhGGaGbdVfM56rKLiR2EzP6xzYsF43s_DViYldGPyZBe3b8PG2KI7CYyJjTIcJbIEErn15NaOdCHKNT_1SoUR2aEd9M8FkUcIZ3IpxG2m3VwWp72P2QOuw6iXo';

      try {
        // 2. Fetch Metadata from Gemini
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `
          Provide metadata for the manga series "${detectedTitle}" as JSON.
          Include: 
          - totalVolumes (approximate number of released volumes in Japan)
          - author
          - publisher (English publisher preferred)
          - publishYear (start year)
          - status (Reading or Completed)
          - tags (array of 3 genres)
          
          Example format:
          {
            "totalVolumes": 25,
            "author": "Name",
            "publisher": "Viz",
            "publishYear": "2020",
            "status": "Reading",
            "tags": ["Action", "Fantasy"]
          }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });

        const text = response.text || "{}";
        const metadata = JSON.parse(text);

        setScannedItem({
            title: detectedTitle,
            volumeNumber: detectedVol,
            coverUrl: detectedCover,
            author: metadata.author || "Unknown",
            publisher: metadata.publisher || "Viz Media",
            publishYear: metadata.publishYear || "2018",
            totalVolumes: metadata.totalVolumes || 20,
            status: metadata.status === 'Completed' ? 'Completed' : 'Reading',
            tags: metadata.tags || ['Shonen']
        });
        
      } catch (error) {
          console.error("AI Metadata fetch failed", error);
          // Fallback if AI fails
          setScannedItem({
            title: detectedTitle,
            author: 'Gege Akutami',
            volumeNumber: detectedVol,
            coverUrl: detectedCover,
            publisher: 'Shonen Jump',
            publishYear: '2018',
            totalVolumes: 25,
            tags: ['Shonen'],
            status: 'Reading'
          });
      } finally {
        setIsLoading(false);
        setShowResult(true);
      }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setScannedItem({ ...scannedItem, coverUrl: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddToShelf = () => {
      // 1. Check if Series Exists
      let targetSeries = series.find(s => s.title.toLowerCase() === scannedItem.title.toLowerCase());
      let seriesId = targetSeries?.id;
      let isNewSeries = false;

      // Use AI detected total volumes, or estimate if missing
      const totalVols = scannedItem.totalVolumes || Math.max(scannedItem.volumeNumber + 5, 12);

      if (!targetSeries) {
          isNewSeries = true;
          // Create new series
          seriesId = Math.random().toString(36).substr(2, 9);
          const newSeries: Series = {
              id: seriesId,
              title: scannedItem.title,
              author: scannedItem.author,
              coverUrl: scannedItem.coverUrl,
              totalVolumes: totalVols,
              ownedVolumes: 1,
              tags: scannedItem.tags || ['Shonen'], 
              status: scannedItem.status || 'Reading',
              publisher: scannedItem.publisher,
              dateAdded: new Date().toISOString()
          };
          addSeries(newSeries);
          targetSeries = newSeries;
      } else {
          // Update existing series counts
          // StoreContext updateSeries will handle adding missing volumes if totalVolumes increases
          updateSeries({
              ...targetSeries,
              ownedVolumes: targetSeries.ownedVolumes + 1,
              totalVolumes: Math.max(targetSeries.totalVolumes, totalVols)
          });
      }

      // 2. Add Volumes logic
      // If it's a new series, generate all volumes up to the total
      
      if (isNewSeries && targetSeries) {
          for (let i = 1; i <= targetSeries.totalVolumes; i++) {
               const isScanned = i === scannedItem.volumeNumber;
               const newVolume: Volume = {
                  id: Math.random().toString(36).substr(2, 9),
                  seriesId: seriesId!,
                  number: i,
                  // Use scanned cover for the specific volume, placeholder for others
                  coverUrl: isScanned ? scannedItem.coverUrl : PLACEHOLDER_COVER,
                  isOwned: isScanned,
                  isFavorite: false,
                  isInWishlist: false,
                  publishDate: isScanned ? (scannedItem.publishYear || new Date().toLocaleDateString('en-US', { year: 'numeric' })) : undefined,
                  condition: isScanned ? 'New' : undefined
              };
              addVolume(newVolume);
          }
      } else {
           // Standard Add Single Volume Logic for existing series
           // Check if it already exists to prevent dupes, or just overwrite/update
           // Note: updateSeries in store might have already added placeholders, so we should check and update the specific one
           // But for simplicity, we just add/overwrite here.
           const newVolume: Volume = {
              id: Math.random().toString(36).substr(2, 9),
              seriesId: seriesId!,
              number: scannedItem.volumeNumber,
              coverUrl: scannedItem.coverUrl,
              isOwned: true,
              isFavorite: false,
              isInWishlist: false,
              publishDate: scannedItem.publishYear || new Date().toLocaleDateString('en-US', { year: 'numeric' }),
              condition: 'New'
          };
          addVolume(newVolume);
      }

      // 3. Feedback & Navigation
      setShowResult(false);
      navigate('/library');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
      e.preventDefault();
      setIsEditing(false);
  };

  const reticleClass = mode === 'barcode' ? 'w-72 h-40' : 'w-64 h-[24rem]';

  return (
    <div className="bg-black h-full w-full flex flex-col relative overflow-hidden">
        {/* Camera Feed Layer */}
        <div className="absolute inset-0 z-0">
             <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted
                className="w-full h-full object-cover"
             />
             <div className="absolute inset-0 bg-black/40"></div>
             {/* Bottom Gradient for Nav Visibility */}
             <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-black via-black/80 to-transparent z-0"></div>
        </div>

        {/* Top Nav */}
        <header className="flex items-center justify-between px-6 pt-safe-pt mt-4 pb-4 z-20 absolute top-0 w-full">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-800/50 transition-colors text-white backdrop-blur-md">
                <Icon name="chevron_left" type="round" className="text-3xl" />
            </button>
            <h1 className="text-lg font-semibold tracking-wide text-white drop-shadow-md">Add New Manga</h1>
            <button className="p-2 -mr-2 rounded-full hover:bg-slate-800/50 transition-colors text-white opacity-0">
                <Icon name="more_horiz" type="round" className="text-2xl" />
            </button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-start px-6 relative z-10 w-full max-w-md mx-auto pt-20 pb-32">
            {/* Mode Switcher */}
             <div className="bg-black/50 p-1 rounded-full flex w-64 mb-4 backdrop-blur-md border border-white/10 shadow-lg shrink-0">
                <button 
                    onClick={() => setMode('barcode')}
                    className={`flex-1 py-1.5 px-4 rounded-full text-sm font-medium transition-all ${mode === 'barcode' ? 'bg-primary text-white shadow-sm' : 'text-slate-300 hover:text-white'}`}
                >
                    Barcode
                </button>
                <button 
                    onClick={() => setMode('cover')}
                    className={`flex-1 py-1.5 px-4 rounded-full text-sm font-medium transition-all ${mode === 'cover' ? 'bg-primary text-white shadow-sm' : 'text-slate-300 hover:text-white'}`}
                >
                    Cover
                </button>
            </div>

            {/* Instruction Text */}
            <div className="text-center space-y-1 z-20 mb-4 animate-fade-in shrink-0">
                <p className="text-white font-medium drop-shadow-sm text-lg">Scan {mode === 'barcode' ? 'Barcode' : 'Cover'}</p>
                <p className="text-slate-300 text-sm drop-shadow-md">Align the {mode} within the frame</p>
            </div>

            {/* Viewfinder Area */}
            <div className="relative flex items-center justify-center flex-grow w-full h-full min-h-0">
                <div 
                    className={`relative border border-white/20 rounded-xl transition-all duration-500 ease-out shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] ${reticleClass}`}
                    onClick={handleSimulateScan}
                >
                    {/* Corners */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg -mt-1 -ml-1"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg -mt-1 -mr-1"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg -mb-1 -ml-1"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg -mb-1 -mr-1"></div>
                    
                    {/* Scan Animation - Horizontal Line */}
                     <div className="absolute inset-x-2 overflow-hidden">
                        <div className="w-full h-0.5 bg-primary shadow-[0_0_15px_rgba(17,82,212,0.8)] absolute top-1/2 left-0 -translate-y-1/2 animate-[pulse_1.5s_infinite]"></div>
                     </div>
                </div>

                 {/* Flash Button */}
                 <button className="absolute top-4 right-4 p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors border border-white/10 z-30">
                    <Icon name="flash_on" type="round" className="text-xl" />
                </button>

                 {/* Zoom Controls */}
                 <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/60 px-1.5 py-1.5 rounded-full backdrop-blur-md border border-white/10 z-30">
                    <button onClick={() => handleZoom(0.5)} className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${zoomLevel === 0.5 ? 'bg-primary text-white shadow-sm' : 'text-white/70 hover:bg-white/10'}`}>.5x</button>
                    <button onClick={() => handleZoom(1)} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${zoomLevel === 1 ? 'bg-primary text-white shadow-sm' : 'text-white/70 hover:bg-white/10'}`}>1x</button>
                    <button onClick={() => handleZoom(2)} className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${zoomLevel === 2 ? 'bg-primary text-white shadow-sm' : 'text-white/70 hover:bg-white/10'}`}>2x</button>
                </div>
            </div>
            
            {/* Loading Indicator for AI */}
            {isLoading && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-white font-medium text-lg">Fetching details...</p>
                </div>
            )}
        </main>

        {/* Result Sheet */}
        <div className={`absolute inset-x-0 bottom-0 z-[60] transform transition-transform duration-300 ease-out ${showResult ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="bg-[#1e2532] border-t border-white/10 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] safe-pb">
                <div className="px-6 pt-3 pb-12">
                    <div className="w-full flex justify-center mb-6">
                        <div className="w-12 h-1.5 bg-slate-600/40 rounded-full"></div>
                    </div>
                    
                    <div className="flex gap-5">
                        <div className="relative w-24 h-36 flex-shrink-0 rounded-lg overflow-hidden shadow-lg group">
                            <img src={scannedItem.coverUrl} alt="Detected Cover" className="w-full h-full object-cover" />
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-start min-w-0 pt-1">
                             <div className="flex items-start justify-between">
                                <div>
                                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary mb-1.5 uppercase tracking-wider">Detected</span>
                                    <h3 className="text-white font-bold text-xl leading-tight truncate pr-2">{scannedItem.title} Vol. {scannedItem.volumeNumber}</h3>
                                    <p className="text-slate-400 text-sm mt-1">{scannedItem.author}</p>
                                </div>
                                <button onClick={() => setShowResult(false)} className="p-1 -mr-2 -mt-2 text-slate-400 hover:text-white transition-colors">
                                    <Icon name="close" type="round" className="text-2xl" />
                                </button>
                            </div>
                             <div className="flex items-center gap-2 mt-auto">
                                <span className="text-xs text-slate-400 bg-slate-800 border border-slate-700 px-2 py-1 rounded">{scannedItem.publisher}</span>
                                <span className="text-xs text-slate-400 bg-slate-800 border border-slate-700 px-2 py-1 rounded">{scannedItem.publishYear}</span>
                            </div>
                             <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-slate-400 bg-slate-800 border border-slate-700 px-2 py-1 rounded">Total Series: {scannedItem.totalVolumes} vols</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <p className="text-xs text-slate-500 mb-2 pl-1">Wrong information?</p>
                        <div className="grid grid-cols-5 gap-3">
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="col-span-2 py-3.5 px-4 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-white font-medium text-sm transition-colors border border-white/5"
                            >
                                Edit Details
                            </button>
                            <button 
                                onClick={handleAddToShelf}
                                className="col-span-3 py-3.5 px-4 rounded-xl bg-primary hover:bg-blue-600 text-white font-semibold text-sm shadow-[0_4px_14px_0_rgba(17,82,212,0.39)] transition-all flex items-center justify-center gap-2"
                            >
                                <Icon name="library_add" type="round" className="text-lg" />
                                Add to Shelf
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Edit Details Modal */}
        {isEditing && (
             <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setIsEditing(false)}>
                <div className="bg-[#1e2532] w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-slide-up border border-white/10 max-h-[90vh] overflow-y-auto no-scrollbar" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">Edit Scanned Item</h3>
                        <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white transition-colors">
                            <Icon name="close" type="round" />
                        </button>
                    </div>
                    
                    <form onSubmit={handleSaveEdit} className="space-y-4">
                        {/* Cover Image Edit */}
                        <div className="flex flex-col items-center mb-4">
                            <div 
                                className="relative group cursor-pointer w-24 h-36 rounded-lg overflow-hidden shadow-md bg-gray-100 dark:bg-gray-800"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <img 
                                    src={scannedItem.coverUrl} 
                                    alt="Cover" 
                                    className="w-full h-full object-cover transition-opacity group-hover:opacity-75" 
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Icon name="edit" className="text-white text-2xl" />
                                </div>
                            </div>
                            <button 
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="mt-2 text-xs font-medium text-primary hover:text-primary/80"
                            >
                                Change Cover
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleCoverUpload}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Series Title</label>
                            <input 
                                type="text" 
                                value={scannedItem.title} 
                                onChange={e => setScannedItem({...scannedItem, title: e.target.value})}
                                className="w-full bg-black/20 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                            />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Volume Number</label>
                             <input 
                                type="number" 
                                min="0"
                                value={scannedItem.volumeNumber} 
                                onChange={e => {
                                    const val = parseInt(e.target.value);
                                    if (!isNaN(val) && val >= 0) {
                                        setScannedItem({...scannedItem, volumeNumber: val});
                                    } else if (e.target.value === '') {
                                        setScannedItem({...scannedItem, volumeNumber: 0});
                                    }
                                }}
                                className="w-full bg-black/20 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Author</label>
                            <input 
                                type="text" 
                                value={scannedItem.author} 
                                onChange={e => setScannedItem({...scannedItem, author: e.target.value})}
                                className="w-full bg-black/20 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Publisher</label>
                            <input 
                                type="text" 
                                value={scannedItem.publisher} 
                                onChange={e => setScannedItem({...scannedItem, publisher: e.target.value})}
                                className="w-full bg-black/20 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                            />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Series Volumes</label>
                             <input 
                                type="number" 
                                min="1"
                                value={scannedItem.totalVolumes} 
                                onChange={e => setScannedItem({...scannedItem, totalVolumes: Math.max(1, parseInt(e.target.value) || 1)})}
                                className="w-full bg-black/20 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Year Released</label>
                            <input 
                                type="text" 
                                value={scannedItem.publishYear} 
                                onChange={e => setScannedItem({...scannedItem, publishYear: e.target.value})}
                                className="w-full bg-black/20 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                            />
                        </div>

                        <button type="submit" className="w-full py-3.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] mt-2">
                            Update
                        </button>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default Scanner;