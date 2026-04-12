"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  MapPin, 
  Star, 
  Clock, 
  Briefcase, 
  CheckCircle2, 
  MessageSquare, 
  ChevronLeft,
  Calendar as CalendarIcon,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { aidMaidBioCreation } from '@/ai/flows/aid-maid-bio-creation';
import { useToast } from '@/hooks/use-toast';

export default function ProfileDetails() {
  const { id } = useParams();
  const { toast } = useToast();
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);

  // Mock data fetching based on ID
  const maid = {
    id: '1',
    name: 'Nalule Florence',
    district: 'Kampala',
    skills: ['Cooking', 'Cleaning', 'Babysitting', 'Laundry'],
    rate: 15000,
    rating: 4.8,
    reviews: [
      { id: '1', user: 'Sarah K.', comment: 'Very professional and punctual!', rating: 5, date: 'Oct 12, 2023' },
      { id: '2', user: 'James M.', comment: 'Excellent cooking skills.', rating: 4, date: 'Sep 28, 2023' },
    ],
    exp: 5,
    bio: 'Dedicated domestic worker with over 5 years of experience in Kampala. Specialized in professional cleaning and Ugandan local cuisine.',
    languages: ['Luganda', 'English'],
    availability: 'Monday - Saturday',
    avatar: 'https://picsum.photos/seed/florence/400/400'
  };

  const handleBookNow = () => {
    toast({
      title: "Booking Initiated",
      description: "Redirecting you to the booking form...",
    });
    // Link to booking page with maid ID
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <nav className="fixed top-0 w-full z-50 glass-morphism h-16 flex items-center px-6 md:px-12">
        <Link href="/browse">
          <Button variant="ghost" size="icon" className="rounded-full mr-4">
             <ChevronLeft />
          </Button>
        </Link>
        <span className="font-bold text-xl text-primary">Maid Profile</span>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Summary */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="overflow-hidden border-none shadow-xl text-center">
              <div className="h-48 bg-primary/10 relative">
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                   <img src={maid.avatar} alt={maid.name} className="w-full h-full object-cover" />
                </div>
              </div>
              <CardContent className="pt-20 pb-10 space-y-4">
                <div>
                   <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
                     {maid.name} <ShieldCheck className="text-primary w-5 h-5" />
                   </h1>
                   <p className="text-muted-foreground flex items-center justify-center gap-1 text-sm mt-1">
                     <MapPin className="w-4 h-4" /> {maid.district}, Uganda
                   </p>
                </div>
                
                <div className="flex justify-center gap-6 py-4 border-y border-border">
                  <div className="text-center">
                    <p className="text-xl font-bold">{maid.rating}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Rating</p>
                  </div>
                  <div className="text-center border-x border-border px-6">
                    <p className="text-xl font-bold">{maid.exp}+</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Years</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">{maid.reviews.length}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Reviews</p>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                   <p className="text-primary font-bold text-xl">UGX {maid.rate.toLocaleString()}/hr</p>
                   <Button onClick={handleBookNow} className="w-full h-12 bg-primary text-lg rounded-xl">Book Now</Button>
                   <Button variant="outline" className="w-full h-12 border-primary text-primary rounded-xl">
                     <MessageSquare className="mr-2 w-4 h-4" /> Contact
                   </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-muted-foreground flex items-center gap-2">
                     <Clock className="w-4 h-4" /> Availability
                   </span>
                   <span className="font-medium">{maid.availability}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-muted-foreground flex items-center gap-2">
                     <Briefcase className="w-4 h-4" /> Languages
                   </span>
                   <span className="font-medium">{maid.languages.join(', ')}</span>
                 </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Skills, Bio, Reviews */}
          <div className="lg:col-span-2 space-y-8">
            {/* Bio Section with AI Assistant Link */}
            <Card className="border-none shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>About Me</CardTitle>
                <div className="flex gap-2">
                   {/* This button is only visible to the profile owner normally */}
                   <Button variant="ghost" size="sm" className="text-primary gap-1" disabled={isGeneratingBio}>
                     <Sparkles className="w-4 h-4" /> 
                     <span className="hidden sm:inline">AI Bio Optimizer</span>
                   </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg leading-relaxed text-slate-700">
                  {maid.bio}
                </p>
                <div className="mt-8">
                  <h4 className="font-bold mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" /> Skills & Services
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {maid.skills.map(skill => (
                      <Badge key={skill} className="bg-primary/10 text-primary border-none px-4 py-2 rounded-full text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Reviews ({maid.reviews.length})</h2>
              {maid.reviews.map(review => (
                <Card key={review.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-primary">
                          {review.user.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold">{review.user}</p>
                          <p className="text-xs text-muted-foreground">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500">
                         {Array.from({ length: review.rating }).map((_, i) => (
                           <Star key={i} className="w-4 h-4 fill-current" />
                         ))}
                      </div>
                    </div>
                    <p className="text-slate-600">"{review.comment}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}