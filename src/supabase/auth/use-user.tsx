"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@/supabase/client';
import type { User } from '@supabase/supabase-js';

export function useUser() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    
    // Initial fetch
    supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user);
    })

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase.auth]);

  return user;
}
