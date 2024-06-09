// import { useQueryClient } from 'react-query'
// import { UserOut } from '../client'
import { Container, Stack, Text } from '@chakra-ui/react'
import { LLMQuery } from '../components/Dashboard/LLMQuery'

export function Dashboard() {
  // const queryClient = useQueryClient()

  // const currentUser = queryClient.getQueryData<UserOut>('currentUser')

  return (
    <>
      <Container maxW="full">
        <Stack pt={12} spacing={4}>
          {/* <Box pt={12}> */}
          <Text fontSize="2xl">Let's plan your meals for the week!</Text>
          {/* </Box> */}
          <LLMQuery />
        </Stack>
      </Container>
    </>
  )
}
