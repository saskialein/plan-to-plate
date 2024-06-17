import { Stack } from '@chakra-ui/react'
import type { RecipesOut } from '../../client'
import { RecipeCard } from './RecipeCard'

export function RecipeList({ recipes }: { recipes: RecipesOut }) {
  return (
    <Stack>
      {recipes.data.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </Stack>
  )
}
