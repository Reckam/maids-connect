
"use client";

import React, { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User, ChevronRight, Loader2, ArrowLeft, Star, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { useUser, useCollection, useFirestore } from '@/firebase';
import { collection, query, where, or, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function BookingsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bookingsQuery = useMemo(() => {
    if (!user || !db) return null;
    return query(
      collection(db, 'bookings'),
      or(
        where('employer_id', '==', user.uid),
        where('maid_id', '==', user.uid)
      )
    );
  }, [user, db]);

  const { data: bookings, loading: isLoading } = useCollection(bookingsQuery);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    if (!db) return;
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, { status: newStatus });
    toast({ title: "Booking Updated", description: `Status changed to ${newStatus}.` });
  };

  const handleReviewSubmit = async () => {
    if (!db || !user || !selectedBooking) return;
    setIsSubmitting(true);

    const reviewData = {
      booking_id: selectedBooking.id,
      reviewer_id: user.uid,
      reviewee_id: selectedBooking.maid_id,
      rating: reviewRating,
      comment: reviewComment,
      created_at: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'reviews'), reviewData);
      // Mark booking as reviewed if needed, or just toast
      setIsReviewOpen(false);
      toast({ title: "Review Submitted", description: "Thank you for your feedback!" });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const BookingList = ({ status }: { status?: string }) => {
    const filtered = status ? bookings.filter(b => b.status === status) : bookings;

    if (isLoading) {
        return <div className='grid place-content-center h-40'><Loader2 className='animate-spin text-primary'/></div>
    }

    if (filtered.length === 0) {
      return (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-border">
          <Calendar className="mx-auto w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold">No {status} bookings found</h3>
          <p className="text-muted-foreground">Your history will appear here once bookings are created.</p>
        </div>
      );
    }

    return (
      <div className="grid gap-4">
        {filtered.map(booking => (
          <Card key={booking.id} className="border-none shadow-sm hover:shadow-md transition-all group">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-4 flex-1">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="text-primary w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold">Booking #{booking.id.slice(0, 8)}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> Kampala District
                        </p>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(booking.status)} border-none uppercase text-[10px] tracking-widest px-3`}>
                      {booking.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-slate-50">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase mb-1">Date</p>
                      <p className="text-sm font-medium flex items-center gap-1"><Calendar className="w-3 h-3" /> {booking.date}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase mb-1">Time</p>
                      <p className="text-sm font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> {booking.time}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase mb-1">Duration</p>
                      <p className="text-sm font-medium">{booking.duration} hrs</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase mb-1">Total Pay</p>
                      <p className="text-sm font-bold text-primary">UGX {booking.total_price?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-end gap-2 md:w-48">
                   {booking.status === 'pending' && booking.maid_id === user?.uid && (
                     <Button 
                       size="sm" 
                       className="w-full bg-green-500 hover:bg-green-600 rounded-full"
                       onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                     >
                       Confirm Booking
                     </Button>
                   )}
                   {booking.status === 'confirmed' && (
                     <Button 
                       size="sm" 
                       className="w-full bg-primary rounded-full"
                       onClick={() => handleUpdateStatus(booking.id, 'completed')}
                     >
                       Mark Completed
                     </Button>
                   )}
                   {booking.status === 'completed' && booking.employer_id === user?.uid && (
                     <Button 
                       size="sm" 
                       variant="outline" 
                       className="w-full rounded-full border-primary text-primary"
                       onClick={() => {
                         setSelectedBooking(booking);
                         setIsReviewOpen(true);
                       }}
                     >
                       <Star className="mr-2 w-3 h-3" /> Leave Review
                     </Button>
                   )}
                   <Link href={`/profile/${booking.maid_id}`} className="w-full">
                     <Button variant="ghost" size="sm" className="w-full rounded-full text-muted-foreground">
                       View Profile <ChevronRight className="ml-1 w-4 h-4" />
                     </Button>
                   </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <Button variant="outline" size="icon" className="bg-white border-slate-200 hover:bg-slate-100 shadow-md"
            onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold tracking-tight">Booking History</h1>
          <Link href="/browse">
            <Button className="rounded-full bg-primary">Book New Maid</Button>
          </Link>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-white border border-border p-1 h-auto rounded-full w-full justify-start overflow-x-auto">
            <TabsTrigger value="all" className="rounded-full px-6 flex-1">All</TabsTrigger>
            <TabsTrigger value="pending" className="rounded-full px-6 flex-1">Pending</TabsTrigger>
            <TabsTrigger value="confirmed" className="rounded-full px-6 flex-1">Confirmed</TabsTrigger>
            <TabsTrigger value="completed" className="rounded-full px-6 flex-1">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0"><BookingList /></TabsContent>
          <TabsContent value="pending" className="mt-0"><BookingList status="pending" /></TabsContent>
          <TabsContent value="confirmed" className="mt-0"><BookingList status="confirmed" /></TabsContent>
          <TabsContent value="completed" className="mt-0"><BookingList status="completed" /></TabsContent>
        </Tabs>
      </div>

      {/* Review Dialog */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
            <DialogDescription>
              How was your experience with this service provider?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  onClick={() => setReviewRating(star)}
                  className="focus:outline-none"
                >
                  <Star className={`w-8 h-8 ${star <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Your Comment</Label>
              <Textarea 
                placeholder="Share your feedback..." 
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewOpen(false)}>Cancel</Button>
            <Button disabled={isSubmitting} onClick={handleReviewSubmit} className="bg-primary">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MessageSquare className="mr-2 w-4 h-4" />}
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
