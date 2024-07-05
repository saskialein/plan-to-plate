import { Checkbox, CheckboxGroup, Stack } from '@chakra-ui/react'

type CategoryFilterProps = {
  categories: string[]
  selectedCategories: string[]
  onChange: (selected: string[]) => void
}

export function CategoryFilter({
  categories,
  selectedCategories,
  onChange,
}: CategoryFilterProps) {
  const handleChange = (selected: string[]) => {
    onChange(selected)
  }

  return (
    <CheckboxGroup value={selectedCategories} onChange={handleChange}>
      <Stack direction="column">
        {categories.map((category) => (
          <Checkbox key={category} value={category}>
            {category}
          </Checkbox>
        ))}
      </Stack>
    </CheckboxGroup>
  )
}
