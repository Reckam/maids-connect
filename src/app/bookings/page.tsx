"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const BOOKINGS = [
  { id: '1', role: 'maid', client: 'Sarah K.', status: 'pending', date: '2023-11-05', time: '09:00', duration: 4, price: 60000, services: ['Cleaning'] },
  { id: '2', role: 'maid', client: 'James M.', status: 'confirmed', date: '2023-11-06', time: '14:00', duration: 3, price: 45000, services: ['Cooking'] },
  { id: '3', role: 'maid', client: 'Namuli P.', status: 'completed', date: '2023-10-20', time: '10:00', duration: 8, price: 120000, services: ['Babysitting'] },
  { id: '4', role: 'maid', client: 'Okello D.', status: 'cancelled', date: '2023-10-15', time: '08:00', duration: 4, price: 60000, services: ['Cleaning'] },
];

export default function BookingsPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const BookingList = ({ status }: { status?: string }) => {
    const filtered = status ? BOOKINGS.filter(b => b.status === status) : BOOKINGS;

    if (filtered.length === 0) {
      return (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-border">
          <Calendar className="mx-auto w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold">No {status} bookings found</h3>
          <p className="text-muted-foreground">When you have bookings, they will appear here.</p>
        </div>
      );
    }

    return (
      <div className="grid gap-4">
        {filtered.map(booking => (
          <Card key={booking.id} className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden group">
            <CardContent className="p-0 flex flex-col md:flex-row">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="text-primary w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold">{booking.client}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Kampala, Central
                      </p>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(booking.status)} border-none uppercase text-[10px] tracking-widest px-3`}>
                    {booking.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-slate-50">
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase">Date</p>
                    <p className="text-sm font-medium flex items-center gap-1"><Calendar className="w-3 h-3" /> {booking.date}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase">Time</p>
                    <p className="text-sm font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> {booking.time}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase">Services</p>
                    <div className="flex flex-wrap gap-1">
                      {booking.services.map(s => <span key={s} className="text-xs font-medium">{s}</span>)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase">Total Pay</p>
                    <p className="text-sm font-bold text-primary">UGX {booking.price.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                   {booking.status === 'pending' && (
                     <>
                        <Button variant="outline" size="sm" className="rounded-full text-red-500 border-red-200 hover:bg-red-50">Reject</Button>
                        <Button size="sm" className="rounded-full bg-primary hover:bg-primary/90 px-6">Accept</Button>
                     </>
                   )}
                   {booking.status === 'confirmed' && (
                     <Button variant="outline" size="sm" className="rounded-full">Mark as Completed</Button>
                   )}
                   <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground group-hover:text-primary transition-colors">
                     View Details <ChevronRight className="ml-1 w-4 h-4" />
                   </Button>
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
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold tracking-tight">Your Bookings</h1>
          <Link href="/browse">
            <Button className="rounded-full bg-primary">New Booking</Button>
          </Link>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-white border border-border p-1 h-auto rounded-full">
            <TabsTrigger value="all" className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-white">All</TabsTrigger>
            <TabsTrigger value="pending" className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-white">Pending</TabsTrigger>
            <TabsTrigger value="confirmed" className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-white">Confirmed</TabsTrigger>
            <TabsTrigger value="completed" className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-white">Completed</TabsTrigger>
            <TabsTrigger value="cancelled" className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-white">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0"><BookingList /></TabsContent>
          <TabsContent value="pending" className="mt-0"><BookingList status="pending" /></TabsContent>
          <TabsContent value="confirmed" className="mt-0"><BookingList status="confirmed" /></TabsContent>
          <TabsContent value="completed" className="mt-0"><BookingList status="completed" /></TabsContent>
          <TabsContent value="cancelled" className="mt-0"><BookingList status="cancelled" /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}