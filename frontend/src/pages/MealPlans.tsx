import { useQuery } from 'react-query'
import { MealPlansService } from '../client'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Container,
  Flex,
  Heading,
  Spinner,
  Stack,
} from '@chakra-ui/react'
import { MealPlanTable } from '../components/MealPlanner/MealPlanTable'

export function MealPlans() {
  const { data: mealPlans, isLoading } = useQuery('recipes', () =>
    MealPlansService.readMealPlans({ limit: 50 }),
  )

  const formatDateRange = (startDate: string) => {
    const start = new Date(startDate)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }
    const startFormatted = start
      .toLocaleDateString('en-GB', options)
      .replace(/,/g, '')
    const endFormatted = end
      .toLocaleDateString('en-GB', options)
      .replace(/,/g, '')

    return `${startFormatted} - ${endFormatted}`
  }

  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="100vh" width="full">
        <Spinner size="xl" color="ui.main" />
      </Flex>
    )
  }

  const sortedMealPlans = mealPlans?.data.sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  )
  const latestMealPlanId = sortedMealPlans?.[0]?.id

  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: 'center', md: 'left' }} pt={12}>
        Meal Plans
      </Heading>
      <Stack py={8} width="100%">
        <Accordion allowToggle>
          {sortedMealPlans?.map((mealPlan) => (
            <AccordionItem
              key={mealPlan.id}
              borderColor={
                mealPlan.id === latestMealPlanId ? 'teal.500' : 'gray.200'
              }
            >
              <h2>
                <AccordionButton
                  sx={{ fontSize: '1.5rem' }}
                  color={
                    mealPlan.id === latestMealPlanId ? 'teal.500' : 'inherit'
                  }
                >
                  <Box flex="1" textAlign="left">
                    {formatDateRange(mealPlan.startDate)}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <MealPlanTable plan={mealPlan.plan} />
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </Stack>
    </Container>
  )
}
