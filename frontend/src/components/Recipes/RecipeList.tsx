import { Box, SimpleGrid, Text } from '@chakra-ui/react'
import type { RecipesOut } from '../../client'
import { RecipeCard } from './RecipeCard'

export function RecipeList({ recipes }: { recipes?: RecipesOut['data'] }) {
  return (
    <SimpleGrid minChildWidth="300px" spacing={4}>
      {recipes?.length === 0 ? (
        <Box width="full" textAlign="center">
          <Text fontSize="xl">No recipes found</Text>
        </Box>
      ) : (
        recipes?.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)
      )}
    </SimpleGrid>
  )
}
