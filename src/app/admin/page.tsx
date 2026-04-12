"use client";

import React from 'react';
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
  Filter
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

const USER_DATA = [
  { id: '1', name: 'Nalule Florence', role: 'maid', status: 'verified', email: 'florence@mail.com', joined: 'Oct 2023' },
  { id: '2', name: 'James Muganza', role: 'employer', status: 'pending', email: 'james@mail.com', joined: 'Oct 2023' },
  { id: '3', name: 'Mary Namubiru', role: 'maid', status: 'verified', email: 'mary@mail.com', joined: 'Sep 2023' },
  { id: '4', name: 'Achieng Sarah', role: 'maid', status: 'suspended', email: 'sarah@mail.com', joined: 'Aug 2023' },
];

const REPORT_DATA = [
  { id: '1', reporter: 'James Muganza', reported: 'Achieng Sarah', reason: 'Unprofessional behavior', date: 'Oct 15, 2023' },
  { id: '2', reporter: 'Prossy Nalule', reported: 'David K.', reason: 'Non-payment', date: 'Oct 12, 2023' },
];

export default function AdminDashboard() {
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
           <Button variant="outline" className="bg-slate-800 border-slate-700 hover:bg-slate-700">Export CSV</Button>
           <Button className="bg-primary hover:bg-primary/90">System Logs</Button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { icon: Users, label: "Total Users", value: "2,450", trend: "+12%" },
          { icon: Calendar, label: "Total Bookings", value: "890", trend: "+5.2%" },
          { icon: Star, label: "Avg Rating", value: "4.7", trend: "+0.1" },
          { icon: BarChart3, label: "Revenue (UGX)", value: "12M", trend: "+18%" },
        ].map((stat, i) => (
          <Card key={i} className="bg-slate-800 border-slate-700 text-white shadow-xl">
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

      {/* Main Sections */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="users" className="data-[state=active]:bg-primary">User Management</TabsTrigger>
          <TabsTrigger value="bookings" className="data-[state=active]:bg-primary">Bookings</TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-primary">Reports & Moderation</TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-primary">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card className="bg-slate-800 border-slate-700 text-white shadow-xl overflow-hidden">
             <CardHeader className="flex flex-row items-center justify-between border-b border-slate-700">
                <div>
                   <CardTitle>Users</CardTitle>
                   <CardDescription className="text-slate-400">View and manage all registered users.</CardDescription>
                </div>
                <div className="flex gap-2">
                   <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <Input placeholder="Search user..." className="bg-slate-900 border-slate-700 pl-10 h-10 w-64" />
                   </div>
                   <Button variant="outline" className="bg-slate-900 border-slate-700"><Filter className="w-4 h-4" /></Button>
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
                         <TableHead className="text-slate-300">Joined</TableHead>
                         <TableHead className="text-slate-300 text-right">Actions</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {USER_DATA.map((user) => (
                        <TableRow key={user.id} className="border-slate-700 hover:bg-slate-700/50">
                           <TableCell className="font-medium">{user.name}</TableCell>
                           <TableCell className="capitalize">{user.role}</TableCell>
                           <TableCell>
                              <Badge 
                                className={
                                  user.status === 'verified' ? 'bg-green-500/20 text-green-400 border-none' : 
                                  user.status === 'suspended' ? 'bg-red-500/20 text-red-400 border-none' :
                                  'bg-yellow-500/20 text-yellow-400 border-none'
                                }
                              >
                                {user.status}
                              </Badge>
                           </TableCell>
                           <TableCell className="text-slate-400">{user.email}</TableCell>
                           <TableCell className="text-slate-400">{user.joined}</TableCell>
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
              <Card className="bg-slate-800 border-slate-700 text-white shadow-xl">
                 <CardHeader>
                    <CardTitle className="text-red-400">Recent Reports</CardTitle>
                    <CardDescription className="text-slate-400">Users reported by the community.</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    {REPORT_DATA.map(report => (
                      <div key={report.id} className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                         <div className="flex justify-between items-start mb-2">
                            <p className="font-bold text-sm">Reported: <span className="text-red-400">{report.reported}</span></p>
                            <span className="text-[10px] text-slate-500 uppercase">{report.date}</span>
                         </div>
                         <p className="text-sm text-slate-400 mb-4">{report.reason}</p>
                         <div className="flex gap-2">
                            <Button size="sm" className="bg-red-500 hover:bg-red-600 text-[10px] h-7">Suspend</Button>
                            <Button size="sm" variant="outline" className="border-slate-700 text-[10px] h-7">Ignore</Button>
                         </div>
                      </div>
                    ))}
                 </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700 text-white shadow-xl">
                 <CardHeader>
                    <CardTitle className="text-primary">Verification Requests</CardTitle>
                    <CardDescription className="text-slate-400">Users waiting for profile verification.</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    {[1, 2].map(i => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-800" />
                            <div>
                               <p className="font-bold text-sm">Katono M.</p>
                               <p className="text-xs text-slate-500">Submitted 2h ago</p>
                            </div>
                         </div>
                         <div className="flex gap-2">
                            <Button size="icon" variant="ghost" className="text-green-500"><CheckCircle2 /></Button>
                            <Button size="icon" variant="ghost" className="text-red-500"><XCircle /></Button>
                         </div>
                      </div>
                    ))}
                 </CardContent>
              </Card>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}