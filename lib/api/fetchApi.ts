import { auth } from '@/auth';

/**
 * A wrapper around native fetch that automatically attaches the access token
 * from the NextAuth session for server-side data fetching.
 */
export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const session = await auth();
  const accessToken = session?.accessToken;

  const headers = new Headers(options.headers);
  
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  
  // Set default Content-Type if not provided
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const baseUrl = process.env.API_BASE_URL || '';
  const url = `${baseUrl}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    console.error(`API fetch error for ${url}: Status ${response.status}`);
    throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
  }

  // Handle empty responses
  if (response.status === 204) {
    return null as unknown as T;
  }

  return response.json();
}
