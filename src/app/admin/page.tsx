
"use client";

import React, { useMemo, useState } from 'react';
import { 
  Users, 
  Calendar, 
  ShieldAlert, 
  Star, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  UserPlus,
  Save,
  ShieldCheck,
  ArrowLeft,
  Database,
  Eye,
  Lock,
  ExternalLink,
  PlusCircle,
  Wrench,
  LogOut
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCollection, useFirestore, useUser, useDoc, useAuth } from '@/firebase';
import { collection, query, limit, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';

const addUserSchema = z.object({
  full_name: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email"),
  user_type: z.enum(["maid", "employer", "admin"]),
  district: z.string().min(2, "District is required"),
  bio: z.string().min(10, "Bio is required for professional profiles"),
  hourly_rate: z.coerce.number().min(0),
  experience: z.coerce.number().min(0),
});

type AddUserValues = z.infer<typeof addUserSchema>;

export default function AdminDashboard() {
  const { user } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [activeDataTab, setActiveDataTab] = useState('users');

  const userProfileRef = useMemo(() => (user && db ? doc(db, 'users', user.uid) : null), [user, db]);
  const { data: profile, loading: loadingProfile } = useDoc(userProfileRef);

  const usersQuery = useMemo(() => db ? query(collection(db, 'users'), limit(50)) : null, [db]);
  const reportsQuery = useMemo(() => db ? query(collection(db, 'reports'), limit(50)) : null, [db]);
  const bookingsQuery = useMemo(() => db ? query(collection(db, 'bookings'), limit(50)) : null, [db]);

  const { data: users, loading: loadingUsers } = useCollection(usersQuery);
  const { data: reports, loading: loadingReports } = useCollection(reportsQuery);
  const { data: bookings, loading: loadingBookings } = useCollection(bookingsQuery);

  const form = useForm<AddUserValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      full_name: "",
      email: "",
      user_type: "maid",
      district: "",
      bio: "",
      hourly_rate: 10000,
      experience: 0,
    },
  });

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  };

  const handleRepairPermissions = async () => {
    if (!db || !user) return;
    setIsRepairing(true);
    const userRef = doc(db, 'users', user.uid);
    const adminData = {
      full_name: user.displayName || "Platform Admin",
      email: user.email,
      user_type: "admin",
      is_verified: true,
      updated_at: serverTimestamp(),
    };

    setDoc(userRef, adminData, { merge: true })
      .then(() => {
        toast({
          title: "Permissions Repaired",
          description: "Your account is now marked as admin in the database.",
        });
        setIsRepairing(false);
      })
      .catch(async () => {
        setIsRepairing(false);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: userRef.path,
          operation: 'update',
          requestResourceData: adminData,
        }));
      });
  };

  const handleResolveReport = (reportId: string) => {
    if (!db) return;
    const reportRef = doc(db, 'reports', reportId);
    updateDoc(reportRef, { status: 'resolved' })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: reportRef.path,
          operation: 'update',
          requestResourceData: { status: 'resolved' },
        }));
      });
  };

  const handleVerifyUser = (userId: string) => {
    if (!db) return;
    const userRef = doc(db, 'users', userId);
    updateDoc(userRef, { is_verified: true })
      .then(() => {
        toast({
          title: "User Verified",
          description: "The user has been approved.",
        });
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: userRef.path,
          operation: 'update',
          requestResourceData: { is_verified: true },
        }));
      });
  };

  const onAddUserSubmit = async (values: AddUserValues) => {
    if (!db) return;
    setIsSubmitting(true);

    const newUserRef = doc(collection(db, 'users'));
    const userData = {
      ...values,
      is_verified: true,
      created_at: serverTimestamp(),
      avatar_url: `https://picsum.photos/seed/${newUserRef.id}/400/400`,
      rating: 0,
      review_count: 0,
      skills: [],
      languages: [],
    };

    setDoc(newUserRef, userData)
      .then(() => {
        setIsSubmitting(false);
        setIsDialogOpen(false);
        form.reset();
        toast({
          title: "Profile Created",
          description: `${values.full_name} is now live on the platform.`,
        });
      })
      .catch(async () => {
        setIsSubmitting(false);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: newUserRef.path,
          operation: 'create',
          requestResourceData: userData,
        }));
      });
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const isMasterAdmin = user?.email?.toLowerCase() === 'maids.admin@email.com';
  const hasAdminRole = profile?.user_type === 'admin' || isMasterAdmin;

  if (!hasAdminRole) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <Card className="max-w-md w-full bg-slate-900 border-slate-800 shadow-2xl">
          <CardHeader className="text-center">
            <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
            <CardDescription className="text-slate-400">
              Only platform administrators can access this console.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
               <p className="text-xs text-slate-500 mb-2 uppercase tracking-widest">Your Current User ID</p>
               <code className="text-primary font-mono text-sm break-all select-all">{user?.uid}</code>
            </div>
            
            <div className="flex flex-col gap-3">
              {isMasterAdmin && (
                 <Button 
                  className="w-full bg-primary hover:bg-primary/90 rounded-full" 
                  onClick={handleRepairPermissions}
                  disabled={isRepairing}
                 >
                   {isRepairing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wrench className="mr-2 h-4 w-4" />}
                   Repair My Admin Account
                 </Button>
              )}
              <Button variant="ghost" className="text-destructive hover:bg-destructive/10 rounded-full" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" /> Logout & Switch
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="bg-slate-900 border-slate-800 hover:bg-slate-800 rounded-full"
              onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <ShieldAlert className="text-primary w-8 h-8" /> Admin Console
            </h1>
            <p className="text-slate-400">Add real data and manage the platform.</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 rounded-full px-6 shadow-lg shadow-primary/20">
                <UserPlus className="mr-2 w-4 h-4" /> Add Professional Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-800 text-white max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Real User</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Enter real details for a worker or employer. This will create a collection in Firestore.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onAddUserSubmit)} className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} className="bg-slate-950 border-slate-800" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="email@example.com" {...field} className="bg-slate-950 border-slate-800" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="user_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-slate-950 border-slate-800">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-slate-900 border-slate-800 text-white">
                              <SelectItem value="maid">Maid</SelectItem>
                              <SelectItem value="employer">Employer</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="district"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>District</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Kampala" {...field} className="bg-slate-950 border-slate-800" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hourly_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rate (UGX/hr)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} className="bg-slate-950 border-slate-800" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional Bio</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Professional background..." {...field} className="bg-slate-950 border-slate-800 h-24" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter className="mt-6">
                    <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      Save and Create Data
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { icon: Users, label: "Live Users", value: users?.length || 0, color: "text-blue-400" },
          { icon: Calendar, label: "Live Bookings", value: bookings?.length || 0, color: "text-primary" },
          { icon: ShieldAlert, label: "Pending Reports", value: reports?.filter(r => r.status === 'pending').length || 0, color: "text-red-400" },
          { icon: Star, label: "Reviews", value: "0", color: "text-yellow-400" },
        ].map((stat, i) => (
          <Card key={i} className="bg-slate-900 border-slate-800 text-white shadow-xl">
             <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-slate-950`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
             </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="explorer" className="space-y-6">
        <TabsList className="bg-slate-900 border-slate-800 h-12 p-1">
          <TabsTrigger value="explorer" className="data-[state=active]:bg-primary rounded-md px-6">
            <Database className="w-4 h-4 mr-2" /> Data Explorer
          </TabsTrigger>
          <TabsTrigger value="moderation" className="data-[state=active]:bg-primary rounded-md px-6">
            <ShieldCheck className="w-4 h-4 mr-2" /> Moderation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="explorer">
          <Card className="bg-slate-900 border-slate-800 text-white overflow-hidden">
             <CardHeader className="border-b border-slate-800 bg-slate-900/50">
                <div className="flex justify-between items-center">
                  <CardTitle>Firestore Data Browse</CardTitle>
                  <Tabs value={activeDataTab} onValueChange={setActiveDataTab} className="bg-slate-950 p-1 rounded-lg">
                    <TabsList className="bg-transparent border-none p-0 h-auto">
                      <TabsTrigger value="users" className="data-[state=active]:bg-slate-800 py-1.5 px-4 text-xs">Users</TabsTrigger>
                      <TabsTrigger value="bookings" className="data-[state=active]:bg-slate-800 py-1.5 px-4 text-xs">Bookings</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
             </CardHeader>
             <CardContent className="p-0">
                {activeDataTab === 'users' && (
                  <Table>
                    <TableHeader className="bg-slate-950/50">
                      <TableRow className="border-slate-800">
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">District</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users?.map(u => (
                        <TableRow key={u.id} className="border-slate-800 hover:bg-slate-800/30">
                          <TableCell className="font-medium">{u.full_name}</TableCell>
                          <TableCell className="text-slate-400 text-xs">{u.email}</TableCell>
                          <TableCell><Badge variant="outline" className="capitalize">{u.user_type}</Badge></TableCell>
                          <TableCell>
                            <Badge className={u.is_verified ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}>
                              {u.is_verified ? 'Verified' : 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-slate-400">{u.district || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                      {users?.length === 0 && (
                        <TableRow><TableCell colSpan={5} className="text-center py-10 text-slate-500">No real data found yet.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}

                {activeDataTab === 'bookings' && (
                  <Table>
                    <TableHeader className="bg-slate-950/50">
                      <TableRow className="border-slate-800">
                        <TableHead>Booking ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings?.map(b => (
                        <TableRow key={b.id} className="border-slate-800">
                          <TableCell className="font-mono text-xs">{b.id}</TableCell>
                          <TableCell>{b.date}</TableCell>
                          <TableCell>{b.total_price?.toLocaleString()} UGX</TableCell>
                          <TableCell><Badge>{b.status}</Badge></TableCell>
                        </TableRow>
                      ))}
                      {bookings?.length === 0 && (
                        <TableRow><TableCell colSpan={4} className="text-center py-10 text-slate-500">No bookings created yet.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
             </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation">
           <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-slate-900 border-slate-800 text-white shadow-xl">
                 <CardHeader>
                    <CardTitle className="text-primary flex items-center gap-2">
                       <ShieldCheck className="w-5 h-5" /> Verification Requests
                    </CardTitle>
                    <CardDescription>Approve profiles to make them public.</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    {users?.filter(u => !u.is_verified && u.user_type === 'maid').map(u => (
                      <div key={u.id} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                         <div>
                            <p className="font-bold text-sm">{u.full_name}</p>
                            <p className="text-xs text-slate-500">{u.district}</p>
                         </div>
                         <Button size="sm" onClick={() => handleVerifyUser(u.id)}>Approve</Button>
                      </div>
                    ))}
                    {users?.filter(u => !u.is_verified && u.user_type === 'maid').length === 0 && (
                      <p className="text-center py-6 text-slate-500 italic">No pending requests.</p>
                    )}
                 </CardContent>
              </Card>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
