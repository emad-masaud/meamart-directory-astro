import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';

export function MediaManager({ t }: { t: Record<string, string> }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<{ url: string, key: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, WebP).');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large. Maximum size is 5MB.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadedImage(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadedImage(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = () => {
    if (uploadedImage) {
      navigator.clipboard.writeText(uploadedImage.url);
      // Optional: Add a toast notification here instead of alert in a real app
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Upload Area */}
      <Card className="rounded-3xl border border-zinc-200/50 bg-white/40 shadow-xs backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-900/40">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{t['catalog.media.title']}</CardTitle>
          <CardDescription className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{t['catalog.media.desc']}</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div 
            className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all ${
              isUploading 
                ? 'bg-zinc-50 border-zinc-300 dark:bg-zinc-800/50 dark:border-zinc-700' 
                : 'hover:border-primary/50 hover:bg-primary/5 cursor-pointer border-zinc-200 dark:border-zinc-700 dark:hover:bg-primary/10'
            }`}
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/png, image/jpeg, image/webp"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleUpload(e.target.files[0]);
                }
              }}
            />
            {isUploading ? (
              <div className="text-zinc-500 dark:text-zinc-400 font-bold flex flex-col items-center gap-3">
                <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t['catalog.media.uploading']}
              </div>
            ) : (
              <div className="space-y-3 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                </div>
                <div className="text-zinc-700 dark:text-zinc-300 font-bold">{t['catalog.media.drag']}</div>
                <div className="text-zinc-400 text-xs font-bold bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">PNG, JPG or WebP (max 5MB)</div>
              </div>
            )}
          </div>
          {error && <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm font-bold">{error}</div>}
        </CardContent>
      </Card>

      {/* Result Area */}
      <Card className="rounded-3xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/20">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{t['catalog.media.recent']}</CardTitle>
          <CardDescription className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Generated link for Google Sheets</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[250px] px-6 pb-6">
          {!uploadedImage && !error && (
            <div className="text-zinc-400 text-sm font-medium text-center py-16 flex flex-col items-center justify-center gap-3">
              <svg className="w-12 h-12 text-zinc-300 dark:text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              {t['catalog.media.no_images']}
            </div>
          )}

          {uploadedImage && (
            <div className="w-full space-y-5">
              <div className="aspect-video bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden flex items-center justify-center shadow-sm relative group p-2">
                <img src={uploadedImage.url} alt="Uploaded preview" className="max-h-full rounded-xl object-contain" />
              </div>
              <div className="space-y-3">
                <div className="p-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-mono text-zinc-600 dark:text-zinc-400 break-all overflow-hidden shadow-sm" dir="ltr">
                  {uploadedImage.url}
                </div>
                <Button 
                  onClick={copyToClipboard} 
                  className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-6 font-bold text-base shadow-md shadow-primary/20 transition-all"
                >
                  {t['catalog.media.copy_url']}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
