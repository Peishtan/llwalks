import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getDaysInMonth } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from './useProfile';
import { toast } from 'sonner';

export const useActivities = () => {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const queryClient = useQueryClient();

  const activitiesQuery = useQuery({
    queryKey: ['activities', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const logActivity = useMutation({
    mutationFn: async ({ type, weather, date }: { type: 'walk' | 'pee' | 'poop'; weather: 'sun' | 'rain'; date?: Date }) => {
      if (!user || !profile) throw new Error('Not authenticated');

      let treatsEarned = 0;
      let bonus = false;

      if (type === 'pee') treatsEarned = 1;
      if (type === 'poop') treatsEarned = 2;

      // Check if there's a walk logged today for bonus
      if ((type === 'pee' || type === 'poop') && activitiesQuery.data) {
        const today = new Date().toISOString().split('T')[0];
        const todayWalk = activitiesQuery.data.find(
          a => a.activity_type === 'walk' && a.logged_at.startsWith(today)
        );
        if (todayWalk) {
          treatsEarned += 1;
          bonus = true;
        }
      }

      const { error } = await supabase.from('activity_log').insert({
        user_id: user.id,
        activity_type: type,
        weather,
        treats_earned: treatsEarned,
        bonus_earned: bonus,
        ...(date ? { logged_at: date.toISOString() } : {}),
      });
      if (error) throw error;

      // Update profile
      const updates: Record<string, number | string> = {};
      if (type === 'walk') {
        updates.path_position = Math.min((profile.path_position || 0) + 1, getDaysInMonth(new Date()));
      }
      if (treatsEarned > 0) {
        updates.treat_count = (profile.treat_count || 0) + treatsEarned;
      }

      if (Object.keys(updates).length > 0) {
        await updateProfile.mutateAsync(updates);
      }

      return { type, treatsEarned, bonus };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['activities', user?.id] });
      toast.success('Walk logged!');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return { activities: activitiesQuery.data || [], isLoading: activitiesQuery.isLoading, logActivity };
};
