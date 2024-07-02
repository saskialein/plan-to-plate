import {
  Button,
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Link,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Stack,
  VStack,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import TagInput from '../Common/TagInput'
import { PiFarmLight } from 'react-icons/pi'
import { GiHotMeal } from 'react-icons/gi'
import type { SyntheticEvent } from 'react'
import { useCallback } from 'react'

const diets = [
  'Paleo',
  'Keto',
  'Mediterranean',
  'Vegan',
  'Vegetarian',
  'Pescatarian',
  'Whole30',
]

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

type MealPlanFormProps = {
  selectedDiets: string[]
  setSelectedDiets: (diets: string[]) => void
  vegetables: string[]
  setVegetables: (vegetables: string[]) => void
  numberOfPeople: number
  setNumberOfPeople: (people: number) => void
  startDay: string
  setStartDay: (day: string) => void
  handleQuerySubmit: (e: SyntheticEvent) => void
  isLoading: boolean
}

export function MealPlanForm({
  selectedDiets,
  setSelectedDiets,
  vegetables,
  setVegetables,
  numberOfPeople,
  setNumberOfPeople,
  startDay,
  setStartDay,
  handleQuerySubmit,
  isLoading,
}: MealPlanFormProps) {
  const handleTagsChange = useCallback(
    (_event: SyntheticEvent, tags: string[]) => {
      setVegetables(tags)
    },
    [],
  )

  return (
    <VStack spacing={8} as="form" onSubmit={handleQuerySubmit}>
      <HStack spacing={4} width="100%">
        <FormControl id="numberOfPeople">
          <FormLabel>Number of Eaters</FormLabel>
          <NumberInput
            value={numberOfPeople}
            onChange={(valueString) => setNumberOfPeople(Number(valueString))}
            min={1}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
        <FormControl id="startDay">
          <FormLabel>Plan Start Day</FormLabel>
          <Select
            value={startDay}
            onChange={(e) => setStartDay(e.target.value)}
            placeholder="Select start day"
          >
            {daysOfWeek.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </Select>
        </FormControl>
      </HStack>
      <FormControl id="diets">
        <FormLabel>Diet(s)</FormLabel>
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
                  colorScheme="teal"
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
        <Stack spacing={2}>
          <Link
            href="https://wearelittlefarms.com/blogs/whats-in-season"
            isExternal
            display="flex"
            alignItems="flex-start"
          >
            <Icon boxSize={6} mx="4px" as={PiFarmLight} />
            Little Farms
          </Link>
          <TagInput tags={vegetables} onTagsChange={handleTagsChange} />
        </Stack>
      </FormControl>
      <Button
        colorScheme="teal"
        type="submit"
        isDisabled={selectedDiets.length == 0 || vegetables.length == 0}
        leftIcon={<GiHotMeal />}
        isLoading={isLoading}
      >
        Generate Meal Plan
      </Button>
    </VStack>
  )
}
