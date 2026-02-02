const STORAGE_KEY = 'granular_copy_data';

/**
 * Saves extracted properties to Figma's client storage.
 */
export async function saveProperties(data: any): Promise<void> {
  try {
    await figma.clientStorage.setAsync(STORAGE_KEY, data);
  } catch (error) {
    console.error('Failed to save properties to clientStorage:', error);
  }
}

/**
 * Loads previously saved properties from Figma's client storage.
 */
export async function loadProperties(): Promise<any> {
  try {
    return await figma.clientStorage.getAsync(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to load properties from clientStorage:', error);
    return null;
  }
}
