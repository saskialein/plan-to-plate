import { Container, Stack, Text } from '@chakra-ui/react'
import { MealPlanGenerator } from '../components/MealPlanner/MealPlanGenerator'

export function MealPlanner() {
  return (
    <>
      <Container maxW="full">
        <Stack pt={12} spacing={4}>
          <Text fontSize="2xl">Let&apos;s plan your meals for the week!</Text>
          <MealPlanGenerator />
        </Stack>
      </Container>
    </>
  )
}
