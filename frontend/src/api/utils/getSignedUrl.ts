import { useQuery } from 'react-query'
import { api } from '../../lib/axios'

const fetchSignedUrl = async (fileName: string) => {
  try {
    const response = await api.post(
      'http://localhost/api/v1/recipes/generate-signed-url',
      { file_name: fileName },
    )
    return response.data.signed_url
  } catch (error) {
    return error
  }
}

export const useFetchSignedUrl = (fileName: string) => {
  return useQuery(['signedUrl', fileName], () => fetchSignedUrl(fileName), {
    enabled: !!fileName,
  })
}
