import { createFileRoute } from '@tanstack/react-router'
import { Items } from '../../pages/Items'

export const Route = createFileRoute('/_layout/items')({
  component: Items,
})
