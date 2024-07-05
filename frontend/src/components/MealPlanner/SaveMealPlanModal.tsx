import {
  Button,
  FormControl,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react'
import { DatePicker } from '../Common/DatePicker'
import { useState } from 'react'
import { useMutation } from 'react-query'
import {
  type ApiError,
  MealPlansService,
  type WeekMealPlan_Input,
  type MealPlan,
} from '../../client'
import useCustomToast from '../../hooks/useCustomToast'
import { format } from 'date-fns'

export type SaveMealPlanModalProps = {
  plan: Record<string, MealPlan>
  isOpen: boolean
  onClose: () => void
}

export function SaveMealPlanModal({
  plan,
  isOpen,
  onClose,
}: SaveMealPlanModalProps) {
  const showToast = useCustomToast()

  const [startDate, setStartDate] = useState<Date>(new Date())

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
      },
    },
  )

  const handleSaveMealPlan = () => {
    const formattedDate = format(startDate, 'yyyy-MM-dd')
    mutation.mutate({
      plan: plan as WeekMealPlan_Input,
      startDate: formattedDate,
    })
  }

  const handleClose = () => {
    setStartDate(new Date())
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
      <ModalContent as="form" onSubmit={handleSaveMealPlan}>
        <ModalHeader>Meal Plan Start Date</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl isRequired>
            <DatePicker date={startDate} onDateChange={setStartDate} />
            {/* {errors.content && (
              <FormErrorMessage>{errors.content.message}</FormErrorMessage>
            )} */}
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
