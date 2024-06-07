import { createFileRoute } from '@tanstack/react-router'
import { Admin } from '../../pages/Admin'

export const Route = createFileRoute('/_layout/admin')({
  component: Admin,
})
