
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
  Calendar as CalendarIcon,
  AlertTriangle,
  UserX
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function ProfileDetails() {
  const { id } = useParams();
  const { toast } = useToast();
  const router = useRouter();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Booking Form State
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [duration, setDuration] = useState('2');

  // Report Form State
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');

  // Mock data, since we're not fetching from Firebase anymore
  const profile = {
    id: '1',
    full_name: 'Jane Doe',
    is_verified: true,
    district: 'Kampala',
    rating: 4.5,
    experience: 5,
    review_count: 12,
    hourly_rate: 15000,
    bio: 'Experienced and reliable domestic worker with over 5 years of experience. I am passionate about providing a clean and comfortable environment for my clients.',
    skills: ['Cleaning', 'Cooking', 'Laundry', 'Child Care'],
    avatar_url: `https://picsum.photos/seed/${id}/400/400`,
  };

  const reviews = [
    {
      id: '1',
      rating: 5,
      comment: 'Jane is fantastic! She is very thorough and efficient. I would highly recommend her.',
      created_at: { seconds: new Date().getTime() / 1000 },
    },
    {
      id: '2',
      rating: 4,
      comment: 'Good service, but was a little late.',
      created_at: { seconds: new Date().getTime() / 1000 },
    },
  ];

  const isLoading = false;

  const handleBookNow = () => {
    toast({ title: "Booking not implemented" });
    setIsBookingOpen(true);
  };

  const confirmBooking = async () => {
    setIsSubmitting(true);
    toast({ title: "Booking not implemented" });
    setIsSubmitting(false);
    setIsBookingOpen(false);
  };

  const submitReport = async () => {
    setIsSubmitting(true);
    toast({ title: "Reporting not implemented" });
    setIsSubmitting(false);
    setIsReportOpen(false);
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
        <span className="font-bold text-xl text-primary">Professional Profile</span>
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
                    <p className="text-xl font-bold">{profile.rating || '0.0'}</p>
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

            <Button 
              variant="ghost" 
              className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
              onClick={() => setIsReportOpen(true)}
            >
              <AlertTriangle className="mr-2 w-4 h-4" /> Report this profile
            </Button>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-lg">
              <CardHeader>
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
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Client Reviews</h2>
              <div className="space-y-4">
                {reviews?.map(review => (
                  <Card key={review.id} className="border-none shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center gap-1">
                           {[...Array(5)].map((_, i) => (
                             <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
                           ))}
                         </div>
                         <span className="text-xs text-muted-foreground">{new Date(review.created_at?.seconds * 1000).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-700 italic">"{review.comment}"</p>
                    </CardContent>
                  </Card>
                ))}
                {(!reviews || reviews.length === 0) && (
                  <div className="bg-white p-12 rounded-2xl border border-dashed text-center">
                    <Star className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                    <p className='text-sm text-muted-foreground italic'>No reviews yet for this professional.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
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
          </div>
          <DialogFooter>
            <Button disabled={isSubmitting} onClick={confirmBooking} className="bg-primary w-full">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CalendarIcon className="w-4 h-4 mr-2" />}
              Send Booking Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserX className="w-5 h-5 text-red-500" /> Report Profile
            </DialogTitle>
            <DialogDescription>
              Tell us why you are reporting this user. Your report is anonymous.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason for Report</Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="misleading">Misleading Profile</SelectItem>
                  <SelectItem value="inappropriate">Inappropriate Behavior</SelectItem>
                  <SelectItem value="safety">Safety Concerns</SelectItem>
                  <SelectItem value="spam">Spam or Fake Account</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Details (Optional)</Label>
              <Textarea 
                placeholder="Provide more context..." 
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReportOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              disabled={!reportReason || isSubmitting} 
              onClick={submitReport}
            >
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
