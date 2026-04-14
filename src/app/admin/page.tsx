
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
  bio: z.string().optional(),
  hourly_rate: z.coerce.number().min(0).optional(),
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
      hourly_rate: 0,
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
          description: "Your account is now marked as admin in the database. Refreshing data...",
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

  const handleSeedData = async () => {
    if (!db) return;
    setIsSubmitting(true);
    
    const sampleMaids = [
      {
        full_name: "Nalule Florence",
        email: "florence@example.com",
        user_type: "maid",
        is_verified: true,
        district: "Kampala",
        bio: "Professional cleaner with 5 years of experience in high-end apartments. Specialized in eco-friendly products.",
        hourly_rate: 15000,
        skills: ["Cleaning", "Laundry", "Cooking"],
        rating: 4.8,
        review_count: 12,
        experience: 5,
        languages: ["English", "Luganda"]
      },
      {
        full_name: "Namubiru Mary",
        email: "mary@example.com",
        user_type: "maid",
        is_verified: true,
        district: "Entebbe",
        bio: "Reliable babysitter and house help. I love children and keeping homes tidy and organized.",
        hourly_rate: 12000,
        skills: ["Babysitting", "Cleaning"],
        rating: 4.5,
        review_count: 8,
        experience: 3,
        languages: ["Luganda", "Swahili"]
      }
    ];

    try {
      for (const maid of sampleMaids) {
        const ref = doc(collection(db, 'users'));
        await setDoc(ref, { 
          ...maid, 
          created_at: serverTimestamp(), 
          avatar_url: `https://picsum.photos/seed/${ref.id}/400/400` 
        });
      }
      toast({
        title: "Database Initialized",
        description: "Sample maids have been created. Check your Firebase console!",
      });
    } catch (e: any) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'users',
        operation: 'create',
      }));
    } finally {
      setIsSubmitting(false);
    }
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
          description: "The user has been approved and is now visible on the platform.",
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
      avatar_url: `https://picsum.photos/seed/${newUserRef.id}/200/200`,
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
          title: "User Added",
          description: `${values.full_name} has been successfully added.`,
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
               <code className="text-primary font-mono text-sm break-all select-all cursor-pointer" onClick={() => {
                 navigator.clipboard.writeText(user?.uid || '');
                 toast({ title: "Copied ID" });
               }}>{user?.uid}</code>
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
              
              <Button className="w-full rounded-full" variant="outline" onClick={() => router.push('/dashboard')}>
                Return to Dashboard
              </Button>
              <Button variant="ghost" className="text-destructive hover:bg-destructive/10 rounded-full" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" /> Logout & Switch Account
              </Button>
            </div>

            <div className="text-left text-xs text-slate-400 space-y-2 leading-relaxed pt-4 border-t border-slate-800">
              <p>Alternatively, manually set your role in the console:</p>
              <ol className="list-decimal list-inside space-y-1 ml-1">
                <li>Go to the <a href={`https://console.firebase.google.com/u/0/project/savings-central/firestore/data`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 text-[10px]">Firebase Console <ExternalLink className="w-3 h-3" /></a></li>
                <li>Find the document <b>{user?.uid}</b> in the <b>"users"</b> collection.</li>
                <li>Change <b>user_type</b> to <b>"admin"</b>.</li>
              </ol>
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
            <p className="text-slate-400">Platform Management & Data Explorer</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button variant="ghost" className="text-destructive hover:bg-destructive/10 rounded-full" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
          
          <Button 
            variant="outline" 
            className="border-slate-800 bg-slate-900 text-slate-400 hover:text-white rounded-full"
            onClick={handleSeedData}
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <PlusCircle className="mr-2 w-4 h-4" />}
            Seed Sample Data
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 rounded-full px-6 shadow-lg shadow-primary/20">
                <UserPlus className="mr-2 w-4 h-4" /> Create Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-white">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Manually register a user. They will be marked as verified immediately.
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
                  <DialogFooter className="mt-6">
                    <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      Save User
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
          { icon: Users, label: "Total Users", value: users?.length || 0, color: "text-blue-400" },
          { icon: Calendar, label: "Total Bookings", value: bookings?.length || 0, color: "text-primary" },
          { icon: ShieldAlert, label: "Pending Reports", value: reports?.filter(r => r.status === 'pending').length || 0, color: "text-red-400" },
          { icon: Star, label: "Platform Rating", value: "4.8", color: "text-yellow-400" },
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
            <ShieldCheck className="w-4 h-4 mr-2" /> Verification & Moderation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="explorer">
          <Card className="bg-slate-900 border-slate-800 text-white overflow-hidden">
             <CardHeader className="border-b border-slate-800 bg-slate-900/50">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <CardTitle>Platform Data Explorer</CardTitle>
                    <CardDescription className="text-slate-400">Directly browse all Firestore records.</CardDescription>
                  </div>
                  <Tabs value={activeDataTab} onValueChange={setActiveDataTab} className="bg-slate-950 p-1 rounded-lg">
                    <TabsList className="bg-transparent border-none p-0 h-auto">
                      <TabsTrigger value="users" className="data-[state=active]:bg-slate-800 py-1.5 px-4 text-xs">Users</TabsTrigger>
                      <TabsTrigger value="bookings" className="data-[state=active]:bg-slate-800 py-1.5 px-4 text-xs">Bookings</TabsTrigger>
                      <TabsTrigger value="reports" className="data-[state=active]:bg-slate-800 py-1.5 px-4 text-xs">Reports</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
             </CardHeader>
             <CardContent className="p-0">
                {activeDataTab === 'users' && (
                  <Table>
                    <TableHeader className="bg-slate-950/50">
                      <TableRow className="border-slate-800">
                        <TableHead className="text-slate-400">Name</TableHead>
                        <TableHead className="text-slate-400">Email</TableHead>
                        <TableHead className="text-slate-400">Type</TableHead>
                        <TableHead className="text-slate-400">Status</TableHead>
                        <TableHead className="text-slate-400 text-right">District</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users?.map(u => (
                        <TableRow key={u.id} className="border-slate-800 hover:bg-slate-800/30">
                          <TableCell className="font-medium">{u.full_name}</TableCell>
                          <TableCell className="text-slate-400 text-xs">{u.email}</TableCell>
                          <TableCell><Badge variant="outline" className="capitalize border-slate-700">{u.user_type}</Badge></TableCell>
                          <TableCell>
                            <Badge className={u.is_verified ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}>
                              {u.is_verified ? 'Verified' : 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-slate-400">{u.district || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                      {users?.length === 0 && (
                        <TableRow><TableCell colSpan={5} className="text-center py-10 text-slate-500 italic">No users found. Try seeding sample data.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}

                {activeDataTab === 'bookings' && (
                  <Table>
                    <TableHeader className="bg-slate-950/50">
                      <TableRow className="border-slate-800">
                        <TableHead className="text-slate-400">ID</TableHead>
                        <TableHead className="text-slate-400">Date/Time</TableHead>
                        <TableHead className="text-slate-400">Price (UGX)</TableHead>
                        <TableHead className="text-slate-400">Status</TableHead>
                        <TableHead className="text-slate-400 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings?.map(booking => (
                        <TableRow key={booking.id} className="border-slate-800 hover:bg-slate-800/30">
                          <TableCell className="font-mono text-[10px] text-slate-500">{booking.id.slice(0, 8)}...</TableCell>
                          <TableCell className="text-xs">{booking.date} at {booking.time}</TableCell>
                          <TableCell className="font-bold">{booking.total_price?.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className="bg-primary/10 text-primary border-primary/20 uppercase text-[10px]">
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-white">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {bookings?.length === 0 && (
                        <TableRow><TableCell colSpan={5} className="text-center py-10 text-slate-500 italic">No bookings found in database.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}

                {activeDataTab === 'reports' && (
                  <Table>
                    <TableHeader className="bg-slate-950/50">
                      <TableRow className="border-slate-800">
                        <TableHead className="text-slate-400">Reason</TableHead>
                        <TableHead className="text-slate-400">Reporter</TableHead>
                        <TableHead className="text-slate-400">Status</TableHead>
                        <TableHead className="text-slate-400 text-right">Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports?.map(report => (
                        <TableRow key={report.id} className="border-slate-800 hover:bg-slate-800/30">
                          <TableCell className="text-xs">{report.reason}</TableCell>
                          <TableCell className="font-mono text-[10px] text-slate-500">{report.reporter_id.slice(0, 8)}...</TableCell>
                          <TableCell>
                            <Badge className={report.status === 'resolved' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}>
                              {report.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-slate-400 text-xs">
                             {report.created_at?.seconds ? new Date(report.created_at.seconds * 1000).toLocaleDateString() : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                      {reports?.length === 0 && (
                        <TableRow><TableCell colSpan={4} className="text-center py-10 text-slate-500 italic">No reports found in database.</TableCell></TableRow>
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
                       <ShieldCheck className="w-5 h-5" /> Pending Verifications
                    </CardTitle>
                    <CardDescription className="text-slate-400">Review and approve new domestic workers.</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    {users?.filter(u => !u.is_verified && u.user_type === 'maid').map(u => (
                      <div key={u.id} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-900 overflow-hidden ring-2 ring-slate-800">
                              <img src={u.avatar_url || `https://picsum.photos/seed/${u.id}/40/40`} alt="" />
                            </div>
                            <div>
                               <p className="font-bold text-sm">{u.full_name}</p>
                               <p className="text-[10px] text-slate-500">{u.district || 'No location'}</p>
                            </div>
                         </div>
                         <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="bg-green-500 hover:bg-green-600 text-[10px] h-7 px-4 rounded-full"
                              onClick={() => handleVerifyUser(u.id)}
                            >
                              Approve
                            </Button>
                            <Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-500/10 h-7 w-7"><XCircle className="w-4 h-4" /></Button>
                         </div>
                      </div>
                    ))}
                    {users?.filter(u => !u.is_verified && u.user_type === 'maid').length === 0 && (
                      <div className="text-center py-12">
                         <CheckCircle2 className="w-12 h-12 text-slate-800 mx-auto mb-3" />
                         <p className="text-slate-500 text-sm">No pending worker verifications.</p>
                      </div>
                    )}
                 </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800 text-white shadow-xl">
                 <CardHeader>
                    <CardTitle className="text-red-400">Active Reports</CardTitle>
                    <CardDescription className="text-slate-400">Safety concerns reported by the community.</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    {reports?.filter(r => r.status === 'pending').map(report => (
                      <div key={report.id} className="p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                         <div className="flex justify-between items-start mb-2">
                            <p className="font-bold text-sm">Target: <span className="text-red-400 font-mono text-[10px]">{report.reported_id.slice(0, 8)}...</span></p>
                         </div>
                         <p className="text-xs text-slate-400 mb-4 bg-slate-950 p-2 rounded">{report.reason}</p>
                         <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="bg-red-500 hover:bg-red-600 text-[10px] h-7 rounded-full"
                              onClick={() => handleResolveReport(report.id)}
                            >
                              Resolve
                            </Button>
                            <Button size="sm" variant="outline" className="border-slate-800 text-[10px] h-7 rounded-full">Ignore</Button>
                         </div>
                      </div>
                    ))}
                    {reports?.filter(r => r.status === 'pending').length === 0 && (
                      <div className="text-center py-12">
                         <CheckCircle2 className="w-12 h-12 text-slate-800 mx-auto mb-3" />
                         <p className="text-slate-500 text-sm">The community is currently safe. No reports.</p>
                      </div>
                    )}
                 </CardContent>
              </Card>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
