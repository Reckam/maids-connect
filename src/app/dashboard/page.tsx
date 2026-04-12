"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Search, 
  Map as MapIcon, 
  User, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Star,
  Settings,
  LogOut,
  Menu,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';

export default function Dashboard() {
  const [userRole, setUserRole] = useState<'maid' | 'employer'>('employer'); // Toggle for dev preview
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulated auth check
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-white border-r border-border hidden lg:flex flex-col">
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <ShieldCheck className="text-primary h-6 w-6" />
            <span className="font-bold text-xl text-primary">Maids Connect</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 text-primary font-medium">
            <TrendingUp className="w-5 h-5" /> Dashboard
          </Link>
          <Link href="/browse" className="flex items-center gap-3 p-3 rounded-xl text-muted-foreground hover:bg-slate-50 transition-colors">
            <Search className="w-5 h-5" /> Browse
          </Link>
          <Link href="/map" className="flex items-center gap-3 p-3 rounded-xl text-muted-foreground hover:bg-slate-50 transition-colors">
            <MapIcon className="w-5 h-5" /> Map View
          </Link>
          <Link href="/bookings" className="flex items-center gap-3 p-3 rounded-xl text-muted-foreground hover:bg-slate-50 transition-colors">
            <Calendar className="w-5 h-5" /> Bookings
          </Link>
          <Link href="/profile" className="flex items-center gap-3 p-3 rounded-xl text-muted-foreground hover:bg-slate-50 transition-colors">
            <User className="w-5 h-5" /> My Profile
          </Link>
        </nav>
        <div className="p-4 border-t border-border space-y-2">
          <Link href="/settings" className="flex items-center gap-3 p-3 rounded-xl text-muted-foreground hover:bg-slate-50 transition-colors">
            <Settings className="w-5 h-5" /> Settings
          </Link>
          <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10">
            <LogOut className="w-5 h-5 mr-3" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, Sarah! 👋</h1>
            <p className="text-muted-foreground">Here's what's happening today.</p>
          </div>
          <div className="flex items-center gap-4">
             <Button variant="outline" size="icon" className="lg:hidden">
               <Menu />
             </Button>
             <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
               <img src="https://picsum.photos/seed/user123/48/48" alt="Profile" />
             </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-primary/10 p-4 rounded-2xl">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Bookings</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-green-100 p-4 rounded-2xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed Jobs</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-yellow-100 p-4 rounded-2xl">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold">4.8</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-blue-100 p-4 rounded-2xl">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Scheduled Today</p>
                <p className="text-2xl font-bold">1</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Section & Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Upcoming Bookings</h2>
              <Link href="/bookings" className="text-primary text-sm font-medium hover:underline">View All</Link>
            </div>
            
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-48 h-32 md:h-auto bg-slate-100">
                      <img src={`https://picsum.photos/seed/booking${i}/200/200`} alt="Job" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-6 flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-lg">{userRole === 'employer' ? "Namubiru Mary" : "Nalule House Cleaning"}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapIcon className="w-3 h-3" /> Kampala, Makindye
                          </p>
                        </div>
                        <div className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                          CONFIRMED
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm mt-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>Oct {24 + i}, 2023</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>09:00 AM - 01:00 PM</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6">
             <h2 className="text-xl font-bold">Quick Actions</h2>
             <div className="grid grid-cols-1 gap-4">
                <Link href="/browse">
                  <Button className="w-full h-16 bg-primary text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all">
                    Find a Maid
                  </Button>
                </Link>
                <Link href="/map">
                  <Button variant="secondary" className="w-full h-16 bg-white border border-border text-lg font-bold rounded-2xl hover:bg-slate-50 transition-all">
                    View Interactive Map
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" className="w-full h-16 text-lg font-bold rounded-2xl hover:bg-primary/5 transition-all">
                    Update My Profile
                  </Button>
                </Link>
             </div>
             
             <Card className="bg-gradient-to-br from-primary to-secondary text-white border-none shadow-xl overflow-hidden relative">
               <div className="p-6 relative z-10">
                 <h3 className="text-xl font-bold mb-2">Did you know?</h3>
                 <p className="text-white/80 text-sm">
                   Verified maids get 3x more bookings! Update your ID today.
                 </p>
                 <Button variant="secondary" className="mt-4 bg-white text-primary rounded-full px-6 h-9 font-bold text-xs">
                   LEARN MORE
                 </Button>
               </div>
               <div className="absolute -bottom-4 -right-4 bg-white/10 w-24 h-24 rounded-full" />
             </Card>
          </div>
        </div>
      </main>
    </div>
  );
}