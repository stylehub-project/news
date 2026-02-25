export const CLOUD_NAME = 'd_7066c22f-84e3-4622-a3ea-df6f2a61aee8';
export const API_KEY = '884247873451835';
export const API_SECRET = 'YMIVl-hidOuXm0yYkzq7xX0raKg';

async function sha1(str: string) {
  const buffer = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest('SHA-1', buffer);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function uploadToCloudinary(file: Blob | string, resourceType: 'auto' | 'raw' | 'video' = 'auto', tags: string = '') {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  
  // Parameters to sign must be sorted alphabetically
  let paramsToSign = `timestamp=${timestamp}`;
  if (tags) {
    paramsToSign = `tags=${tags}&${paramsToSign}`;
  }
  
  const signatureString = `${paramsToSign}${API_SECRET}`;
  const signature = await sha1(signatureString);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', API_KEY);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);
  if (tags) {
    formData.append('tags', tags);
  }

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, {
    method: 'POST',
    body: formData
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error?.message || 'Upload failed');
  }
  
  return res.json();
}

export async function fetchSavedNews() {
  const auth = btoa(`${API_KEY}:${API_SECRET}`);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/search`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      expression: 'resource_type:raw AND tags:sips_news',
      sort_by: [{ created_at: 'desc' }],
      max_results: 50
    })
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error?.message || 'Fetch failed');
  }
  
  const data = await res.json();
  
  // Fetch the actual JSON content for each resource
  const newsItems = await Promise.all(data.resources.map(async (resource: any) => {
    try {
      const jsonRes = await fetch(resource.secure_url);
      const jsonData = await jsonRes.json();
      return {
        id: resource.public_id,
        createdAt: resource.created_at,
        ...jsonData
      };
    } catch (e) {
      return null;
    }
  }));
  
  return newsItems.filter(item => item !== null);
}
