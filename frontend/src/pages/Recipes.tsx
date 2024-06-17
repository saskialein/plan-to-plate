import { Container, Flex, Heading, Spinner } from '@chakra-ui/react'
import Navbar from '../components/Common/Navbar'
import useCustomToast from '../hooks/useCustomToast'
import { useQuery } from 'react-query'
import type { ApiError } from '../client'
import { RecipesService } from '../client'
import { RecipeList } from '../components/Recipes/RecipeList'

export function Recipes() {
  const showToast = useCustomToast()

  const {
    data: recipes,
    isLoading,
    isError,
    error,
  } = useQuery('recipes', () => RecipesService.readRecipes({}))

  if (isError) {
    const errDetail = (error as ApiError).body?.detail
    showToast('Something went wrong.', `${errDetail}`, 'error')
  }

  return (
    <>
      {isLoading ? (
        // TODO: Add skeleton
        <Flex justify="center" align="center" height="100vh" width="full">
          <Spinner size="xl" color="ui.main" />
        </Flex>
      ) : (
        recipes && (
          <Container maxW="full">
            <Heading
              size="lg"
              textAlign={{ base: 'center', md: 'left' }}
              pt={12}
            >
              Recipes
            </Heading>
            <Navbar type={'Recipe'} />
            <RecipeList recipes={recipes} />
          </Container>
        )
      )}
    </>
  )
}
