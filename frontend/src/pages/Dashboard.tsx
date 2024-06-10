import { Container, Stack, Text } from '@chakra-ui/react'
import { MealPlanGenerator } from '../components/Dashboard/MealPlanGenerator'

export function Dashboard() {
  return (
    <>
      <Container maxW="full">
        <Stack pt={12} spacing={4}>
          {/* <Box pt={12}> */}
          <Text fontSize="2xl">Let's plan your meals for the week!</Text>
          {/* </Box> */}
          <MealPlanGenerator />
        </Stack>
      </Container>
    </>
  )
}
