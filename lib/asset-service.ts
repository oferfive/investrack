import { supabase } from '@/lib/supabase';
import type { Asset } from '@/lib/types';

export const assetService = {
  async getAssets() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found when fetching assets');
      return [];
    }
    
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching assets:', error);
      throw error;
    }
    
    return data as Asset[];
  },
  
  async addAsset(asset: Omit<Asset, 'id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found when adding asset');
      throw new Error('User not authenticated');
    }
    
    // Ensure user_id is set to current user
    const assetWithUserId = {
      ...asset,
      user_id: user.id
    };
    
    const { data, error } = await supabase
      .from('assets')
      .insert(assetWithUserId)
      .select()
      .single();
    
    if (error) {
      console.error('Error adding asset:', error);
      throw error;
    }
    
    return data as Asset;
  },
  
  async updateAsset(id: string, asset: Partial<Asset>) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found when updating asset');
      throw new Error('User not authenticated');
    }
    
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
    
    return data as Asset;
  },
  
  async deleteAsset(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found when deleting asset');
      throw new Error('User not authenticated');
    }
    
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error deleting asset:', error);
      throw error;
    }
    
    return true;
  }
}; 