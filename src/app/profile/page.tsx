
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  User, 
  MapPin, 
  Briefcase, 
  Languages, 
  Clock, 
  Save, 
  Loader2, 
  ChevronLeft,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  History,
  LogOut
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Badge } from "@/components/ui/badge";
import { aidMaidBioCreation } from '@/ai/flows/aid-maid-bio-creation';

const profileSchema = z.object({
  full_name: z.string().min(2, { message: "Name is too short" }),
  district: z.string().min(2, { message: "Please enter your district" }),
  user_type: z.enum(['maid', 'employer', 'admin']),
  bio: z.string().min(20, { message: "Bio must be at least 20 characters" }).optional(),
  hourly_rate: z.coerce.number().min(1000, { message: "Rate must be at least 1,000 UGX" }).optional(),
  experience: z.coerce.number().min(0, { message: "Experience cannot be negative" }).optional(),
  skills: z.string().optional(),
  languages: z.string().optional(),
  availability: z.string().min(2, { message: "Please describe your availability" }).optional(),
});

type ProfileData = {
  id: string;
  full_name: string;
  district: string;
  user_type: 'maid' | 'employer' | 'admin';
  is_verified: boolean;
  avatar_url?: string;
  bio?: string;
  hourly_rate?: number;
  experience?: number;
  skills?: string[];
  languages?: string[];
  availability?: string;
};

export default function ProfileManagementPage() {
  const [supabase] = useState(() => createClient());
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      district: "",
      user_type: "maid",
      bio: "",
      hourly_rate: 0,
      experience: 0,
      skills: "",
      languages: "",
      availability: "",
    },
  });

  const fetchProfile = useCallback(async (authUser: SupabaseUser) => {
    setLoadingProfile(true);
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (userError) {
      toast({ variant: "destructive", title: "Error", description: "Could not fetch user profile." });
      setLoadingProfile(false);
      return;
    }
    
    let profileData: any = { ...userData };

    if (userData.user_type === 'maid') {
      const { data: maidData, error: maidError } = await supabase
        .from('maids')
        .select('*')
        .eq('id', authUser.id)
        .single();
      if (maidError && maidError.code !== 'PGRST116') {
        console.error("Could not fetch maid details", maidError);
      } else if (maidData) {
        Object.assign(profileData, maidData);
      }
    }
    
    setProfile(profileData);
    
    form.reset({
      full_name: profileData.full_name || "",
      district: profileData.district || "",
      user_type: profileData.user_type || "maid",
      bio: profileData.bio || "",
      hourly_rate: profileData.hourly_rate || 0,
      experience: profileData.experience || 0,
      skills: profileData.skills?.join(", ") || "",
      languages: profileData.languages?.join(", ") || "",
      availability: profileData.availability || "",
    });

    setLoadingProfile(false);
  }, [supabase, toast, form]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        fetchProfile(user);
      } else {
        router.push('/login');
      }
    };
    getUser();
  }, [supabase.auth, router, fetchProfile]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleAIBioOptimize = async () => {
    const values = form.getValues();
    if (!values.skills) {
      toast({ title: "More info needed", description: "Please add some skills before optimizing." });
      return;
    }

    setIsOptimizing(true);
    try {
      const result = await aidMaidBioCreation({
        skills: values.skills.split(',').map(s => s.trim()),
        experience: values.experience || 0,
        currentBio: values.bio
      });
      
      form.setValue('bio', result.generatedBio);
      toast({ title: "Bio Optimized", description: "Your bio has been professionally rewritten by AI." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "AI Error", description: "Failed to optimize bio. Please try again." });
    } finally {
      setIsOptimizing(false);
    }
  };

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    if (!user) return;
    setIsSaving(true);
    
    const { user_type, full_name, district, ...rest } = values;

    const { error: userError } = await supabase
      .from('users')
      .update({ full_name, district })
      .eq('id', user.id);
    
    if (userError) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update profile.' });
      setIsSaving(false);
      return;
    }

    let profileError;
    if (user_type === 'maid') {
      const maidData = {
        bio: values.bio,
        hourly_rate: values.hourly_rate,
        experience: values.experience,
        skills: values.skills?.split(",").map(s => s.trim()).filter(s => s !== ""),
        languages: values.languages?.split(",").map(l => l.trim()).filter(l => l !== ""),
        availability: values.availability,
      };

      // Upsert to maids table
      const { error } = await supabase.from('maids').upsert({
        id: user.id,
        ...maidData
      });
      profileError = error;
    }

    setIsSaving(false);

    if (profileError) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update specific profile details.' });
    } else {
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully.",
      });
      fetchProfile(user);
    }
  }

  if (loadingProfile || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const isMaid = profile?.user_type === 'maid';

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <nav className="h-16 border-b bg-white flex items-center px-6 md:px-12 justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Profile Settings</h1>
        </div>
        <Button variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </nav>

      <div className="max-w-4xl mx-auto p-6 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-none shadow-md overflow-hidden">
              <div className="bg-primary/10 p-10 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white mb-4">
                  <img src={profile?.avatar_url || `https://picsum.photos/seed/${user?.id}/150/150`} alt="" />
                </div>
                <h2 className="font-bold text-lg">{profile?.full_name}</h2>
                <Badge className="mt-2 capitalize">{profile?.user_type}</Badge>
              </div>
              <CardContent className="p-6">
                 {isMaid && (
                   <div className={`p-4 rounded-xl flex items-start gap-3 ${profile?.is_verified ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-yellow-50 text-yellow-700 border border-yellow-100'}`}>
                      {profile?.is_verified ? (
                        <>
                          <ShieldCheck className="w-5 h-5 shrink-0" />
                          <div>
                            <p className="font-bold text-sm">Verified Profile</p>
                            <p className="text-xs opacity-80">Your profile is public and visible to employers.</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-5 h-5 shrink-0" />
                          <div>
                            <p className="font-bold text-sm">Pending Verification</p>
                            <p className="text-xs opacity-80">Complete your details. An admin will review your profile shortly.</p>
                          </div>
                        </>
                      )}
                   </div>
                 )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Details</CardTitle>
                <CardDescription>Fill in your professional information to attract {isMaid ? 'employers' : 'maids'}.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input {...field} className="pl-10" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="district"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>District</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input {...field} placeholder="e.g. Kampala" className="pl-10" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {isMaid &&
                        <FormField
                          control={form.control}
                          name="hourly_rate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hourly Rate (UGX)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      }
                    </div>

                    {isMaid && 
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <FormField
                          control={form.control}
                          name="experience"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Years of Experience</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <History className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                  <Input type="number" {...field} className="pl-10" />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    }
                    
                    {isMaid && 
                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex justify-between items-center mb-2">
                               <FormLabel>Professional Bio</FormLabel>
                               <Button 
                                 type="button" 
                                 variant="ghost" 
                                 size="sm" 
                                 className="text-primary gap-1 h-7"
                                 onClick={handleAIBioOptimize}
                                 disabled={isOptimizing}
                               >
                                 {isOptimizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                 AI Optimize
                               </Button>
                            </div>
                            <FormControl>
                              <Textarea {...field} placeholder="Describe your experience and what makes you a great choice..." className="min-h-[120px]" />
                            </FormControl>
                            <FormDescription>At least 20 characters.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    }
                    
                    {isMaid &&
                      <FormField
                        control={form.control}
                        name="skills"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Skills</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input {...field} placeholder="Cleaning, Cooking, Babysitting..." className="pl-10" />
                              </div>
                            </FormControl>
                            <FormDescription>Separate skills with commas.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    }

                    {isMaid &&
                      <FormField
                        control={form.control}
                        name="languages"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Languages</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Languages className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input {...field} placeholder="Luganda, English, Swahili..." className="pl-10" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    }

                    {isMaid &&
                      <FormField
                        control={form.control}
                        name="availability"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Availability</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input {...field} placeholder="Mon-Fri, 8 AM - 5 PM" className="pl-10" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    }

                    <Button type="submit" className="w-full h-12 text-lg" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 w-5 h-5" />
                          Save Profile Details
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
