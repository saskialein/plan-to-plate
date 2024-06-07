import { createFileRoute, redirect } from '@tanstack/react-router'
import { isLoggedIn } from '../hooks/useAuth'
import { RecoverPassword } from '../pages/RecoverPassword'

export const Route = createFileRoute('/recover-password')({
  component: RecoverPassword,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: '/',
      })
    }
  },
})
