import {
  Button,
  Flex,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  useDisclosure,
} from '@chakra-ui/react'
import { FaPlus, FaSearch } from 'react-icons/fa'

import AddUser from '../Admin/AddUser'
import AddItem from '../Items/AddItem'
import { AddRecipe } from '../Recipes/AddRecipe'
import { availableCategories } from '../Recipes/data/categories'

type HeaderActionsProps = {
  type: string
  onSearch?: (query: string) => void
  onCategoryChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void
}

export const HeaderActions = ({
  type,
  onSearch,
  onCategoryChange,
}: HeaderActionsProps) => {
  const addUserModal = useDisclosure()
  const addItemModal = useDisclosure()
  const addRecipeModal = useDisclosure()

  const clickHandler = () => {
    switch (type) {
      case 'User':
        addUserModal.onOpen()
        break
      case 'Item':
        addItemModal.onOpen()
        break
      case 'Recipe':
        addRecipeModal.onOpen()
        break
      default:
        break
    }
  }

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearch) onSearch(event.target.value)
  }

  return (
    <>
      <Flex py={8} gap={4} justifyContent="space-between">
        <HStack>
          <InputGroup w={{ base: '100%', md: 'auto' }}>
            <InputLeftElement pointerEvents="none">
              <Icon as={FaSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              type="text"
              placeholder="Search by title"
              fontSize={{ base: 'sm', md: 'inherit' }}
              borderRadius="8px"
              onChange={handleSearch}
            />
          </InputGroup>
          <Select
            w={{ base: '100%', md: 'auto' }}
            placeholder="Category"
            onChange={onCategoryChange}
          >
            {availableCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </HStack>
        <Button
          variant="primary"
          gap={1}
          fontSize={{ base: 'sm', md: 'inherit' }}
          onClick={clickHandler}
        >
          <Icon as={FaPlus} /> Add {type}
        </Button>
        <AddUser isOpen={addUserModal.isOpen} onClose={addUserModal.onClose} />
        <AddItem isOpen={addItemModal.isOpen} onClose={addItemModal.onClose} />
        <AddRecipe
          isOpen={addRecipeModal.isOpen}
          onClose={addRecipeModal.onClose}
        />
      </Flex>
    </>
  )
}
