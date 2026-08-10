import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Button } from './ui/button';

export function AiWriter({ t }: { t: Record<string, string> }) {
  const [productName, setProductName] = useState('');
  const [details, setDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ title: string, subtitle: string, description: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!productName) return;
    
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, details })
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to generate content');
      
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input Form */}
      <Card className="rounded-3xl border border-zinc-200/50 bg-white/40 shadow-xs backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-900/40">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{t['catalog.ai.title']}</CardTitle>
          <CardDescription className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{t['catalog.ai.desc']}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 px-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{t['catalog.ai.product_name']}</label>
            <input 
              type="text" 
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-zinc-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              placeholder={t['catalog.ai.product_placeholder']}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{t['catalog.ai.details']}</label>
            <textarea 
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-zinc-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all h-32 resize-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              placeholder={t['catalog.ai.details_placeholder']}
            />
          </div>
        </CardContent>
        <CardFooter className="px-6 pb-6">
          <Button 
            onClick={handleGenerate} 
            disabled={isLoading || !productName} 
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-6 font-bold text-base shadow-md shadow-primary/20 transition-all"
          >
            {isLoading ? t['catalog.ai.generating'] : t['catalog.ai.generate']}
          </Button>
        </CardFooter>
      </Card>

      {/* Output / Result */}
      <Card className="rounded-3xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/20">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{t['catalog.ai.output']}</CardTitle>
          <CardDescription className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{t['catalog.ai.output_desc']}</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 space-y-6">
          {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm font-bold">{error}</div>}
          
          {!result && !error && !isLoading && (
             <div className="text-zinc-400 text-sm font-medium text-center py-16 flex flex-col items-center justify-center gap-3">
               <svg className="w-12 h-12 text-zinc-300 dark:text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
               {t['catalog.ai.empty_output']}
             </div>
          )}

          {result && (
            <>
              <div className="bg-white dark:bg-zinc-800 p-5 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-700 space-y-2 relative group hover:border-primary/50 transition-colors">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Title</p>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50" dir="rtl">{result.title}</h3>
                <button 
                  onClick={() => copyToClipboard(result.title)}
                  className="absolute top-4 rtl:left-4 ltr:right-4 p-2 text-zinc-400 hover:text-primary bg-zinc-50 dark:bg-zinc-700 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                  title="Copy"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </button>
              </div>
              
              <div className="bg-white dark:bg-zinc-800 p-5 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-700 space-y-2 relative group hover:border-primary/50 transition-colors">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Subtitle</p>
                <p className="font-medium text-zinc-700 dark:text-zinc-300" dir="rtl">{result.subtitle}</p>
                <button 
                  onClick={() => copyToClipboard(result.subtitle)}
                  className="absolute top-4 rtl:left-4 ltr:right-4 p-2 text-zinc-400 hover:text-primary bg-zinc-50 dark:bg-zinc-700 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                  title="Copy"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </button>
              </div>

              <div className="bg-white dark:bg-zinc-800 p-5 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-700 space-y-2 relative group hover:border-primary/50 transition-colors">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Description</p>
                <div className="prose prose-sm dark:prose-invert" dir="rtl" dangerouslySetInnerHTML={{ __html: result.description }}></div>
                <button 
                  onClick={() => copyToClipboard(result.description)}
                  className="absolute top-4 rtl:left-4 ltr:right-4 p-2 text-zinc-400 hover:text-primary bg-zinc-50 dark:bg-zinc-700 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                  title="Copy"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
