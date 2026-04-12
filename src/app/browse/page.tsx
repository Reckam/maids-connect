"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Star, Filter, ShieldCheck, Grid, List as ListIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const DUMMY_MAIDS = [
  { id: '1', name: 'Nalule Florence', district: 'Kampala', skills: ['Cooking', 'Cleaning'], rate: 15000, rating: 4.8, reviews: 24, exp: 5, avatar: 'https://picsum.photos/seed/florence/400/400' },
  { id: '2', name: 'Namubiru Mary', district: 'Entebbe', skills: ['Babysitting', 'Cleaning'], rate: 12000, rating: 4.5, reviews: 15, exp: 3, avatar: 'https://picsum.photos/seed/mary/400/400' },
  { id: '3', name: 'Nakaweesi Prossy', district: 'Jinja', skills: ['Gardening', 'Cleaning'], rate: 18000, rating: 4.9, reviews: 42, exp: 8, avatar: 'https://picsum.photos/seed/prossy/400/400' },
  { id: '4', name: 'Alupo Joyce', district: 'Kampala', skills: ['Cooking', 'Laundry'], rate: 14000, rating: 4.7, reviews: 31, exp: 4, avatar: 'https://picsum.photos/seed/joyce/400/400' },
  { id: '5', name: 'Achieng Sarah', district: 'Wakiso', skills: ['Babysitting', 'First Aid'], rate: 20000, rating: 5.0, reviews: 12, exp: 6, avatar: 'https://picsum.photos/seed/sarah/400/400' },
  { id: '6', name: 'Atim Grace', district: 'Gulu', skills: ['Housekeeping', 'Laundry'], rate: 10000, rating: 4.2, reviews: 8, exp: 2, avatar: 'https://picsum.photos/seed/grace/400/400' },
];

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Search Header */}
      <div className="bg-white border-b border-border py-12 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Find Domestic Help</h1>
              <p className="text-muted-foreground mt-2">Connecting you with vetted professional maids across Uganda.</p>
            </div>
            <div className="flex items-center gap-2">
               <Link href="/map">
                 <Button variant="outline" className="rounded-full">
                    <MapPin className="mr-2 w-4 h-4" /> View Map
                 </Button>
               </Link>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                placeholder="Search by name, district, or skill..." 
                className="pl-11 h-12 bg-slate-50 border-none shadow-sm rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90">
              <Filter className="mr-2 w-5 h-5" /> Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <p className="text-muted-foreground font-medium">Showing <span className="text-foreground">{DUMMY_MAIDS.length}</span> profiles</p>
          <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-border">
            <Button size="icon" variant="ghost" className="bg-slate-100"><Grid className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost"><ListIcon className="w-4 h-4" /></Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {DUMMY_MAIDS.map((maid) => (
            <motion.div
              key={maid.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Link href={`/profile/${maid.id}`}>
                <Card className="h-full overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow group">
                  <div className="relative h-64">
                    <img 
                      src={maid.avatar} 
                      alt={maid.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                       <ShieldCheck className="w-3 h-3 text-primary" /> VERIFIED
                    </div>
                    <div className="absolute bottom-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      UGX {maid.rate.toLocaleString()}/hr
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                       <div>
                         <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{maid.name}</h3>
                         <p className="text-muted-foreground text-xs flex items-center gap-1 mt-1">
                           <MapPin className="w-3 h-3" /> {maid.district}, Uganda
                         </p>
                       </div>
                       <div className="flex items-center gap-1 bg-yellow-100 px-2 py-0.5 rounded-lg">
                         <Star className="w-3 h-3 text-yellow-600 fill-yellow-600" />
                         <span className="text-xs font-bold text-yellow-700">{maid.rating}</span>
                       </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {maid.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="bg-slate-100 text-slate-600 text-[10px] uppercase tracking-wider px-2">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
                       <p className="text-xs text-muted-foreground">{maid.exp} years exp.</p>
                       <Button size="sm" variant="ghost" className="text-primary font-bold group-hover:bg-primary group-hover:text-white transition-all rounded-full px-4">
                         View Details
                       </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}