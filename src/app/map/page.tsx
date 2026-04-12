"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Shield, ChevronLeft, Search } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Dynamically import map components to avoid SSR errors with Leaflet
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

const LOCATIONS = [
  { id: '1', name: 'Nalule Florence', pos: [0.3476, 32.5825], district: 'Kampala', rating: 4.8 },
  { id: '2', name: 'Namubiru Mary', pos: [0.0512, 32.4637], district: 'Entebbe', rating: 4.5 },
  { id: '3', name: 'Nakaweesi Prossy', pos: [0.4475, 33.2032], district: 'Jinja', rating: 4.9 },
  { id: '4', name: 'Alupo Joyce', pos: [0.3176, 32.5925], district: 'Kampala', rating: 4.7 },
  { id: '5', name: 'Achieng Sarah', pos: [0.3925, 32.5123], district: 'Wakiso', rating: 5.0 },
];

export default function MapViewPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    // Import Leaflet directly on client side for icon fix
    import('leaflet').then((leaflet) => {
      setL(leaflet);
      // Fixing the default icon issue in Leaflet + Next.js
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
    });
  }, []);

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      {/* Map Toolbar */}
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
             <Input placeholder="Search locations..." className="pl-11 h-12 border-none bg-white rounded-xl focus-visible:ring-0" />
           </div>
           <Button className="h-12 px-6 rounded-xl">Locate</Button>
        </div>
      </div>

      <div className="flex-1 z-0 relative">
        {isMounted && L && (
          <MapContainer center={[0.3476, 32.5825]} zoom={9} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {LOCATIONS.map((loc) => (
              <Marker key={loc.id} position={loc.pos as [number, number]}>
                <Popup>
                  <div className="p-2 space-y-2 min-w-[150px]">
                    <div className="font-bold text-sm">{loc.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-600 fill-yellow-600" /> {loc.rating} Rating
                    </div>
                    <div className="text-xs">{loc.district}, Uganda</div>
                    <Link href={`/profile/${loc.id}`}>
                      <Button size="sm" className="w-full mt-2 h-8 text-[10px] rounded-lg">VIEW PROFILE</Button>
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
}