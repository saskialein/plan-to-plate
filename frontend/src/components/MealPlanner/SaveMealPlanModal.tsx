import {
  Button,
  FormControl,
  FormErrorMessage,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react'
import { DatePicker } from '../Common/DatePicker'
import { useForm, Controller } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'
import {
  MealPlansService,
  type ApiError,
  type WeekMealPlan_Input,
  type MealPlan,
} from '../../client'
import useCustomToast from '../../hooks/useCustomToast'
import { format } from 'date-fns'
import { useNavigate } from '@tanstack/react-router'

export type SaveMealPlanModalProps = {
  plan: Record<string, MealPlan>
  isOpen: boolean
  onClose: () => void
}

type FormValues = {
  startDate: Date
}

export function SaveMealPlanModal({
  plan,
  isOpen,
  onClose,
}: SaveMealPlanModalProps) {
  const showToast = useCustomToast()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      startDate: new Date(),
    },
  })

  const mutation = useMutation(
    (data: { plan: WeekMealPlan_Input; startDate: string }) =>
      MealPlansService.createMealPlan({ requestBody: data }),
    {
      onError: (error: unknown) => {
        const errDetail = (error as ApiError).body.detail
        showToast('Something went wrong.', `${errDetail}`, 'error')
      },
      onSuccess: () => {
        showToast('Success!', 'Meal plan saved successfully.', 'success')
        onClose()
        navigate({ to: '/meal-plans' })
      },
      onSettled: () => {
        queryClient.invalidateQueries('meal-plans')
      },
    },
  )

  const onSubmit = (data: FormValues) => {
    const formattedDate = format(data.startDate, 'yyyy-MM-dd')
    mutation.mutate({
      plan: plan as WeekMealPlan_Input,
      startDate: formattedDate,
    })
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size={{ base: 'xs', md: 'sm' }}
      isCentered
    >
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>Meal Plan Start Date</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl isRequired isInvalid={!!errors.startDate}>
            <Controller
              name="startDate"
              control={control}
              rules={{ required: 'Start date is required' }}
              render={({ field }) => (
                <DatePicker date={field.value} onDateChange={field.onChange} />
              )}
            />
            {errors.startDate && (
              <FormErrorMessage>{errors.startDate.message}</FormErrorMessage>
            )}
          </FormControl>
        </ModalBody>

        <ModalFooter gap={3}>
          <Button
            variant="primary"
            type="submit"
            isLoading={mutation.isLoading}
          >
            Save
          </Button>
          <Button onClick={handleClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
