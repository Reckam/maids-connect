
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const getMarkerIcon = () => {
  if (typeof window === 'undefined') return undefined;
  return L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const LOCATIONS = [
  { id: '1', name: 'Nalule Florence', pos: [0.3476, 32.5825], district: 'Kampala', rating: 4.8 },
  { id: '2', name: 'Namubiru Mary', pos: [0.0512, 32.4637], district: 'Entebbe', rating: 4.5 },
  { id: '3', name: 'Nakaweesi Prossy', pos: [0.4475, 33.2032], district: 'Jinja', rating: 4.9 },
  { id: '4', name: 'Alupo Joyce', pos: [0.3176, 32.5925], district: 'Kampala', rating: 4.7 },
  { id: '5', name: 'Achieng Sarah', pos: [0.3925, 32.5123], district: 'Wakiso', rating: 5.0 },
];

export default function InteractiveMap() {
  const [isMounted, setIsMounted] = useState(false);
  const [markerIcon, setMarkerIcon] = useState<L.Icon | undefined>(undefined);
  
  // Use a stable but unique session key to force a fresh DOM node for the map container
  // This effectively resolves the "Map container already initialized" error during hot-reloads
  const mountKey = useMemo(() => `map-instance-${Math.random().toString(36).substr(2, 9)}`, []);

  useEffect(() => {
    setIsMounted(true);
    setMarkerIcon(getMarkerIcon());
    return () => setIsMounted(false);
  }, []);

  if (!isMounted || !markerIcon) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-50">
        <p className="text-muted-foreground font-medium animate-pulse">Loading Map...</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative" key={mountKey}>
      <MapContainer 
        center={[0.3476, 32.5825] as [number, number]} 
        zoom={9} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {LOCATIONS.map((loc) => (
          <Marker key={loc.id} position={loc.pos as [number, number]} icon={markerIcon}>
            <Popup>
              <div className="p-2 space-y-2 min-w-[150px]">
                <div className="font-bold text-sm">{loc.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-600 fill-yellow-600" /> {loc.rating}
                </div>
                <div className="text-xs">{loc.district}</div>
                <Link href={`/profile/${loc.id}`}>
                  <Button size="sm" className="w-full mt-2 h-8 text-[10px] rounded-lg">VIEW PROFILE</Button>
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
