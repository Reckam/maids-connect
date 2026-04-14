
"use client";

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  User, 
  Mail, 
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
import { useUser, useFirestore, useDoc, useAuth } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Link from 'next/link';
import { aidMaidBioCreation } from '@/ai/flows/aid-maid-bio-creation';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';

const profileSchema = z.object({
  full_name: z.string().min(2, { message: "Name is too short" }),
  district: z.string().min(2, { message: "Please enter your district" }),
  bio: z.string().min(20, { message: "Bio must be at least 20 characters" }),
  hourly_rate: z.coerce.number().min(1000, { message: "Rate must be at least 1,000 UGX" }),
  experience: z.coerce.number().min(0, { message: "Experience cannot be negative" }),
  skills: z.string().describe("Comma separated skills"),
  languages: z.string().describe("Comma separated languages"),
  availability: z.string().min(2, { message: "Please describe your availability" }),
});

export default function ProfileManagementPage() {
  const { user } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const profileRef = user ? doc(db, 'users', user.uid) : null;
  const { data: profile, loading: loadingProfile } = useDoc(profileRef);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      district: "",
      bio: "",
      hourly_rate: 0,
      experience: 0,
      skills: "",
      languages: "",
      availability: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        full_name: profile.full_name || "",
        district: profile.district || "",
        bio: profile.bio || "",
        hourly_rate: profile.hourly_rate || 0,
        experience: profile.experience || 0,
        skills: profile.skills?.join(", ") || "",
        languages: profile.languages?.join(", ") || "",
        availability: profile.availability || "",
      });
    }
  }, [profile, form]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  };

  const handleOptimizeBio = async () => {
    const values = form.getValues();
    const skillsArray = values.skills.split(",").map(s => s.trim()).filter(s => s !== "");
    
    if (skillsArray.length === 0) {
      toast({
        variant: "destructive",
        title: "Missing Info",
        description: "Please add some skills first so the AI can write a better bio for you.",
      });
      return;
    }

    setIsOptimizing(true);
    try {
      const result = await aidMaidBioCreation({
        skills: skillsArray,
        experience: values.experience,
        currentBio: values.bio
      });

      if (result.generatedBio) {
        form.setValue('bio', result.generatedBio);
        toast({
          title: "Bio Optimized!",
          description: "Your bio has been professionally refined by AI.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Optimization Failed",
        description: "We couldn't reach the AI assistant. Please try again later.",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    if (!profileRef) return;
    setIsSaving(true);

    const updateData = {
      ...values,
      skills: values.skills.split(",").map(s => s.trim()).filter(s => s !== ""),
      languages: values.languages.split(",").map(s => s.trim()).filter(s => s !== ""),
      updated_at: serverTimestamp(),
    };

    updateDoc(profileRef, updateData)
      .then(() => {
        setIsSaving(false);
        toast({
          title: "Profile Updated",
          description: "Your changes have been saved successfully.",
        });
      })
      .catch(async (error) => {
        setIsSaving(false);
        const permissionError = new FirestorePermissionError({
          path: profileRef.path,
          operation: 'update',
          requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  }

  if (loadingProfile) {
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
                  <img src={profile?.avatar_url || `https://picsum.photos/seed/${user?.uid}/96/96`} alt="" />
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
                    </div>

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

                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between items-center mb-2">
                             <FormLabel>Professional Bio</FormLabel>
                             {isMaid && (
                               <Button 
                                 type="button" 
                                 variant="ghost" 
                                 size="sm" 
                                 className="text-primary gap-1 h-7"
                                 onClick={handleOptimizeBio}
                                 disabled={isOptimizing}
                               >
                                 {isOptimizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                 AI Optimize
                               </Button>
                             )}
                          </div>
                          <FormControl>
                            <Textarea {...field} placeholder="Describe your experience and what makes you a great choice..." className="min-h-[120px]" />
                          </FormControl>
                          <FormDescription>At least 20 characters.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
