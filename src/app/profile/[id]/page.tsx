
"use client";

import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  MapPin, 
  Star, 
  Clock, 
  Briefcase, 
  CheckCircle2, 
  MessageSquare, 
  ChevronLeft,
  Loader2,
  ArrowLeft,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useDoc, useFirestore, useUser } from '@/firebase';
import { doc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function ProfileDetails() {
  const { id } = useParams();
  const { toast } = useToast();
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Booking Form State
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [duration, setDuration] = useState('2');

  const userRef = useMemo(() => (id && db ? doc(db, 'users', id as string) : null), [id, db]);
  const { data: profile, loading: isLoading } = useDoc(userRef);

  const handleBookNow = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to book a maid.",
        variant: "destructive",
      });
      router.push('/login');
      return;
    }
    setIsBookingOpen(true);
  };

  const confirmBooking = async () => {
    if (!db || !user || !profile) return;
    setIsSubmitting(true);

    const bookingData = {
      employer_id: user.uid,
      maid_id: id,
      date: bookingDate,
      time: bookingTime,
      duration: parseInt(duration),
      total_price: (profile.hourly_rate || 0) * parseInt(duration),
      status: 'pending',
      created_at: serverTimestamp(),
      services: profile.skills || [],
    };

    addDoc(collection(db, 'bookings'), bookingData)
      .then(() => {
        setIsSubmitting(false);
        setIsBookingOpen(false);
        toast({
          title: "Booking Requested",
          description: `Your request has been sent to ${profile.full_name}.`,
        });
        router.push('/bookings');
      })
      .catch(async (error) => {
        setIsSubmitting(false);
        const permissionError = new FirestorePermissionError({
          path: 'bookings',
          operation: 'create',
          requestResourceData: bookingData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <nav className="fixed top-0 w-full z-50 glass-morphism h-16 flex items-center px-6 md:px-12">
        <Button variant="ghost" size="icon" className="rounded-full mr-4" onClick={() => router.back()}>
            <ArrowLeft />
        </Button>
        <Link href="/browse">
          <Button variant="ghost" size="icon" className="rounded-full mr-4">
             <ChevronLeft />
          </Button>
        </Link>
        <span className="font-bold text-xl text-primary">Maid Profile</span>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="overflow-hidden border-none shadow-xl text-center">
              <div className="h-48 bg-primary/10 relative">
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                   <img src={profile.avatar_url || `https://picsum.photos/seed/${profile.id}/400/400`} alt={profile.full_name} className="w-full h-full object-cover" />
                </div>
              </div>
              <CardContent className="pt-20 pb-10 space-y-4">
                <div>
                   <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
                     {profile.full_name} {profile.is_verified && <ShieldCheck className="text-primary w-5 h-5" />}
                   </h1>
                   <p className="text-muted-foreground flex items-center justify-center gap-1 text-sm mt-1">
                     <MapPin className="w-4 h-4" /> {profile.district || 'Uganda'}
                   </p>
                </div>
                
                <div className="flex justify-center gap-6 py-4 border-y border-border">
                  <div className="text-center">
                    <p className="text-xl font-bold">{profile.rating || 0}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Rating</p>
                  </div>
                  <div className="text-center border-x border-border px-6">
                    <p className="text-xl font-bold">{profile.experience || 0}+</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Years</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">{profile.review_count || 0}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Reviews</p>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                   <p className="text-primary font-bold text-xl">UGX {profile.hourly_rate?.toLocaleString() || 'N/A'}/hr</p>
                   <Button onClick={handleBookNow} className="w-full h-12 bg-primary text-lg rounded-xl shadow-lg shadow-primary/20">Book Now</Button>
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
                   <span className="font-medium">{profile.availability || 'Not specified'}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-muted-foreground flex items-center gap-2">
                     <Briefcase className="w-4 h-4" /> Languages
                   </span>
                   <span className="font-medium">{(profile.languages || []).join(', ') || 'Not specified' }</span>
                 </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>About Me</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg leading-relaxed text-slate-700">
                  {profile.bio || 'No bio provided yet.'}
                </p>
                <div className="mt-8">
                  <h4 className="font-bold mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" /> Skills & Services
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(profile.skills || []).map((skill: string) => (
                      <Badge key={skill} className="bg-primary/10 text-primary border-none px-4 py-2 rounded-full text-sm">
                        {skill}
                      </Badge>
                    ))}
                    {(profile.skills || []).length === 0 && <p className='text-sm text-muted-foreground'>No skills listed.</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Reviews</h2>
              <div className="bg-white p-8 rounded-2xl border border-dashed text-center">
                 <Star className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                 <p className='text-sm text-muted-foreground italic'>No reviews yet for this professional.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Book {profile.full_name}</DialogTitle>
            <DialogDescription>
              Select a date and time for your cleaning or domestic service.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Date</Label>
              <Input
                id="date"
                type="date"
                className="col-span-3"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">Time</Label>
              <Input
                id="time"
                type="time"
                className="col-span-3"
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">Hours</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="How many hours?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Hours</SelectItem>
                  <SelectItem value="4">4 Hours (Half Day)</SelectItem>
                  <SelectItem value="8">8 Hours (Full Day)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="pt-4 border-t mt-2">
              <div className="flex justify-between items-center text-sm font-bold">
                 <span>Total Price:</span>
                 <span className="text-primary text-lg">UGX {(profile.hourly_rate * parseInt(duration)).toLocaleString()}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookingOpen(false)}>Cancel</Button>
            <Button 
              disabled={!bookingDate || !bookingTime || isSubmitting} 
              onClick={confirmBooking}
              className="bg-primary"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CalendarIcon className="w-4 h-4 mr-2" />}
              Send Booking Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
