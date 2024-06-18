import { api } from '../lib/axios'

export type OpenGraphData = {
  viewport: string
  title: string
  description: string
  robots: string
  'twitter:creator': string
  'twitter:site': string
  'og:title': string
  'og:description': string
  'og:type': string
  'og:site_name': string
  'og:url': string
  'og:image': string
  'og:image:alt': string
  'og:image:width': string
  'og:image:height': string
  'twitter:card': string
  'google-site-verification': string
  'p:domain_verify': string
  'fb:pages': string
  'next-head-count': string
}

export const fetchOpenGraphData = async (
  url: string,
): Promise<Partial<OpenGraphData> | null> => {
  try {
    const response = await api.post(
      'http://localhost/api/v1/recipes/fetch-opengraph',
      {
        url,
      },
    )
    const data = response.data
    return {
      title: data.title || 'No title available',
      description: data.description || 'No description available',
      'og:image': data['og:image'] || 'No image available',
    }
  } catch (error) {
    console.error('Error fetching Open Graph data:', error)
    return null
  }
}

export const fetchSignedUrl = async (fileName: string) => {
  try {
    const token = localStorage.getItem('token') // Assuming the token is stored in localStorage
    const response = await api.post(
      'http://localhost/api/v1/recipes/generate-signed-url',
      { file_name: fileName },
      { headers: { Authorization: `Bearer ${token}` } },
    )

    return response.data.signed_url
  } catch (error) {
    console.error('Error fetching signed URL:', error)
  }
}

// export const fetchSignedUrl = async (
//   file_path: string,
// ): Promise<string | null> => {
//   try {
//     const response = await api.post(
//       'http://localhost/api/v1/recipes/generate-signed-url',
//       {
//         file_name: file_path,
//       },
//     )
//     return response.data.signed_url
//   } catch (error) {
//     console.error('Error fetching signed URL:', error)
//     return null
//   }
// }
