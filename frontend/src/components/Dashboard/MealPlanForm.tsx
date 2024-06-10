import {
  Button,
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormLabel,
  Icon,
  Link,
  Stack,
  VStack,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import TagInput from '../Common/TagInput'
import { PiFarmLight } from 'react-icons/pi'
import { GiHotMeal } from 'react-icons/gi'
import { SyntheticEvent, useCallback } from 'react'

const diets = [
  'Paleo',
  'Keto',
  'Mediterranean',
  'Vegan',
  'Vegetarian',
  'Pescatarian',
  'Whole30',
]

interface MealPlanFormProps {
  selectedDiets: string[]
  setSelectedDiets: (diets: string[]) => void
  vegetables: string[]
  setVegetables: (vegetables: string[]) => void
  handleQuerySubmit: (e: SyntheticEvent) => void
  isLoading: boolean
}

export function MealPlanForm({
  selectedDiets,
  setSelectedDiets,
  vegetables,
  setVegetables,
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
