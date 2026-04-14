
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
  LogOut,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ChevronRight,
  Loader2,
  Mail,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useUser, useDoc, useFirestore, useAuth, useCollection } from '@/firebase';
import { doc, collection, query, where, or, limit, orderBy } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';

export default function Dashboard() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  const userDocRef = useMemo(() => (user && db ? doc(db, 'users', user.uid) : null), [user, db]);
  const { data: profile, loading: isLoading } = useDoc(userDocRef);

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

  const { data: bookings } = useCollection(bookingsQuery);

  const stats = useMemo(() => {
    if (!bookings) return { pending: 0, completed: 0, scheduled: 0 };
    return {
      pending: bookings.filter(b => b.status === 'pending').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
    };
  }, [bookings]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  };

  if (authLoading || isLoading) return (
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
        <div className="p-4 border-t border-border space-y-4">
          <div className="px-3">
             <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">Signed in as</p>
             <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100">
                  <img src={profile?.avatar_url || `https://picsum.photos/seed/${user?.uid}/24/24`} alt="" />
                </div>
                <div className="flex-1 overflow-hidden">
                   <p className="text-xs font-bold truncate">{profile?.full_name}</p>
                   <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                </div>
             </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
            <LogOut className="w-5 h-5 mr-3" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {profile?.full_name || 'User'}! 👋</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="capitalize">{profile?.user_type || 'User'}</Badge>
              <span className="text-muted-foreground text-sm flex items-center gap-1">
                <Mail className="w-3 h-3" /> {user?.email}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
             <Button variant="outline" size="sm" className="lg:hidden text-destructive hover:text-destructive border-destructive/20" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" /> Logout
             </Button>
             <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md ml-auto sm:ml-0">
               <img src={profile?.avatar_url || `https://picsum.photos/seed/${user?.uid}/48/48`} alt="Profile" />
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
                <p className="text-sm text-muted-foreground">Pending Requests</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-green-100 p-4 rounded-2xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Confirmed Jobs</p>
                <p className="text-2xl font-bold">{stats.confirmed}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-yellow-100 p-4 rounded-2xl">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="text-2xl font-bold">{profile?.rating || '0.0'}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-blue-100 p-4 rounded-2xl">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">History</p>
                <p className="text-2xl font-bold">{bookings?.length || 0}</p>
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
            
            <div className="space-y-4">
              {bookings && bookings.slice(0, 5).map(booking => (
                <Card key={booking.id} className="border-none shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 p-2 rounded-full">
                        <Calendar className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Booking #{booking.id.slice(0, 6)}</p>
                        <p className="text-xs text-muted-foreground">{booking.date} at {booking.time}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize text-[10px]">{booking.status}</Badge>
                  </CardContent>
                </Card>
              ))}
              {(!bookings || bookings.length === 0) && (
                <Card className="border-none shadow-sm p-10 text-center">
                  <p className="text-muted-foreground italic">No recent activity to show.</p>
                  {profile?.user_type === 'employer' && (
                    <Link href="/browse">
                      <Button className="mt-4 rounded-full">Book your first maid</Button>
                    </Link>
                  )}
                </Card>
              )}
            </div>
          </div>

          <div className="space-y-6">
             <h2 className="text-xl font-bold">Quick Actions</h2>
             <div className="grid grid-cols-1 gap-4">
                {profile?.user_type === 'employer' && (
                  <Link href="/browse">
                    <Button className="w-full h-16 bg-primary text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all">
                      <Search className="mr-2" /> Find a Maid
                    </Button>
                  </Link>
                )}
                {isMaid && (
                  <Link href="/profile">
                    <Button className="w-full h-16 bg-primary text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all">
                      <User className="mr-2" /> Update Resume
                    </Button>
                  </Link>
                )}
                <Link href="/map">
                  <Button variant="secondary" className="w-full h-16 bg-white border border-border text-lg font-bold rounded-2xl hover:bg-slate-50 transition-all">
                    <MapIcon className="mr-2" /> View Map
                  </Button>
                </Link>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
