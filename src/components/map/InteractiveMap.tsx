'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Fix for default marker icon in Leaflet + Next.js
const defaultIcon = L.icon({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const LOCATIONS = [
  { id: '1', name: 'Nalule Florence', pos: [0.3476, 32.5825], district: 'Kampala', rating: 4.8 },
  { id: '2', name: 'Namubiru Mary', pos: [0.0512, 32.4637], district: 'Entebbe', rating: 4.5 },
  { id: '3', name: 'Nakaweesi Prossy', pos: [0.4475, 33.2032], district: 'Jinja', rating: 4.9 },
  { id: '4', name: 'Alupo Joyce', pos: [0.3176, 32.5925], district: 'Kampala', rating: 4.7 },
  { id: '5', name: 'Achieng Sarah', pos: [0.3925, 32.5123], district: 'Wakiso', rating: 5.0 },
];

export default function InteractiveMap() {
  return (
    <MapContainer 
      center={[0.3476, 32.5825]} 
      zoom={9} 
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {LOCATIONS.map((loc) => (
        <Marker 
          key={loc.id} 
          position={loc.pos as [number, number]} 
          icon={defaultIcon}
        >
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
  );
}
