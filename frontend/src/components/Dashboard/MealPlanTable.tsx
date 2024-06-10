import { Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react'
import { MealPlan } from '../../client'

interface MealPlanTableProps {
  plan: Record<string, MealPlan>
}

export function MealPlanTable({ plan }: MealPlanTableProps) {
  return (
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
            <Td>{plan[day].breakfast}</Td>
            <Td>{plan[day].lunch}</Td>
            <Td>{plan[day].dinner}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  )
}
