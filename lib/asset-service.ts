import { supabase } from '@/lib/supabase';
import type { Asset } from '@/lib/types';

export const assetService = {
  async getAssets() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting current user:', userError);
        return [];
      }
      
      if (!user) {
        console.error('No authenticated user found when fetching assets');
        return [];
      }
      
      console.log('Fetching assets for user:', user.id);
      
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching assets:', error);
        return [];
      }
      
      console.log(`Successfully fetched ${data?.length || 0} assets for user ${user.id}`);
      return data as Asset[];
    } catch (err) {
      console.error('Unexpected error in getAssets:', err);
      return [];
    }
  },
  
  async addAsset(asset: Omit<Asset, 'id'>) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting current user:', userError);
        throw new Error('Failed to authenticate user');
      }
      
      if (!user) {
        console.error('No authenticated user found when adding asset');
        throw new Error('User not authenticated');
      }
      
      // Ensure user_id is set to current user
      const assetWithUserId = {
        ...asset,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Adding asset with data:', {
        ...assetWithUserId,
        user_id: user.id // Explicitly log user_id
      });
      
      const { data, error } = await supabase
        .from('assets')
        .insert(assetWithUserId)
        .select()
        .single();
      
      if (error) {
        console.error('Error adding asset:', error);
        throw error;
      }
      
      console.log('Successfully added asset:', data);
      return data as Asset;
    } catch (err) {
      console.error('Unexpected error in addAsset:', err);
      throw err;
    }
  },
  
  async updateAsset(id: string, asset: Partial<Asset>) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting current user:', userError);
        throw new Error('Failed to authenticate user');
      }
      
      if (!user) {
        console.error('No authenticated user found when updating asset');
        throw new Error('User not authenticated');
      }
      
      console.log(`Updating asset ${id} for user ${user.id}:`, asset);
      
      const { data, error } = await supabase
        .from('assets')
        .update({
          ...asset,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating asset:', error);
        throw error;
      }
      
      console.log('Successfully updated asset:', data);
      return data as Asset;
    } catch (err) {
      console.error('Unexpected error in updateAsset:', err);
      throw err;
    }
  },
  
  async deleteAsset(id: string) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting current user:', userError);
        throw new Error('Failed to authenticate user');
      }
      
      if (!user) {
        console.error('No authenticated user found when deleting asset');
        throw new Error('User not authenticated');
      }
      
      console.log(`Deleting asset ${id} for user ${user.id}`);
      
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error deleting asset:', error);
        throw error;
      }
      
      console.log(`Successfully deleted asset ${id}`);
      return true;
    } catch (err) {
      console.error('Unexpected error in deleteAsset:', err);
      throw err;
    }
  }
}; 