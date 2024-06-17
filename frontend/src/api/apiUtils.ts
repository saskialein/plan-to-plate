import { api } from '../lib/axios'

export type OpenGraphData = {
  title: string
  description: string
  image: string
}

export const fetchOpenGraphData = async (
  url?: string | null,
): Promise<OpenGraphData | null> => {
  try {
    if (!url) {
      console.error('Invalid URL provided for fetching Open Graph data')
      return null
    }
    const apiKey = import.meta.env.VITE_OPENGRAPH_API_KEY
    const response = await api.get(
      `https://opengraph.io/api/1.1/site/${encodeURIComponent(url)}`,
      {
        params: {
          app_id: apiKey,
        },
      },
    )

    const data = response.data.hybridGraph
    return {
      title: data.title || 'No title available',
      description: data.description || 'No description available',
      image: data.image || 'No image available',
    }
  } catch (error) {
    console.error('Error fetching Open Graph data:', error)
    return null
  }
}

export const fetchSignedUrl = async (
  file_path: string,
): Promise<string | null> => {
  try {
    const response = await api.post(
      'http://localhost/api/v1/recipes/generate-signed-url',
      {
        file_name: file_path,
      },
    )
    return response.data.signed_url
  } catch (error) {
    console.error('Error fetching signed URL:', error)
    return null
  }
}
