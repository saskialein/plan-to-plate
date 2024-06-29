import { useMutation, useQueryClient } from 'react-query'
import useCustomToast from '../../hooks/useCustomToast'
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import {
  type Body_recipes_add_comment as CommentCreate,
  RecipesService,
  type ApiError,
} from '../../client'

export type AddCommentProps = {
  recipeName: string
  recipeId: number
  isOpen: boolean
  onClose: () => void
}

type FormValues = {
  content: string
}

export function AddComment({
  recipeName,
  recipeId,
  isOpen,
  onClose,
}: AddCommentProps) {
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
      content: '',
    },
  })

  const addComment = async (formData: FormValues) => {
    const body: CommentCreate = {
      content: formData.content,
    }
    await RecipesService.addComment({ recipeId, formData: body })
  }

  const mutation = useMutation(addComment, {
    onSuccess: () => {
      showToast('Success!', 'Comment created successfully.', 'success')
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
    mutation.mutate(data)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size={{ base: 'sm', md: 'md' }}
      isCentered
    >
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>Add a Comment for {recipeName}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl isRequired isInvalid={!!errors.content}>
            <FormLabel htmlFor="content">Comment</FormLabel>
            <Textarea
              id="content"
              {...register('content', {
                required: 'Comment is required.',
              })}
              placeholder="Share your thoughts, experiences, or suggestions about this recipe."
            />
            {errors.content && (
              <FormErrorMessage>{errors.content.message}</FormErrorMessage>
            )}
          </FormControl>
        </ModalBody>

        <ModalFooter gap={3}>
          <Button variant="primary" type="submit" isLoading={isSubmitting}>
            Save
          </Button>
          <Button onClick={handleClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
