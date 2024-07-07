import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from '@chakra-ui/react'
import { MealPlansService, type ApiError, type MealPlanOut } from '../../client'
import { useMutation, useQueryClient } from 'react-query'
import useCustomToast from '../../hooks/useCustomToast'
import { useForm } from 'react-hook-form'
import { formatDateRange } from './utils/formatDateRange'
import { useRef } from 'react'

export type DeleteMealPlanModalProps = {
  mealPlan: MealPlanOut
  isOpen: boolean
  onClose: () => void
}

export function DeleteMealPlanModal({
  mealPlan,
  isOpen,
  onClose,
}: DeleteMealPlanModalProps) {
  const showToast = useCustomToast()
  const cancelRef = useRef<HTMLButtonElement | null>(null)
  const queryClient = useQueryClient()
  const { handleSubmit } = useForm()

  const deleteMealPlan = async (id: number) => {
    await MealPlansService.deleteMealPlan({ id })
  }

  const mutation = useMutation(deleteMealPlan, {
    onError: (error: unknown) => {
      const errDetail = (error as ApiError).body.detail
      showToast('Something went wrong.', `${errDetail}`, 'error')
    },
    onSuccess: () => {
      showToast('Success!', 'Meal plan deleted successfully.', 'success')
      onClose()
    },
    onSettled: () => {
      queryClient.invalidateQueries('meal-plans')
    },
  })

  const onSubmit = async () => {
    if (!mealPlan.id) return

    mutation.mutate(mealPlan.id)
  }

  return (
    <AlertDialog
      isOpen={isOpen}
      onClose={onClose}
      leastDestructiveRef={cancelRef}
      size={{ base: 'sm', md: 'md' }}
      isCentered
    >
      <AlertDialogOverlay />
      <AlertDialogContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <AlertDialogHeader>Delete Meal Plan</AlertDialogHeader>
        <AlertDialogBody>
          Are you sure you want to delete the meal plan for the week{' '}
          <strong>
            {mealPlan?.startDate ? formatDateRange(mealPlan.startDate) : ''}
          </strong>
          ?
        </AlertDialogBody>
        <AlertDialogFooter gap={3}>
          <Button variant="danger" type="submit" isLoading={mutation.isLoading}>
            Delete
          </Button>
          <Button
            isDisabled={mutation.isLoading}
            ref={cancelRef}
            onClick={onClose}
          >
            Cancel
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
