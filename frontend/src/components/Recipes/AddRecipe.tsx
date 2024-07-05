import {
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'

import type { ApiError } from '../../client'
import { RecipesService } from '../../client'
import useCustomToast from '../../hooks/useCustomToast'
import { AiOutlinePaperClip } from 'react-icons/ai'
import { IoMdClose } from 'react-icons/io'
import { availableCategories } from './data/categories'

type AddRecipeProps = {
  isOpen: boolean
  onClose: () => void
}

type FormValues = {
  title: string
  url?: string
  file?: FileList | null
  storeInVectorDb: boolean
  description?: string
  comment?: string
  categories?: string[]
}

export function AddRecipe({ isOpen, onClose }: AddRecipeProps) {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<FormValues>({
    mode: 'onBlur',
    criteriaMode: 'all',
    defaultValues: {
      title: '',
      file: null,
      url: '',
      storeInVectorDb: false,
      categories: [],
    },
  })

  const file = watch('file')
  const url = watch('url')

  const addRecipe = async (formData: FormData) => {
    await RecipesService.createRecipe({ formData })
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

  const onSubmit = (data: FormValues) => {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('url', data.url || '')
    formData.append('description', data.description || '')
    formData.append('storeInVectorDb', data.storeInVectorDb.toString())
    formData.append('comment', data.comment || '')

    const categories = data.categories || []
    categories.forEach((category) => {
      formData.append('categories', category)
    })

    if (data.file && data.file[0]) {
      formData.append('file', data.file[0])
    }

    mutation.mutate(formData)
  }

  const toTitleCase = (str: string) => {
    return str.replace(/\w\S*/g, function (txt) {
      if (txt.toLowerCase() === 'and') {
        return 'and'
      }
      return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
    })
  }

  const handleRemoveFile = () => {
    setValue('file', null, { shouldValidate: true })
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size={{ base: 'lg', lg: 'lg' }}
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
                onChange: (e) => {
                  const formattedTitle = toTitleCase(e.target.value)
                  setValue('title', formattedTitle, { shouldValidate: true })
                },
              })}
              placeholder="Title"
              type="text"
            />
            {errors.title && (
              <FormErrorMessage>{errors.title.message}</FormErrorMessage>
            )}
          </FormControl>
          {!file && (
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
          )}
          {!url && (
            <FormControl mt={4}>
              <FormLabel htmlFor="file">File</FormLabel>
              <Input
                id="file_path"
                {...register('file')}
                type="file"
                accept=".txt, .pdf, .jpg"
                style={{ display: 'none' }}
              />
              {file && file.length > 0 ? (
                <HStack
                  spacing={2}
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <HStack spacing={2}>
                    <IconButton
                      variant="ghost"
                      colorScheme="teal"
                      as="label"
                      htmlFor="file_path"
                      aria-label="Attach file"
                      icon={<AiOutlinePaperClip fontSize="1.6rem" />}
                    />
                    <span>{file[0].name}</span>
                  </HStack>
                  <IconButton
                    variant="ghost"
                    icon={<IoMdClose fontSize="1.4rem" />}
                    colorScheme="teal"
                    onClick={handleRemoveFile}
                    aria-label="Remove file"
                  />
                </HStack>
              ) : (
                <Button
                  as="label"
                  htmlFor="file_path"
                  cursor="pointer"
                  variant="outline"
                  colorScheme="teal"
                >
                  Choose file
                </Button>
              )}
              {errors.file && (
                <FormErrorMessage>{errors.file.message}</FormErrorMessage>
              )}
            </FormControl>
          )}
          {file && file.length > 0 && (
            <FormControl mt={4}>
              <FormLabel htmlFor="description">
                Description (optional)
              </FormLabel>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Description"
              />
              {errors.description && (
                <FormErrorMessage>
                  {errors.description.message}
                </FormErrorMessage>
              )}
            </FormControl>
          )}
          <FormControl mt={4}>
            <FormLabel htmlFor="comment">Comment (optional)</FormLabel>
            <Textarea
              id="comment"
              {...register('comment')}
              placeholder="Comment"
            />
            {errors.comment && (
              <FormErrorMessage>{errors.comment.message}</FormErrorMessage>
            )}
          </FormControl>
          <FormControl mt={4}>
            <Checkbox
              colorScheme="teal"
              id="storeInVectorDb"
              {...register('storeInVectorDb')}
            >
              Consider for Meal Plan
            </Checkbox>
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Categories (optional)</FormLabel>
            <Wrap spacing={2}>
              {availableCategories.map((category) => (
                <WrapItem key={category}>
                  <Checkbox
                    colorScheme="teal"
                    value={category}
                    {...register('categories')}
                  >
                    {category}
                  </Checkbox>
                </WrapItem>
              ))}
            </Wrap>
          </FormControl>
        </ModalBody>

        <ModalFooter gap={3}>
          <Button
            variant="primary"
            type="submit"
            isLoading={isSubmitting || mutation.isLoading}
          >
            Save
          </Button>
          <Button onClick={handleClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
