import { createFileRoute, redirect } from '@tanstack/react-router'
import { isLoggedIn } from '../hooks/useAuth'
import { ResetPassword } from '../pages/ResetPassword'

export const Route = createFileRoute('/reset-password')({
  component: ResetPassword,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: '/',
      })
    }
  },
})
