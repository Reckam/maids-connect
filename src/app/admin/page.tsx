"use client";

import React, { useMemo, useState } from 'react';
import { 
  Users, 
  Calendar, 
  ShieldAlert, 
  Star, 
  BarChart3, 
  CheckCircle2, 
  XCircle, 
  MoreHorizontal,
  Search,
  Filter,
  Loader2,
  UserPlus,
  Save,
  ShieldCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Textarea } from "@/components/ui/textarea";
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, limit, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';

const addUserSchema = z.object({
  full_name: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email"),
  user_type: z.enum(["maid", "employer"]),
  district: z.string().min(2, "District is required"),
  bio: z.string().optional(),
  hourly_rate: z.coerce.number().min(0).optional(),
});

type AddUserValues = z.infer<typeof addUserSchema>;

export default function AdminDashboard() {
  const db = useFirestore();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoized Queries
  const usersQuery = useMemo(() => db ? query(collection(db, 'users'), limit(50)) : null, [db]);
  const reportsQuery = useMemo(() => db ? query(collection(db, 'reports'), limit(10)) : null, [db]);
  const bookingsQuery = useMemo(() => db ? query(collection(db, 'bookings'), limit(20)) : null, [db]);

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

  const handleResolveReport = (reportId: string) => {
    if (!db) return;
    const reportRef = doc(db, 'reports', reportId);
    updateDoc(reportRef, { status: 'resolved' })
      .catch(async () => {
        const permissionError = new FirestorePermissionError({
          path: reportRef.path,
          operation: 'update',
          requestResourceData: { status: 'resolved' },
        });
        errorEmitter.emit('permission-error', permissionError);
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
        const permissionError = new FirestorePermissionError({
          path: userRef.path,
          operation: 'update',
          requestResourceData: { is_verified: true },
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const onAddUserSubmit = async (values: AddUserValues) => {
    if (!db) return;
    setIsSubmitting(true);

    const newUserRef = doc(collection(db, 'users'));
    const userData = {
      ...values,
      is_verified: true, // Admin-added users are verified by default
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
          description: `${values.full_name} has been successfully added as a ${values.user_type}.`,
        });
      })
      .catch(async () => {
        setIsSubmitting(false);
        const permissionError = new FirestorePermissionError({
          path: newUserRef.path,
          operation: 'create',
          requestResourceData: userData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  if (loadingUsers || loadingReports || loadingBookings) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 md:p-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShieldAlert className="text-primary w-8 h-8" /> Admin Dashboard
          </h1>
          <p className="text-slate-400">Platform Overview & Management Control Panel</p>
        </div>
        <div className="flex gap-4">
           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
             <DialogTrigger asChild>
               <Button className="bg-primary hover:bg-primary/90 rounded-full px-6">
                 <UserPlus className="mr-2 w-4 h-4" /> Add User
               </Button>
             </DialogTrigger>
             <DialogContent className="sm:max-w-[500px] bg-slate-800 border-slate-700 text-white">
               <DialogHeader>
                 <DialogTitle>Add New User</DialogTitle>
                 <DialogDescription className="text-slate-400">
                   Create a new profile manually. Verified status will be applied automatically.
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
                           <Input placeholder="Enter full name" {...field} className="bg-slate-900 border-slate-700" />
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
                             <Input placeholder="email@example.com" {...field} className="bg-slate-900 border-slate-700" />
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
                               <SelectTrigger className="bg-slate-900 border-slate-700">
                                 <SelectValue placeholder="Select role" />
                               </SelectTrigger>
                             </FormControl>
                             <SelectContent className="bg-slate-800 border-slate-700 text-white">
                               <SelectItem value="maid">Maid</SelectItem>
                               <SelectItem value="employer">Employer</SelectItem>
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
                             <Input placeholder="e.g. Kampala" {...field} className="bg-slate-900 border-slate-700" />
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
                           <FormLabel>Hourly Rate (UGX)</FormLabel>
                           <FormControl>
                             <Input type="number" {...field} className="bg-slate-900 border-slate-700" />
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
                         <FormLabel>Bio</FormLabel>
                         <FormControl>
                           <Textarea placeholder="Professional background..." {...field} className="bg-slate-900 border-slate-700 min-h-[100px]" />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                   <DialogFooter className="mt-6">
                     <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
                       {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                       Create Profile
                     </Button>
                   </DialogFooter>
                 </form>
               </Form>
             </DialogContent>
           </Dialog>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { icon: Users, label: "Total Users", value: users?.length || 0, trend: "+12%" },
          { icon: Calendar, label: "Total Bookings", value: bookings?.length || 0, trend: "+5.2%" },
          { icon: Star, label: "Avg Rating", value: "4.7", trend: "+0.1" },
          { icon: BarChart3, label: "Revenue (UGX)", value: "12M", trend: "+18%" },
        ].map((stat, i) => (
          <Card key={i} className="bg-slate-800 border-slate-700 text-white shadow-xl border-none">
             <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                   <div className="bg-primary/20 p-3 rounded-xl">
                     <stat.icon className="text-primary w-6 h-6" />
                   </div>
                   <Badge className="bg-green-500/20 text-green-400 border-none">{stat.trend}</Badge>
                </div>
                <p className="text-slate-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
             </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="users" className="data-[state=active]:bg-primary">User Management</TabsTrigger>
          <TabsTrigger value="bookings" className="data-[state=active]:bg-primary">Bookings</TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-primary">Verification & Moderation</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card className="bg-slate-800 border-slate-700 text-white shadow-xl overflow-hidden border-none">
             <CardHeader className="flex flex-row items-center justify-between border-b border-slate-700">
                <div>
                   <CardTitle>Users</CardTitle>
                   <CardDescription className="text-slate-400">View and manage all registered users.</CardDescription>
                </div>
                <div className="flex gap-2">
                   <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <Input placeholder="Search user..." className="bg-slate-900 border-slate-700 pl-10 h-10 w-64 text-white" />
                   </div>
                </div>
             </CardHeader>
             <CardContent className="p-0">
                <Table>
                   <TableHeader className="bg-slate-900/50">
                      <TableRow className="hover:bg-transparent border-slate-700">
                         <TableHead className="text-slate-300">Name</TableHead>
                         <TableHead className="text-slate-300">Role</TableHead>
                         <TableHead className="text-slate-300">Status</TableHead>
                         <TableHead className="text-slate-300">Email</TableHead>
                         <TableHead className="text-slate-300 text-right">Actions</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {users?.map((user) => (
                        <TableRow key={user.id} className="border-slate-700 hover:bg-slate-700/50">
                           <TableCell className="font-medium">{user.full_name}</TableCell>
                           <TableCell className="capitalize">{user.user_type}</TableCell>
                           <TableCell>
                              <Badge 
                                className={
                                  user.is_verified ? 'bg-green-500/20 text-green-400 border-none' : 
                                  'bg-yellow-500/20 text-yellow-400 border-none'
                                }
                              >
                                {user.is_verified ? 'Verified' : 'Pending'}
                              </Badge>
                           </TableCell>
                           <TableCell className="text-slate-400">{user.email}</TableCell>
                           <TableCell className="text-right">
                              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white"><MoreHorizontal /></Button>
                           </TableCell>
                        </TableRow>
                      ))}
                   </TableBody>
                </Table>
             </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
           <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-slate-800 border-slate-700 text-white shadow-xl border-none">
                 <CardHeader>
                    <CardTitle className="text-primary flex items-center gap-2">
                       <ShieldCheck className="w-5 h-5" /> Verification Requests
                    </CardTitle>
                    <CardDescription className="text-slate-400">Users waiting for profile verification.</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    {users?.filter(u => !u.is_verified).map(user => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden">
                              <img src={user.avatar_url || `https://picsum.photos/seed/${user.id}/40/40`} alt="" />
                            </div>
                            <div>
                               <p className="font-bold text-sm">{user.full_name}</p>
                               <p className="text-xs text-slate-500">{user.user_type}</p>
                            </div>
                         </div>
                         <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="bg-green-500 hover:bg-green-600 text-[10px] h-7 px-3 rounded-full"
                              onClick={() => handleVerifyUser(user.id)}
                            >
                              Approve
                            </Button>
                            <Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-500/10 h-7 w-7"><XCircle className="w-4 h-4" /></Button>
                         </div>
                      </div>
                    ))}
                    {users?.filter(u => !u.is_verified).length === 0 && (
                      <div className="text-center py-10">
                         <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                         <p className="text-slate-500">No pending verifications.</p>
                      </div>
                    )}
                 </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700 text-white shadow-xl border-none">
                 <CardHeader>
                    <CardTitle className="text-red-400">Recent Reports</CardTitle>
                    <CardDescription className="text-slate-400">Moderation items reported by users.</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    {reports?.filter(r => r.status === 'pending').map(report => (
                      <div key={report.id} className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                         <div className="flex justify-between items-start mb-2">
                            <p className="font-bold text-sm">Reported: <span className="text-red-400">{report.reported_id}</span></p>
                         </div>
                         <p className="text-sm text-slate-400 mb-4">{report.reason}</p>
                         <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="bg-red-500 hover:bg-red-600 text-[10px] h-7 rounded-full"
                              onClick={() => handleResolveReport(report.id)}
                            >
                              Resolve
                            </Button>
                            <Button size="sm" variant="outline" className="border-slate-700 text-[10px] h-7 rounded-full">Ignore</Button>
                         </div>
                      </div>
                    ))}
                    {reports?.filter(r => r.status === 'pending').length === 0 && (
                      <p className="text-center text-slate-500 py-10">No pending reports.</p>
                    )}
                 </CardContent>
              </Card>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
