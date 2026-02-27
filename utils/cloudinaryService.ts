// We are replacing Cloudinary with IndexedDB to ensure saving works reliably
// without depending on external API keys or network conditions.

const DB_NAME = 'SipsNewsDB';
const STORE_NAME = 'saved_broadcasts';
const DB_VERSION = 1;

function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export async function uploadToCloudinary(file: Blob | string, resourceType: 'auto' | 'raw' | 'video' = 'auto', tags: string = '') {
  // Mock upload - we don't actually upload to Cloudinary anymore.
  // We just return a fake URL. The actual saving happens in saveToCloudinary in the component.
  // Wait, the component expects a secure_url.
  if (file instanceof Blob) {
      const url = URL.createObjectURL(file);
      return { secure_url: url };
  }
  return { secure_url: file };
}

// We will export a new function to save directly to IndexedDB
export async function saveBroadcastToDB(metadata: any, audioBlob: Blob) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        const item = {
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            audioBlob: audioBlob,
            ...metadata
        };
        
        const request = store.add(item);
        request.onsuccess = () => resolve(item);
        request.onerror = () => reject(request.error);
    });
}

export async function fetchSavedNews() {
  try {
    const db = await initDB();
    return new Promise<any[]>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        
        request.onsuccess = () => {
            // Sort by newest first
            const items = request.result.sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            
            // Convert blobs to URLs for playback
            const processedItems = items.map(item => ({
                ...item,
                audioUrl: URL.createObjectURL(item.audioBlob)
            }));
            
            resolve(processedItems);
        };
        request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error fetching saved news from DB:", error);
    return []; // Return empty array instead of throwing to prevent UI crashes
  }
}
