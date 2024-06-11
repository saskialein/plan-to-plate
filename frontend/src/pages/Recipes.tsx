import { Container, Flex, Heading, Spinner } from '@chakra-ui/react'
import Navbar from '../components/Common/Navbar'

export function Recipes() {
  const isLoading = false
  const recipes = true
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
          </Container>
        )
      )}
    </>
  )
}
