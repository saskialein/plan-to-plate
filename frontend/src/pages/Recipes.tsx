import { Container, Flex, Heading, Spinner } from '@chakra-ui/react'
import { HeaderActions } from '../components/Common/HeaderActions'
import useCustomToast from '../hooks/useCustomToast'
import { useQuery } from 'react-query'
import type { ApiError } from '../client'
import { RecipesService } from '../client'
import { RecipeList } from '../components/Recipes/RecipeList'
import { useState } from 'react'

export function Recipes() {
  const showToast = useCustomToast()
  const [searchQuery, setSearchQuery] = useState('')

  const {
    data: recipes,
    isLoading,
    isError,
    error,
  } = useQuery('recipes', () => RecipesService.readRecipes({ limit: 50 }))

  if (isError) {
    const errDetail = (error as ApiError).body?.detail
    showToast('Something went wrong.', `${errDetail}`, 'error')
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const filteredRecipes = recipes?.data?.filter((recipe) =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
            <HeaderActions type="Recipe" onSearch={handleSearch} />
            <RecipeList recipes={filteredRecipes} />
          </Container>
        )
      )}
    </>
  )
}
