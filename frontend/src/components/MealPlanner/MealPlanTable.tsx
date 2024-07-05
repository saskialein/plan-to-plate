import {
  Box,
  Button,
  Link,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from '@chakra-ui/react'
import { Link as RouterLink } from '@tanstack/react-router'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { formatTitleToUrl } from '../../utils/route'
import type { Meal, MealPlan } from '../../client'
import { SaveMealPlanModal } from './SaveMealPlanModal'

type MealPlanTableProps = {
  plan: Record<string, MealPlan>
}
const openInNewTab = (recipe: Meal) => {
  const url = `/recipes/${formatTitleToUrl(recipe.recipe)}`
  const stateKey = `recipe-${formatTitleToUrl(recipe.recipe)}`

  localStorage.setItem(stateKey, JSON.stringify(recipe))
  window.open(url, '_blank', 'noopener,noreferrer')
}

export function MealPlanTable({ plan }: MealPlanTableProps) {
  const saveMealPlanModal = useDisclosure()

  return (
    <Stack spacing={8} alignItems="center" mb={8}>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Day</Th>
            <Th>Breakfast</Th>
            <Th>Lunch</Th>
            <Th>Dinner</Th>
          </Tr>
        </Thead>
        <Tbody>
          {Object.keys(plan).map((day) => (
            <Tr key={day}>
              <Td>{day.charAt(0).toUpperCase() + day.slice(1)}</Td>
              <Td>
                {plan[day].breakfast.url ? (
                  <Link
                    href={plan[day].breakfast.url ?? ''}
                    color="teal.500"
                    isExternal
                  >
                    {plan[day].breakfast.recipe} <ExternalLinkIcon mx="2px" />
                  </Link>
                ) : (
                  <Link
                    as={RouterLink}
                    color="teal.500"
                    onClick={() => openInNewTab(plan[day].breakfast)}
                  >
                    {plan[day].breakfast.recipe}
                  </Link>
                )}
              </Td>
              <Td>
                {plan[day].lunch.url ? (
                  <Link
                    href={plan[day].lunch.url ?? ''}
                    color="teal.500"
                    isExternal
                  >
                    {plan[day].lunch.recipe} <ExternalLinkIcon mx="2px" />
                  </Link>
                ) : (
                  <Link
                    as={RouterLink}
                    onClick={() => openInNewTab(plan[day].lunch)}
                    color="teal.500"
                  >
                    {plan[day].lunch.recipe}
                  </Link>
                )}
              </Td>
              <Td>
                {plan[day].dinner.url ? (
                  <Link
                    href={plan[day].dinner.url ?? ''}
                    color="teal.500"
                    isExternal
                  >
                    {plan[day].dinner.recipe} <ExternalLinkIcon mx="2px" />
                  </Link>
                ) : (
                  <Link
                    as={RouterLink}
                    color="teal.500"
                    onClick={() => openInNewTab(plan[day].dinner)}
                  >
                    {plan[day].dinner.recipe}
                  </Link>
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Box>
        <Button
          colorScheme="teal"
          variant="outline"
          size="md"
          onClick={saveMealPlanModal.onOpen}
        >
          Save Meal Plan
        </Button>
        <SaveMealPlanModal
          plan={plan}
          isOpen={saveMealPlanModal.isOpen}
          onClose={saveMealPlanModal.onClose}
        />
      </Box>
    </Stack>
  )
}
