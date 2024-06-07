import { createFileRoute, redirect } from '@tanstack/react-router'
import { isLoggedIn } from '../hooks/useAuth'
import { Login } from '../pages/Login'

export const Route = createFileRoute('/login')({
  component: Login,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: '/',
      })
    }
  },
})
