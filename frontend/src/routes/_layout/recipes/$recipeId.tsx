import { createFileRoute } from '@tanstack/react-router'
import { RecipeDetails } from '../../../pages/RecipeDetails'

export const Route = createFileRoute('/_layout/recipes/$recipeId')({
  component: RecipeDetails,
})
