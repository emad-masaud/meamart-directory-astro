import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';

interface QrGeneratorProps {
  baseUrl: string;
  projectName: string;
  branchName: string;
  t: Record<string, string>;
}

export function QrGenerator({ baseUrl, projectName, branchName, t }: QrGeneratorProps) {
  const [source, setSource] = useState('qr_code');
  const [campaign, setCampaign] = useState('in_store');
  
  const parsedUrl = new URL(baseUrl);
  const proxyUrl = new URL(`/q/${projectName}/${branchName}`, parsedUrl.origin);
  const finalUrl = `${proxyUrl.toString()}?w=demo&utm_source=${encodeURIComponent(source)}&utm_medium=offline&utm_campaign=${encodeURIComponent(campaign)}`;

  const handleDownloadPng = (size: number, label: string) => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, size, size);
        
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `${branchName}-${campaign}-${label}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handleDownloadSvg = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const downloadLink = document.createElement('a');
    downloadLink.download = `${branchName}-${campaign}.svg`;
    downloadLink.href = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
    downloadLink.click();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Configuration Form */}
      <Card className="rounded-3xl border border-zinc-200/50 bg-white/40 shadow-xs backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-900/40">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{t['catalog.qr.title']}</CardTitle>
          <CardDescription className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{t['catalog.qr.desc']}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 px-6 pb-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Traffic Source (utm_source)</label>
            <input 
              type="text" 
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-zinc-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              placeholder="e.g. table_tent, front_door"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Campaign Name (utm_campaign)</label>
            <input 
              type="text" 
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-zinc-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              placeholder="e.g. summer_sale, table_1"
            />
          </div>

          <div className="pt-4 space-y-2">
            <label className="text-sm font-bold text-zinc-500 dark:text-zinc-400">Generated URL</label>
            <div className="p-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-mono text-zinc-600 dark:text-zinc-400 break-all overflow-hidden shadow-sm" dir="ltr">
              {finalUrl}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview & Download */}
      <Card className="rounded-3xl flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/20">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-700 mb-8 transition-transform hover:scale-105">
          <QRCode 
            id="qr-code-svg"
            value={finalUrl} 
            size={220}
            level="H" 
          />
        </div>
        
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <Button onClick={() => handleDownloadPng(300, 'small')} variant="outline" className="w-full justify-between rounded-full border-zinc-200 font-bold dark:border-zinc-700">
            <span>Small PNG (300x300)</span>
            <span className="text-xs text-zinc-400">For screens</span>
          </Button>
          <Button onClick={() => handleDownloadPng(600, 'medium')} className="w-full justify-between rounded-full font-bold bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20">
            <span>Medium PNG (600x600)</span>
            <span className="text-xs text-white/70">Recommended</span>
          </Button>
          <Button onClick={() => handleDownloadPng(1200, 'large')} variant="outline" className="w-full justify-between rounded-full border-zinc-200 font-bold dark:border-zinc-700">
            <span>Large PNG (1200x1200)</span>
            <span className="text-xs text-zinc-400">For printing</span>
          </Button>
          <Button onClick={handleDownloadSvg} variant="secondary" className="w-full justify-between rounded-full mt-2 font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700">
            <span>Vector SVG</span>
            <span className="text-xs text-zinc-500">Highest quality</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
