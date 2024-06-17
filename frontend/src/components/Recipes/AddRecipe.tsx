import {
  Button,
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
import type { SubmitHandler} from 'react-hook-form';
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'

import type {
  ApiError,
  Body_recipes_create_recipe} from '../../client';
import {
  RecipesService,
} from '../../client'
import useCustomToast from '../../hooks/useCustomToast'

type AddRecipeProps = {
  isOpen: boolean
  onClose: () => void
}

type FormValues = {
  title: string
  url?: string
  file?: FileList
}

export function AddRecipe({ isOpen, onClose }: AddRecipeProps) {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    mode: 'onBlur',
    criteriaMode: 'all',
    defaultValues: {
      title: '',
      file: undefined,
      url: '',
    },
  })

  const addRecipe = async (formData: Body_recipes_create_recipe) => {
    await RecipesService.createRecipe({
      formData,
    })
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

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    if (!data.title) {
      showToast('Title is required.', 'Please fill the title.', 'error')
      return
    }
    if (!data.file && !data.url) {
      showToast(
        'File or URL is required.',
        'Please fill the file or url.',
        'error',
      )
      return
    }

    if (data.file && data.file.length > 0) {
      //@ts-expect-error: FileList is not assignable to Blob
      data.file = data.file[0]
    }

    mutation.mutate(data as Body_recipes_create_recipe)
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
              {errors.title && (
                <FormErrorMessage>{errors.title.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl mt={4}>
              <FormLabel htmlFor="url">URL</FormLabel>
              <Input
                id="url"
                {...register('url')}
                placeholder="Url"
                type="text"
              />
              {errors.url && (
                <FormErrorMessage>{errors.url.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl mt={4}>
              <FormLabel htmlFor="file">File</FormLabel>
              <Input
                id="file_path"
                {...register('file')}
                placeholder="File"
                type="file"
                accept=".txt, .pdf, .jpg"
              />
              {errors.file && (
                <FormErrorMessage>{errors.file.message}</FormErrorMessage>
              )}
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
