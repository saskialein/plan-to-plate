import { Container, Stack, Text } from '@chakra-ui/react'

export function Dashboard() {
  return (
    <>
      <Container maxW="full">
        <Stack pt={12} spacing={4}>
          <Text fontSize="2xl">Hi 👋</Text>
        </Stack>
      </Container>
    </>
  )
}
