import { useQuery } from 'react-query'
import { MealPlansService } from '../client'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Container,
  Flex,
  Heading,
  IconButton,
  Spinner,
  Stack,
  useDisclosure,
} from '@chakra-ui/react'
import { MealPlanTable } from '../components/MealPlanner/MealPlanTable'
import { DeleteIcon } from '@chakra-ui/icons'
import { DeleteMealPlanModal } from '../components/MealPlans/DeleteMealPlanModal'
import { formatDateRange } from '../components/MealPlans/utils/formatDateRange'
import { isWithinInterval, parseISO } from 'date-fns'

export function MealPlans() {
  const deleteMealPlanModal = useDisclosure()

  const { data: mealPlans, isLoading } = useQuery('meal-plans', () =>
    MealPlansService.readMealPlans({ limit: 50 }),
  )

  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="100vh" width="full">
        <Spinner size="xl" color="ui.main" />
      </Flex>
    )
  }

  const today = new Date()

  const sortedMealPlans = mealPlans?.data.sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  )
  const currentMealPlanId = sortedMealPlans?.find((mealPlan) => {
    const startDate = parseISO(mealPlan.startDate)
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)
    return isWithinInterval(today, { start: startDate, end: endDate })
  })?.id

  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: 'center', md: 'left' }} pt={12}>
        Meal Plans
      </Heading>
      {mealPlans?.data ? (
        <Stack py={8} width="100%">
          <Accordion allowToggle>
            {sortedMealPlans?.map((mealPlan) => (
              <AccordionItem key={mealPlan.id}>
                <Flex as="h2" align="center" justify="space-between">
                  <AccordionButton
                    sx={{ fontSize: '1.5rem' }}
                    color={
                      mealPlan.id === currentMealPlanId ? 'teal.500' : 'inherit'
                    }
                    flex="1"
                    textAlign="left"
                    gap={4}
                  >
                    {formatDateRange(mealPlan.startDate)}
                    <AccordionIcon />
                  </AccordionButton>
                  <IconButton
                    icon={<DeleteIcon boxSize={5} />}
                    onClick={deleteMealPlanModal.onOpen}
                    aria-label="Delete meal plan"
                    size="sm"
                    colorScheme="teal"
                  />
                  <DeleteMealPlanModal
                    mealPlan={mealPlan}
                    isOpen={deleteMealPlanModal.isOpen}
                    onClose={deleteMealPlanModal.onClose}
                  />
                </Flex>
                <AccordionPanel pb={4}>
                  <MealPlanTable plan={mealPlan.plan} />
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </Stack>
      ) : null}
    </Container>
  )
}
