import { createFileRoute } from '@tanstack/react-router'
import { UserSettings } from '../../pages/UserSettings'

export const Route = createFileRoute('/_layout/settings')({
  component: UserSettings,
})
