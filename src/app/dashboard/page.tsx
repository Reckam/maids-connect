
"use client";

import React, { useMemo } from 'react';
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
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { useUser, useDoc, useFirestore, useAuth } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';

export default function Dashboard() {
  const user = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  const userDocRef = useMemo(() => (user && db ? doc(db, 'users', user.uid) : null), [user, db]);
  const { data: profile, loading: isLoading } = useDoc(userDocRef);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="animate-spin text-primary w-10 h-10" />
    </div>
  );

  const isAdmin = profile?.user_type === 'admin';
  const isMaid = profile?.user_type === 'maid';
  const isVerified = profile?.is_verified === true;

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
          {isAdmin && (
            <Link href="/admin" className="flex items-center gap-3 p-3 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-colors font-medium">
              <ShieldAlert className="w-5 h-5" /> Admin Panel
            </Link>
          )}
        </nav>
        <div className="p-4 border-t border-border space-y-2">
          <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
            <LogOut className="w-5 h-5 mr-3" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {profile?.full_name || user?.email || 'User'}! 👋</h1>
            <p className="text-muted-foreground">Here's what's happening today.</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
               <img src={profile?.avatar_url || "https://picsum.photos/seed/user123/48/48"} alt="Profile" />
             </div>
          </div>
        </header>

        {/* Verification Alert for Maids */}
        {isMaid && !isVerified && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 bg-yellow-50 border border-yellow-200 rounded-2xl p-6 flex items-start gap-4"
          >
            <div className="bg-yellow-100 p-3 rounded-xl">
              <AlertTriangle className="text-yellow-600 w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-yellow-800 text-lg">Profile Verification Pending</h3>
              <p className="text-yellow-700 mt-1">
                Your profile is currently hidden from employers. Please ensure your profile details are complete, and an admin will review your account shortly.
              </p>
              <Link href="/profile">
                <Button className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white border-none rounded-full">
                  Complete Profile <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-primary/10 p-4 rounded-2xl">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Bookings</p>
                <p className="text-2xl font-bold">0</p>
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
                <p className="text-2xl font-bold">0</p>
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
                <p className="text-2xl font-bold">0.0</p>
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
                <p className="text-2xl font-bold">0</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Recent Activity</h2>
              <Link href="/bookings" className="text-primary text-sm font-medium hover:underline">View All</Link>
            </div>
            
            <Card className="border-none shadow-sm p-10 text-center">
              <p className="text-muted-foreground italic">No recent activity to show.</p>
              {profile?.user_type === 'employer' && (
                <Link href="/browse">
                  <Button className="mt-4 rounded-full">Book your first maid</Button>
                </Link>
              )}
            </Card>
          </div>

          <div className="space-y-6">
             <h2 className="text-xl font-bold">Quick Actions</h2>
             <div className="grid grid-cols-1 gap-4">
                {profile?.user_type === 'employer' && (
                  <Link href="/browse">
                    <Button className="w-full h-16 bg-primary text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all">
                      Find a Maid
                    </Button>
                  </Link>
                )}
                {isMaid && (
                  <Link href="/profile">
                    <Button className="w-full h-16 bg-primary text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all">
                      Update My Resume
                    </Button>
                  </Link>
                )}
                <Link href="/map">
                  <Button variant="secondary" className="w-full h-16 bg-white border border-border text-lg font-bold rounded-2xl hover:bg-slate-50 transition-all">
                    View Interactive Map
                  </Button>
                </Link>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

import { Loader2 } from 'lucide-react';
