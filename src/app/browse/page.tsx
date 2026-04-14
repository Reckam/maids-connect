
"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Star, Filter, ShieldCheck, Grid, List as ListIcon, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Mock data
  const maids = [
    { id: '1', full_name: 'Nalule Florence', district: 'Kampala', rating: 4.8, experience: 5, hourly_rate: 15000, skills: ['Cleaning', 'Cooking'] },
    { id: '2', full_name: 'Namubiru Mary', district: 'Entebbe', rating: 4.5, experience: 3, hourly_rate: 12000, skills: ['Laundry', 'Cleaning'] },
    { id: '3', full_name: 'Nakaweesi Prossy', district: 'Jinja', rating: 4.9, experience: 7, hourly_rate: 20000, skills: ['Child Care', 'Cooking'] },
  ];

  const filteredMaids = maids.filter(maid => 
    maid.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    maid.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-border py-12 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Find Domestic Help</h1>
              <p className="text-muted-foreground mt-2">Connecting you with vetted professional maids across Uganda.</p>
            </div>
            <Link href="/map">
              <Button variant="outline" className="rounded-full">
                <MapPin className="mr-2 w-4 h-4" /> View Map
              </Button>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                placeholder="Search by name or district..." 
                className="pl-11 h-12 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button className="h-12 px-8 rounded-xl bg-primary">
              <Filter className="mr-2 w-5 h-5" /> Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredMaids.map((maid) => (
            <Link key={maid.id} href={`/profile/${maid.id}`}>
              <Card className="h-full overflow-hidden border-none shadow-lg hover:shadow-xl transition-all group">
                <div className="relative h-64">
                  <img src={`https://picsum.photos/seed/${maid.id}/400/400`} alt={maid.full_name} className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                     <ShieldCheck className="w-3 h-3 text-primary" /> VERIFIED
                  </div>
                  <div className="absolute bottom-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    UGX {maid.hourly_rate.toLocaleString()}/hr
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg">{maid.full_name}</h3>
                  <p className="text-muted-foreground text-xs flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> {maid.district}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {maid.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-[10px] uppercase">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
