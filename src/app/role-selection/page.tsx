"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { User, Briefcase, Shield, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function RoleSelection() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <Link href="/" className="flex items-center gap-2 mb-12">
        <Shield className="text-primary h-8 w-8" />
        <span className="font-bold text-2xl text-primary">Maids Connect</span>
      </Link>

      <div className="max-w-3xl w-full text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">How will you use Maids Connect?</h1>
          <p className="text-muted-foreground text-lg">Select the role that best describes you.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.2 }}>
            <Link href="/register?role=employer">
              <Card className="h-full cursor-pointer hover:border-primary border-2 transition-all p-8 flex flex-col items-center text-center space-y-6">
                <div className="bg-primary/10 p-6 rounded-full">
                  <User className="w-12 h-12 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">I am an Employer</h2>
                  <p className="text-muted-foreground">I am looking for a reliable domestic worker for my home.</p>
                </div>
                <Button className="w-full h-12 rounded-full" variant="outline">
                  Select <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Card>
            </Link>
          </motion.div>

          <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.2 }}>
            <Link href="/register?role=maid">
              <Card className="h-full cursor-pointer hover:border-accent border-2 transition-all p-8 flex flex-col items-center text-center space-y-6">
                <div className="bg-accent/10 p-6 rounded-full">
                  <Briefcase className="w-12 h-12 text-accent" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">I am a Maid</h2>
                  <p className="text-muted-foreground">I am a domestic worker looking for employment opportunities.</p>
                </div>
                <Button className="w-full h-12 rounded-full border-accent text-accent hover:bg-accent/5" variant="outline">
                  Select <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Card>
            </Link>
          </motion.div>
        </div>

        <p className="text-muted-foreground">
          Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}