import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, Check, Sparkles, AlertCircle } from 'lucide-react';

interface ImageUploadInputProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  helperText?: string;
  aspectRatio?: 'square' | 'banner' | 'product';
  presetOptions?: string[];
}

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  label,
  value,
  onChange,
  helperText,
  aspectRatio = 'square',
  presetOptions = [],
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isCustomUrlOpen, setIsCustomUrlOpen] = useState(false);
  const [urlInput, setUrlInput] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WebP, GIF)');
      return;
    }

    // Maximum size: 5MB for fast client encoding
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file is too large (max 5MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        onChange(e.target.result);
      }
    };
    reader.onerror = () => {
      setError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const heightClasses =
    aspectRatio === 'banner'
      ? 'h-32 w-full'
      : aspectRatio === 'product'
      ? 'h-44 w-full'
      : 'h-28 w-28';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-stone-700">{label}</label>
        <button
          type="button"
          onClick={() => setIsCustomUrlOpen(!isCustomUrlOpen)}
          className="text-[11px] text-amber-800 hover:text-amber-900 underline font-medium cursor-pointer"
        >
          {isCustomUrlOpen ? 'Hide URL link option' : 'Or paste image link / URL'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 p-2 rounded-xl border border-rose-200">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Direct File Dropzone / Click to Browse */}
      <div className="flex flex-col sm:flex-row items-start gap-4">
        {/* Preview Thumbnail */}
        {value ? (
          <div className="relative group shrink-0">
            <img
              src={value}
              alt="Uploaded preview"
              className={`${heightClasses} rounded-2xl object-cover border-2 border-amber-800/30 shadow-xs bg-stone-100`}
            />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute -top-2 -right-2 p-1 bg-stone-900 text-white rounded-full hover:bg-rose-600 shadow-md transition-colors cursor-pointer"
              title="Remove image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-full bg-stone-900/80 backdrop-blur-xs text-[10px] text-emerald-300 font-medium flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>Loaded</span>
            </div>
          </div>
        ) : (
          <div
            className={`${heightClasses} rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 hover:bg-amber-50/40 flex flex-col items-center justify-center text-center p-3 transition-colors shrink-0 text-stone-400`}
          >
            <ImageIcon className="w-6 h-6 mb-1 text-stone-300" />
            <span className="text-[11px] text-stone-400">No Image</span>
          </div>
        )}

        {/* Upload Zone */}
        <div className="flex-1 w-full space-y-2">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
              isDragging
                ? 'border-amber-700 bg-amber-50 scale-[0.99]'
                : 'border-stone-200 hover:border-amber-700/60 bg-stone-50/70 hover:bg-amber-50/20'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />
            <div className="w-9 h-9 rounded-full bg-white shadow-xs border border-stone-200 flex items-center justify-center text-amber-800">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-stone-800 block">
                Click to upload from device or Drag & Drop
              </span>
              <span className="text-[11px] text-stone-500 block">
                Supports PNG, JPG, WebP, GIF (Max 5MB)
              </span>
            </div>
          </div>

          {/* Preset Suggestions (if provided) */}
          {presetOptions.length > 0 && (
            <div className="pt-1">
              <div className="flex items-center gap-1 text-[11px] text-stone-500 mb-1.5 font-medium">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Or pick from high-res artisan presets:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {presetOptions.map((presetUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onChange(presetUrl)}
                    className="relative rounded-lg overflow-hidden border border-stone-200 hover:border-amber-700 transition-all cursor-pointer w-10 h-10 shrink-0"
                  >
                    <img
                      src={presetUrl}
                      alt={`Preset ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {value === presetUrl && (
                      <div className="absolute inset-0 bg-amber-900/60 flex items-center justify-center text-white">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom URL Fallback */}
          {isCustomUrlOpen && (
            <div className="pt-1">
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Paste direct image URL https://..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-amber-700 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (urlInput) onChange(urlInput);
                  }}
                  className="px-3 py-1.5 bg-stone-900 text-white font-bold text-xs rounded-xl hover:bg-stone-800 cursor-pointer shrink-0"
                >
                  Set URL
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {helperText && <p className="text-[11px] text-stone-400">{helperText}</p>}
    </div>
  );
};
