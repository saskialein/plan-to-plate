import { Box, VStack } from '@chakra-ui/react'
import { useMutation } from 'react-query'
import type { ApiError, MealPlan } from '../../client'
import { LlmService } from '../../client'
import type { SyntheticEvent } from 'react'
import { useState } from 'react'

import useCustomToast from '../../hooks/useCustomToast'
import { MealPlanTable } from './MealPlanTable'
import { MealPlanForm } from './MealPlanForm'

export const MealPlanGenerator = () => {
  const [selectedDiets, setSelectedDiets] = useState<string[]>([])
  const [vegetables, setVegetables] = useState<string[]>([])
  const [numberOfPeople, setNumberOfPeople] = useState<number>(1)
  const [startDay, setStartDay] = useState<string>('Monday')
  const showToast = useCustomToast()

  const [response, setResponse] = useState<Record<string, MealPlan>>()

  const mutation = useMutation(
    (data: {
      vegetables: string[]
      diets: string[]
      numberOfPeople: number
      startDay: string
    }) => LlmService.generateMealPlan({ requestBody: data }),
    {
      onSuccess: (data) => {
        setResponse(data.response)
      },
      onError: (error: unknown) => {
        const errDetail = (error as ApiError).body.detail
        showToast('Something went wrong.', `${errDetail}`, 'error')
      },
    },
  )

  const handleQuerySubmit = (e: SyntheticEvent) => {
    e.preventDefault()
    mutation.mutate({
      vegetables,
      diets: selectedDiets,
      numberOfPeople,
      startDay,
    })
  }

  return (
    <VStack spacing={8} alignItems="flex-start">
      <MealPlanForm
        selectedDiets={selectedDiets}
        setSelectedDiets={setSelectedDiets}
        vegetables={vegetables}
        setVegetables={setVegetables}
        numberOfPeople={numberOfPeople}
        setNumberOfPeople={setNumberOfPeople}
        startDay={startDay}
        setStartDay={setStartDay}
        handleQuerySubmit={handleQuerySubmit}
        isLoading={mutation.isLoading}
      />
      {response && (
        <Box mt={4}>
          <MealPlanTable plan={response} />
        </Box>
      )}
    </VStack>
  )
}
