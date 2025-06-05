// Utility for making HTTP requests that work in extension environment
export const backgroundFetch = async (url: string, options?: RequestInit): Promise<any> => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Background fetch error:', error);
    throw error;
  }
};
