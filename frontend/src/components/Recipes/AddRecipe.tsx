import {
  Button,
  FormControl,
  // FormErrorMessage,
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
import { SubmitHandler, useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'

import { ApiError, ItemCreate, ItemsService } from '../../client'
import useCustomToast from '../../hooks/useCustomToast'

interface AddRecipeProps {
  isOpen: boolean
  onClose: () => void
}

export function AddRecipe({ isOpen, onClose }: AddRecipeProps) {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    //TODO: Add form type
  } = useForm<any>({
    mode: 'onBlur',
    criteriaMode: 'all',
    defaultValues: {
      title: '',
      file: '',
    },
  })

  const addRecipe = async (data: ItemCreate) => {
    await ItemsService.createRecipe({ requestBody: data })
  }

  const mutation = useMutation(addRecipe, {
    onSuccess: () => {
      showToast('Success!', 'Recipe created successfully.', 'success')
      reset()
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

  const onSubmit: SubmitHandler<ItemCreate> = (data) => {
    mutation.mutate(data)
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
          <ModalHeader>Add Recipe</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isRequired isInvalid={!!errors.title}>
              <FormLabel htmlFor="title">Title</FormLabel>
              <Input
                id="title"
                {...register('title', {
                  required: 'Title is required.',
                })}
                placeholder="Title"
                type="text"
              />
              {/* {errors.title && (
                <FormErrorMessage>{errors.title.message}</FormErrorMessage>
              )} */}
            </FormControl>
            <FormControl mt={4}>
              <FormLabel htmlFor="file">File</FormLabel>
              <Input
                id="file"
                {...register('file', {
                  required: 'File is required.',
                })}
                placeholder="File"
                type="file"
              />
              {/* {errors.file && (
                <FormErrorMessage>{errors.file.message}</FormErrorMessage>
              )} */}
            </FormControl>
          </ModalBody>

          <ModalFooter gap={3}>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
