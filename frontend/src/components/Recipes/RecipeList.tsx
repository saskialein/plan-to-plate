import { SimpleGrid } from '@chakra-ui/react'
import type { RecipesOut } from '../../client'
import { RecipeCard } from './RecipeCard'

export function RecipeList({ recipes }: { recipes: RecipesOut }) {
  return (
    <SimpleGrid minChildWidth="300px" spacing={4}>
      {recipes.data.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </SimpleGrid>
  )
}
