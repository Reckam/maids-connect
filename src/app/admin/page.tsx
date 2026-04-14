
"use client";

import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  ShieldAlert, 
  ArrowLeft, 
  Database, 
  ShieldCheck, 
  UserPlus 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();

  // Mock data
  const users = [
    { id: '1', full_name: 'Alice Johnson', email: 'alice@example.com', user_type: 'maid', is_verified: true, district: 'Kampala' },
    { id: '2', full_name: 'Bob Williams', email: 'bob@example.com', user_type: 'employer', is_verified: true, district: 'Wakiso' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="bg-slate-900 border-slate-800 rounded-full" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <ShieldAlert className="text-primary w-8 h-8" /> Admin Console
            </h1>
            <p className="text-slate-400">Manage the platform data (Demo Mode).</p>
          </div>
        </div>
        <Button className="bg-primary rounded-full px-6">
          <UserPlus className="mr-2 w-4 h-4" /> Add Professional Profile
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { icon: Users, label: "Live Users", value: "2", color: "text-blue-400" },
          { icon: Calendar, label: "Live Bookings", value: "5", color: "text-primary" },
          { icon: ShieldAlert, label: "Reports", value: "0", color: "text-red-400" },
          { icon: ShieldCheck, label: "Verified", value: "1", color: "text-green-400" },
        ].map((stat, i) => (
          <Card key={i} className="bg-slate-900 border-slate-800 text-white">
             <CardContent className="p-6 flex items-center gap-4">
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                <div>
                  <p className="text-slate-400 text-xs uppercase">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
             </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="explorer" className="space-y-6">
        <TabsList className="bg-slate-900 border-slate-800">
          <TabsTrigger value="explorer"><Database className="w-4 h-4 mr-2" /> Data Explorer</TabsTrigger>
          <TabsTrigger value="moderation"><ShieldCheck className="w-4 h-4 mr-2" /> Moderation</TabsTrigger>
        </TabsList>

        <TabsContent value="explorer">
          <Card className="bg-slate-900 border-slate-800 text-white">
             <CardHeader>
                <CardTitle>Users Browse</CardTitle>
             </CardHeader>
             <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800">
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(u => (
                      <TableRow key={u.id} className="border-slate-800">
                        <TableCell className="font-medium">{u.full_name}</TableCell>
                        <TableCell className="text-slate-400 text-xs">{u.email}</TableCell>
                        <TableCell><Badge variant="outline">{u.user_type}</Badge></TableCell>
                        <TableCell>
                          <Badge className="bg-green-500/10 text-green-400">Verified</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
             </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
