import React, { useRef } from 'react';
import { Camera, X } from 'lucide-react';

export default function PhotoUpload({ photos, onPhotosChange, maxPhotos = 1 }) {
  const inputRef = useRef(null);

  const handleFiles = (files) => {
    const imageFiles = Array.from(files).filter(f =>
      f.type.match('image/(jpeg|png|webp)') && f.size <= 10 * 1024 * 1024
    );
    if (imageFiles.length > 0) {
      onPhotosChange([imageFiles[0]]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:border-white/40 hover:bg-white/10 transition-colors cursor-pointer"
      >
        <Camera size={40} className="mx-auto text-white/40 mb-3" />
        <p className="text-sm font-medium text-white/80">Tap to take a photo or upload</p>
        <p className="text-xs text-white/50 mt-1">JPEG, PNG, WebP — max 10MB each</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {photos.length > 0 && (
        <div className="relative w-full h-48 rounded-xl overflow-hidden">
          <img
            src={URL.createObjectURL(photos[0])}
            alt=""
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => onPhotosChange([])}
            className="absolute top-2 right-2 w-7 h-7 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <X size={14} className="text-white" />
          </button>
        </div>
      )}

      <p className="text-xs text-white/40">{photos.length}/1 photo</p>
    </div>
  );
}
