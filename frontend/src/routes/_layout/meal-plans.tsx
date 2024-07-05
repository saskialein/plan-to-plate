import { createFileRoute } from '@tanstack/react-router'
import { MealPlans } from '../../pages/MealPlans'

export const Route = createFileRoute('/_layout/meal-plans')({
  component: MealPlans,
})
