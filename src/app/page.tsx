"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Shield, Search, Calendar, MapPin, Star, CheckCircle2 } from 'lucide-react';
import SplashScreen from '@/components/shared/SplashScreen';

export default function LandingPage() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-morphism h-16 flex items-center px-6 md:px-12 justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="text-primary h-6 w-6" />
          <span className="font-bold text-xl text-primary tracking-tight">Maids Connect</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-foreground/80 hover:text-primary">Login</Button>
          </Link>
          <Link href="/role-selection">
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-6">Get Started</Button>
          </Link>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6 md:px-12 bg-gradient-to-b from-primary/5 to-transparent overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-5xl md:text-7xl font-extrabold text-foreground leading-[1.1] tracking-tight">
                  Find <span className="text-primary">Trusted</span> Maids in Uganda
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mt-6 max-w-xl">
                  Connect with vetted, reliable, and skilled domestic workers. Whether you need cleaning, babysitting, or cooking, we've got you covered.
                </p>
                <div className="flex flex-wrap gap-4 mt-10">
                  <Link href="/browse">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 rounded-full px-8 h-14 text-lg">
                      Browse Maids
                    </Button>
                  </Link>
                  <Link href="/role-selection">
                    <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-lg border-primary text-primary hover:bg-primary/5">
                      Join as a Maid
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              className="flex-1 relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-8 border-white">
                <img 
                  src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800" 
                  alt="Modern Uganda Home" 
                  className="w-full object-cover aspect-square md:aspect-video"
                  data-ai-hint="modern home"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg z-20 flex items-center gap-3 border border-border">
                <div className="bg-primary/10 p-2 rounded-full">
                  <CheckCircle2 className="text-primary w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-sm">Vetted Profiles</p>
                  <p className="text-xs text-muted-foreground">100% ID Verified</p>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-white p-4 rounded-xl shadow-lg z-20 flex items-center gap-3 border border-border">
                <div className="flex -space-x-2">
                   {[1,2,3].map(i => (
                     <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                       <img src={`https://picsum.photos/seed/${i}/32/32`} alt="user" />
                     </div>
                   ))}
                </div>
                <div>
                  <p className="font-bold text-sm">2k+ Happy Families</p>
                  <p className="text-xs text-muted-foreground">Joined this month</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 md:px-12 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">How Maids Connect Works</h2>
              <p className="text-muted-foreground mt-4">Simple steps to finding your perfect domestic help</p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { icon: Search, title: "Search", desc: "Filter by location, skills, and price." },
                { icon: MapPin, title: "Locate", desc: "View available maids near your district." },
                { icon: Calendar, title: "Book", desc: "Choose your dates and confirm instant bookings." },
                { icon: Star, title: "Review", desc: "Share your experience and rate your maid." },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center text-center p-6 space-y-4 hover:translate-y-[-5px] transition-transform duration-300">
                  <div className="bg-primary/10 p-4 rounded-2xl">
                    <item.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 md:px-12">
          <div className="max-w-5xl mx-auto gradient-bg rounded-3xl p-10 md:p-20 text-center text-white space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            
            <h2 className="text-3xl md:text-5xl font-bold relative z-10">Ready to find your next reliable maid?</h2>
            <p className="text-xl opacity-90 relative z-10 max-w-2xl mx-auto">
              Join thousands of families in Kampala, Entebbe, and across Uganda using Maids Connect.
            </p>
            <div className="pt-6 relative z-10">
              <Link href="/role-selection">
                <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-slate-100 rounded-full px-12 h-14 text-lg font-bold">
                  Join Now
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-50 border-t border-border py-12 px-6 md:px-12 mt-auto">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Shield className="text-primary h-6 w-6" />
              <span className="font-bold text-xl text-primary">Maids Connect</span>
            </Link>
            <p className="text-muted-foreground max-w-sm">
              The #1 domestic worker platform in Uganda. Building trust and safety in every home.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/browse">Browse Maids</Link></li>
              <li><Link href="/map">Map View</Link></li>
              <li><Link href="/role-selection">Join as Provider</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Help Center</li>
              <li>Safety Rules</li>
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-border mt-12 pt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Maids Connect Uganda. All rights reserved.
        </div>
      </footer>
    </div>
  );
}