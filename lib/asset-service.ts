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
      // First try to get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        throw new Error('Failed to get session');
      }
      
      if (!session) {
        console.error('No active session found');
        throw new Error('No active session');
      }
      
      // Ensure user_id is set to current user
      const assetWithUserId = {
        ...asset,
        user_id: session.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Adding asset with data:', {
        ...assetWithUserId,
        user_id: session.user.id
      });
      
      // Try to insert the asset
      const { data, error } = await supabase
        .from('assets')
        .insert(assetWithUserId)
        .select()
        .single();
      
      if (error) {
        console.error('Error adding asset:', error);
        
        // If the error is due to an invalid session, try to refresh it
        if (error.message.includes('JWT expired') || error.message.includes('Invalid JWT')) {
          console.log('Session appears to be invalid, attempting to refresh...');
          
          const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error('Error refreshing session:', refreshError);
            throw new Error('Failed to refresh session');
          }
          
          if (!newSession) {
            throw new Error('No session after refresh');
          }
          
          // Retry the insert with the new session
          const { data: retryData, error: retryError } = await supabase
            .from('assets')
            .insert({
              ...assetWithUserId,
              user_id: newSession.user.id
            })
            .select()
            .single();
            
          if (retryError) {
            console.error('Error on retry after session refresh:', retryError);
            throw retryError;
          }
          
          console.log('Successfully added asset after session refresh:', retryData);
          return retryData as Asset;
        }
        
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