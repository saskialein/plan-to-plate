import { useQuery } from 'react-query'
import { toCamelCase } from '../../utils/camelCase'
import { api } from '../../lib/axios'

export type OpenGraphData = {
  viewport: string
  title: string
  description: string
  robots: string
  twitterCreator: string
  twitterSite: string
  ogTitle: string
  ogDescription: string
  ogType: string
  ogSiteName: string
  ogUrl: string
  ogImage: string
  ogImageAlt: string
  ogImageWidth: string
  ogImageHeight: string
  twitterCard: string
  googleSiteVerification: string
  pDomainVerify: string
  fbPages: string
  nextHeadCount: string
}

type AnyObject = Record<string, unknown>

type CamelCase<T> = {
  [K in keyof T as K extends string
    ? CamelCaseString<K>
    : never]: T[K] extends AnyObject ? CamelCase<T[K]> : T[K]
}

type CamelCaseString<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<CamelCaseString<U>>}`
  : S extends `${infer T}-${infer U}`
    ? `${T}${Capitalize<CamelCaseString<U>>}`
    : S

const keysToCamelCase = <T>(obj: T): T extends AnyObject ? CamelCase<T> : T => {
  if (obj === null || obj === undefined)
    return obj as T extends AnyObject ? CamelCase<T> : T
  if (typeof obj !== 'object')
    return obj as T extends AnyObject ? CamelCase<T> : T

  if (Array.isArray(obj)) {
    return obj.map((v) => keysToCamelCase(v)) as unknown as T extends AnyObject
      ? CamelCase<T>
      : T
  }

  const result = Object.keys(obj).reduce((res, key) => {
    const newKey = toCamelCase(key) as keyof CamelCase<T>
    ;(res as AnyObject)[newKey] = keysToCamelCase((obj as AnyObject)[key])
    return res
  }, {} as AnyObject)

  return result as T extends AnyObject ? CamelCase<T> : T
}

const fetchOpenGraphData = async (
  url: string,
): Promise<Partial<OpenGraphData>> => {
  const response = await api.post(
    'http://localhost/api/v1/recipes/fetch-opengraph',
    { url },
  )
  const data = response.data
  const camelCaseData = keysToCamelCase({
    title: data.title || data['og:title'] || 'No title available',
    description: data.description || 'No description available',
    ogImage: data['og:image'] || 'No image available',
  })
  return camelCaseData
}

export const useFetchOpenGraphData = (url: string) => {
  return useQuery(['openGraphData', url], () => fetchOpenGraphData(url), {
    enabled: !!url,
  })
}
