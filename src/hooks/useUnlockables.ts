import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from './useProfile';
import { toast } from 'sonner';

export const useUnlockables = () => {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const queryClient = useQueryClient();

  const unlockablesQuery = useQuery({
    queryKey: ['unlockables', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_unlockables')
        .select('*')
        .eq('user_id', user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const purchaseItem = useMutation({
    mutationFn: async ({ itemId, cost }: { itemId: string; cost: number }) => {
      if (!user || !profile) throw new Error('Not authenticated');
      if (profile.treat_count < cost) throw new Error('Not enough treats!');

      const { error } = await supabase.from('user_unlockables').insert({
        user_id: user.id,
        item_id: itemId,
        item_type: 'cosmetic',
      });
      if (error) throw error;

      await updateProfile.mutateAsync({ treat_count: profile.treat_count - cost });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unlockables', user?.id] });
      toast.success('🎉 New item unlocked!');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const unlockBadge = useMutation({
    mutationFn: async (badgeId: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('user_unlockables').insert({
        user_id: user.id,
        item_id: badgeId,
        item_type: 'badge',
      });
      if (error && !error.message.includes('duplicate')) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unlockables', user?.id] });
    },
  });

  return {
    unlockables: unlockablesQuery.data || [],
    isLoading: unlockablesQuery.isLoading,
    purchaseItem,
    unlockBadge,
  };
};
