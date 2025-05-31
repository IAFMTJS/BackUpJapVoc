import { deleteDB } from 'idb';

export async function clearDictionaryDB(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[Dictionary] Deleting DictionaryDB...');
    await deleteDB('DictionaryDB');
    console.log('[Dictionary] DictionaryDB deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('[Dictionary] Error deleting DictionaryDB:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
} 