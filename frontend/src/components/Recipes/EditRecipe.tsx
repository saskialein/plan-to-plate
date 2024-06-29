import {
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react'
import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'

import { useMutation, useQueryClient } from 'react-query'
import type {
  ApiError,
  ItemUpdate,
  RecipeOut,
  RecipeUpdate,
} from '../../client'
import { RecipesService } from '../../client'
import useCustomToast from '../../hooks/useCustomToast'

type EditRecipeProps = {
  recipe: RecipeOut
  isOpen: boolean
  onClose: () => void
}

export function EditRecipe({ recipe, isOpen, onClose }: EditRecipeProps) {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors, isDirty },
  } = useForm<RecipeUpdate>({
    mode: 'onBlur',
    criteriaMode: 'all',
    defaultValues: recipe,
  })

  const updateItem = async (data: RecipeUpdate) => {
    await RecipesService.updateRecipe({
      recipeId: recipe.id,
      requestBody: data,
    })
  }

  const mutation = useMutation(updateItem, {
    onSuccess: () => {
      showToast('Success!', 'Item updated successfully.', 'success')
      onClose()
    },
    onError: (err: ApiError) => {
      const errDetail = err.body.detail
      showToast('Something went wrong.', `${errDetail}`, 'error')
    },
    onSettled: () => {
      queryClient.invalidateQueries('recipes')
    },
  })

  const onSubmit: SubmitHandler<ItemUpdate> = async (data) => {
    mutation.mutate(data)
  }

  const onCancel = () => {
    reset()
    onClose()
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={{ base: 'sm', md: 'md' }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Edit Recipe</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isInvalid={!!errors.title}>
              <FormLabel htmlFor="title">Title</FormLabel>
              <Input
                id="title"
                {...register('title', {
                  required: 'Title is required',
                })}
                type="text"
              />
              {errors.title && (
                <FormErrorMessage>{errors.title.message}</FormErrorMessage>
              )}
            </FormControl>
            {recipe.filePath && (
              <FormControl mt={4}>
                <FormLabel htmlFor="description">Description</FormLabel>
                <Input
                  id="description"
                  {...register('description')}
                  placeholder="Description"
                  type="text"
                />
              </FormControl>
            )}
            <FormControl mt={4}>
              <Checkbox
                colorScheme="teal"
                id="storeInVectorDb"
                {...register('storeInVectorDb')}
              >
                Consider for Meal Plan
              </Checkbox>
            </FormControl>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button
              variant="primary"
              type="submit"
              isLoading={isSubmitting}
              isDisabled={!isDirty}
            >
              Save
            </Button>
            <Button onClick={onCancel}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
