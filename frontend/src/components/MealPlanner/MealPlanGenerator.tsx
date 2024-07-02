import { Box, Flex, Spinner, VStack } from '@chakra-ui/react'
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
  const [numberOfPeople, setNumberOfPeople] = useState<number>(2)
  const [startDay, setStartDay] = useState<string>('Saturday')
  const showToast = useCustomToast()

  const [response, setResponse] = useState<
    Record<string, MealPlan> | undefined
  >(undefined)

  const mutation = useMutation(
    (data: {
      vegetables: string[]
      diets: string[]
      numberOfPeople: number
      startDay: string
    }) => LlmService.generateMealPlan({ requestBody: data }),
    {
      onSuccess: ({ response }) => {
        setResponse(response as Record<string, MealPlan>)
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
      {mutation.isLoading && (
        <Flex justify="center" align="center" height="100vh" width="full">
          <Spinner size="xl" color="ui.main" />
        </Flex>
      )}{' '}
      {response && (
        <Box mt={4}>
          <MealPlanTable plan={response} />
        </Box>
      )}
    </VStack>
  )
}
