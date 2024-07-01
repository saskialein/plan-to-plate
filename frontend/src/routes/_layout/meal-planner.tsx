import { createFileRoute } from '@tanstack/react-router'
import { MealPlanner } from '../../pages/MealPlanner'

export const Route = createFileRoute('/_layout/meal-planner')({
  component: MealPlanner,
})
