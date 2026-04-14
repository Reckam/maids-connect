
"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function BookingsPage() {
  const router = useRouter();

  // Mock data
  const bookings = [
    { id: '1', date: '2024-05-20', time: '09:00', duration: 4, total_price: 60000, status: 'pending', maid_name: 'Nalule Florence' },
    { id: '2', date: '2024-05-18', time: '14:00', duration: 2, total_price: 30000, status: 'completed', maid_name: 'Namubiru Mary' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-4xl font-bold tracking-tight">Booking History</h1>

        <div className="grid gap-4">
          {bookings.map(booking => (
            <Card key={booking.id} className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-4 flex-1">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="text-primary w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold">{booking.maid_name}</h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Kampala District
                          </p>
                        </div>
                      </div>
                      <Badge className="uppercase text-[10px] tracking-widest">{booking.status}</Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
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
                        <p className="text-sm font-bold text-primary">UGX {booking.total_price.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
