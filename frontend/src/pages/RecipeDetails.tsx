import {
  Box,
  Container,
  Heading,
  ListItem,
  UnorderedList,
} from '@chakra-ui/react'
import { useParams } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { Meal } from '../client'

export function RecipeDetails() {
  const { recipeId } = useParams({ from: '/recipes/:recipeTitle' })
  const [recipe, setRecipe] = useState<Meal | null>(null)

  useEffect(() => {
    const stateKey = `recipe-${recipeId}`
    const storedState = localStorage.getItem(stateKey)
    if (storedState) {
      setRecipe(JSON.parse(storedState))
    }

    const handleBeforeUnload = () => {
      localStorage.removeItem(stateKey)
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [recipeId])

  if (!recipe) {
    return <Box p={4}>Loading...</Box>
  }

  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: 'center', md: 'left' }} pt={12}>
        {recipe?.recipe}
      </Heading>
      {recipe?.ingredients && (
        <Box mt="4">
          <Heading size="md">Ingredients:</Heading>
          <UnorderedList mt="2" spacing="1">
            {recipe.ingredients.map((ingredient, index) => (
              <ListItem key={index}>{ingredient}</ListItem>
            ))}
          </UnorderedList>
        </Box>
      )}
      {recipe?.recipe_steps && (
        <Box mt="4">
          <Heading size="md">Steps:</Heading>
          <UnorderedList
            styleType="none"
            mt="2"
            spacing="1"
            marginInlineStart={0}
          >
            {recipe.recipe_steps.map((step, index) => (
              <ListItem key={index}>{step}</ListItem>
            ))}
          </UnorderedList>
        </Box>
      )}
    </Container>
  )
}
