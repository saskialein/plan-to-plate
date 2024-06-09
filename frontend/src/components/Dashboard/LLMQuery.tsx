import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormLabel,
  Text,
  // Text,
  VStack,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { useMutation } from 'react-query'
import { ApiError, LlmService } from '../../client'
import { SyntheticEvent, useCallback, useState } from 'react'
import TagInput from '../Common/TagInput'
import { GiHotMeal } from 'react-icons/gi'

import useCustomToast from '../../hooks/useCustomToast'

const diets = [
  'Paleo',
  'Keto',
  'Mediterranean',
  'Vegan',
  'Vegetarian',
  'Pescatarian',
  'Whole30',
]

export const LLMQuery = () => {
  const [selectedDiets, setSelectedDiets] = useState<string[]>([])
  const [vegetables, setVegetables] = useState<string[]>([])
  const showToast = useCustomToast()

  // const [query, setQuery] = useState<string>('')
  const [response, setResponse] = useState('')

  const mutation = useMutation(
    (data: { vegetables: string[]; diets: string[] }) =>
      LlmService.llmQuery({ requestBody: data }),
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
    mutation.mutate({ vegetables, diets: selectedDiets })
  }

  const handleTagsChange = useCallback(
    (_event: SyntheticEvent, tags: string[]) => {
      setVegetables(tags)
    },
    [],
  )

  return (
    <VStack spacing={8} as="form" onSubmit={handleQuerySubmit}>
      <FormControl id="diets">
        <FormLabel>Diet(s) - Select as many as you want</FormLabel>
        <CheckboxGroup
          value={selectedDiets}
          onChange={(value) => setSelectedDiets(value as string[])}
        >
          <Wrap spacing={2}>
            {diets.map((diet) => (
              <WrapItem key={diet}>
                <Checkbox
                  isChecked={selectedDiets.includes(diet)}
                  size="lg"
                  value={diet}
                >
                  {diet}
                </Checkbox>
              </WrapItem>
            ))}
          </Wrap>
        </CheckboxGroup>
      </FormControl>
      <FormControl id="vegetables">
        <FormLabel>Vegetables</FormLabel>
        <TagInput tags={vegetables} onTagsChange={handleTagsChange} />
      </FormControl>
      <Button
        colorScheme="teal"
        type="submit"
        isDisabled={selectedDiets.length == 0 || vegetables.length == 0}
        leftIcon={<GiHotMeal />}
      >
        Generate Meal Plan
      </Button>
      <Box mt={4}>
        <Text>Response:</Text>
        <Text>{response}</Text>
      </Box>
    </VStack>
  )
}

{
  /* <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter your query"
      />
      <Button mt={4} onClick={handleQuerySubmit}>
        Submit
      </Button>
      <Box mt={4}>
        <Text>Response:</Text>
        <Text>{response}</Text> */
}
{
  /* </Box> */
}
