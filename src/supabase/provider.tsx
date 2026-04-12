import { createClient } from '@/supabase/client';
import { createContext, useContext, useMemo } from 'react';

const SupabaseContext = createContext<any | null>(null);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
    const supabase = useMemo(() => createClient(), []);

    return (
        <SupabaseContext.Provider value={{ supabase }}>
            {children}
        </SupabaseContext.Provider>
    );
}

export const useSupabase = () => {
    const context = useContext(SupabaseContext);

    if (context === undefined) {
        throw new Error('useSupabase must be used within a SupabaseProvider');
    }

    return context;
};