import { Container, Stack, Text } from '@chakra-ui/react'
import useAuth from '../hooks/useAuth'

export function Dashboard() {
  const { user } = useAuth()

  return (
    <>
      <Container maxW="full">
        <Stack pt={12} spacing={4}>
          <Text fontSize="2xl">Hi {user?.fullName} 👋</Text>
        </Stack>
      </Container>
    </>
  )
}
