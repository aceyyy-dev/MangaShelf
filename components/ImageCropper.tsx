import React, { useState, useRef, useEffect } from 'react';
import Icon from './Icon';

interface ImageCropperProps {
  imageSrc: string;
  aspectRatio?: number; // width / height
  cropShape?: 'circle' | 'rect';
  onCancel: () => void;
  onCropComplete: (croppedImage: string) => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ 
  imageSrc, 
  aspectRatio = 1, 
  cropShape = 'rect', 
  onCancel, 
  onCropComplete 
}) => {
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(0.1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Frame dimensions
  const FRAME_WIDTH = 280;
  const FRAME_HEIGHT = FRAME_WIDTH / aspectRatio;

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    setOffset({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        // Logic: fit the image into the view nicely
        const widthRatio = clientWidth / naturalWidth;
        const heightRatio = clientHeight / naturalHeight;
        
        // Fit within 80% of the screen initially so it's not "too big"
        const fitScale = Math.min(widthRatio, heightRatio) * 0.8; 
        
        // Set the minimum zoom to allow shrinking significantly if needed
        setMinZoom(fitScale * 0.5); 
        // Set initial zoom
        setZoom(fitScale);
    }
  };

  const handleSave = () => {
    const canvas = document.createElement('canvas');
    const img = imageRef.current;
    if (!img) return;

    // High resolution output
    const scaleFactor = 2; 
    canvas.width = FRAME_WIDTH * scaleFactor;
    canvas.height = FRAME_HEIGHT * scaleFactor;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Background color (black for transparency fill)
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate source rectangle
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;
      
      // Rendered dimensions
      const renderedWidth = naturalWidth * zoom;
      const renderedHeight = naturalHeight * zoom;

      // Center of the container
      const containerW = containerRef.current?.clientWidth || window.innerWidth;
      const containerH = containerRef.current?.clientHeight || window.innerHeight;
      
      // Image center position relative to container center, plus user offset
      const imgCenterX = (containerW / 2) + offset.x;
      const imgCenterY = (containerH / 2) + offset.y;
      
      // Top-left of the image in container coordinates
      const imgLeft = imgCenterX - (renderedWidth / 2);
      const imgTop = imgCenterY - (renderedHeight / 2);

      // Frame position (centered in container)
      const frameLeft = (containerW - FRAME_WIDTH) / 2;
      const frameTop = (containerH - FRAME_HEIGHT) / 2;

      // Calculate where the frame is relative to the image top-left
      const relativeFrameX = frameLeft - imgLeft;
      const relativeFrameY = frameTop - imgTop;

      // Map to intrinsic coordinates
      const sx = relativeFrameX / zoom;
      const sy = relativeFrameY / zoom;
      const sWidth = FRAME_WIDTH / zoom;
      const sHeight = FRAME_HEIGHT / zoom;

      ctx.drawImage(
        img,
        sx, sy, sWidth, sHeight, // Source
        0, 0, canvas.width, canvas.height // Dest
      );
      
      onCropComplete(canvas.toDataURL('image/jpeg', 0.9));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-4 absolute top-0 w-full z-20 bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={onCancel} className="text-white p-2 flex items-center gap-1">
          <Icon name="close" /> Cancel
        </button>
        <button 
            onClick={handleSave} 
            className="bg-white text-black px-4 py-1.5 rounded-full text-sm font-bold shadow-lg"
        >
          Choose
        </button>
      </div>

      {/* Workspace */}
      <div 
        className="flex-1 relative overflow-hidden flex items-center justify-center bg-[#111]"
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <img 
          ref={imageRef}
          src={imageSrc}
          onLoad={handleImageLoad}
          alt="Edit"
          draggable={false}
          className="max-w-none absolute transition-transform duration-75 ease-linear select-none"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        />

        {/* Overlay Mask */}
        <div className="absolute inset-0 pointer-events-none z-10">
           <div className="w-full h-full relative">
               {/* The Cutout */}
               <div 
                 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 box-content border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.8)]"
                 style={{
                    width: FRAME_WIDTH,
                    height: FRAME_HEIGHT,
                    borderRadius: cropShape === 'circle' ? '50%' : '12px'
                 }}
               ></div>
           </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="bg-[#111] px-8 py-8 pb-safe-pb z-20 border-t border-white/10">
        <div className="flex items-center gap-4">
             <Icon name="zoom_out" className="text-gray-400" />
             <input 
                type="range" 
                min={minZoom}
                max={Math.max(minZoom * 5, 2)} 
                step={minZoom / 10}
                value={zoom} 
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-white h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
             />
             <Icon name="zoom_in" className="text-gray-400" />
        </div>
        <p className="text-center text-gray-500 text-xs mt-4 font-medium">
            Drag to move • Pinch to zoom
        </p>
      </div>
    </div>
  );
};

export default ImageCropper;