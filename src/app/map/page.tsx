"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { Shield, ChevronLeft, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Dynamically import the consolidated map component with SSR disabled
const InteractiveMap = dynamic(
  () => import('@/components/map/InteractiveMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium">Loading Interactive Map...</p>
        </div>
      </div>
    )
  }
);

export default function MapViewPage() {
  return (
    <div className="h-screen w-full flex flex-col overflow-hidden relative">
      {/* Map Toolbar - Absolute positioned to stay above the map */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="glass-morphism rounded-full p-2 pr-6 flex items-center gap-4 shadow-xl">
          <Link href="/browse">
            <Button size="icon" variant="ghost" className="rounded-full bg-white shadow-sm">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="text-primary w-6 h-6" />
            <span className="font-bold text-lg text-primary tracking-tight">Maids Connect</span>
          </div>
        </div>

        <div className="glass-morphism p-1 rounded-2xl flex items-center gap-2 w-full md:max-w-md shadow-xl">
           <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
             <Input 
                placeholder="Search locations..." 
                className="pl-11 h-12 border-none bg-white rounded-xl focus-visible:ring-0" 
             />
           </div>
           <Button className="h-12 px-6 rounded-xl">Locate</Button>
        </div>
      </div>

      {/* Full Screen Map Container */}
      <div className="flex-1 z-0 relative">
        <InteractiveMap />
      </div>
    </div>
  );
}
