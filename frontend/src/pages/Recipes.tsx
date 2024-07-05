import { useState } from 'react'
import { Container, Flex, Heading, Spinner } from '@chakra-ui/react'
import { HeaderActions } from '../components/Common/HeaderActions'
import useCustomToast from '../hooks/useCustomToast'
import { useQuery } from 'react-query'
import type { ApiError } from '../client'
import { RecipesService } from '../client'
import { RecipeList } from '../components/Recipes/RecipeList'

export function Recipes() {
  const showToast = useCustomToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')

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

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSelectedCategory(event.target.value)
  }

  const filteredRecipes = recipes?.data?.filter((recipe) => {
    const matchesSearchQuery = recipe.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory
      ? recipe?.categories?.includes(selectedCategory)
      : true
    return matchesSearchQuery && matchesCategory
  })
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
            <HeaderActions
              type="Recipe"
              onSearch={handleSearch}
              onCategoryChange={handleCategoryChange}
            />

            <RecipeList recipes={filteredRecipes} />
          </Container>
        )
      )}
    </>
  )
}
