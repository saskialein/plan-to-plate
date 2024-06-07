import { createFileRoute, redirect } from '@tanstack/react-router'
import { Layout } from '../pages/ui/Layout'
import { isLoggedIn } from '../hooks/useAuth'

export const Route = createFileRoute('/_layout')({
  component: Layout,
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({
        to: '/login',
      })
    }
  },
})
