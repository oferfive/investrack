import { supabase } from '@/lib/supabase';
import type { Asset } from '@/lib/types';

export const assetService = {
  async getAssets() {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching assets:', error);
      throw error;
    }
    
    return data as Asset[];
  },
  
  async addAsset(asset: Omit<Asset, 'id'>) {
    const { data, error } = await supabase
      .from('assets')
      .insert(asset)
      .select()
      .single();
    
    if (error) {
      console.error('Error adding asset:', error);
      throw error;
    }
    
    return data as Asset;
  },
  
  async updateAsset(id: string, asset: Partial<Asset>) {
    const { data, error } = await supabase
      .from('assets')
      .update({
        ...asset,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating asset:', error);
      throw error;
    }
    
    return data as Asset;
  },
  
  async deleteAsset(id: string) {
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting asset:', error);
      throw error;
    }
    
    return true;
  }
}; 