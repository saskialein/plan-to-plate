import ReactDOM from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import {
  type DefaultOptions,
  QueryClient,
  QueryClientProvider,
} from 'react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import './assets/fonts/fonts.css'

import { OpenAPI } from './client'
import theme from './theme'
import { StrictMode } from 'react'

OpenAPI.BASE = import.meta.env.VITE_API_URL
OpenAPI.TOKEN = async () => {
  return localStorage.getItem('access_token') || ''
}

const queryConfig: DefaultOptions = {
  queries: {
    staleTime: 5 * 60 * 1000,
    // refetchOnWindowFocus: false,
    // retry: false,
  },
}

const queryClient = new QueryClient({
  defaultOptions: queryConfig,
})

const router = createRouter({ routeTree })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ChakraProvider>
  </StrictMode>,
)
