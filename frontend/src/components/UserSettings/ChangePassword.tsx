import React from 'react'
import {
  Box,
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  useColorModeValue,
} from '@chakra-ui/react'
import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'

import type { ApiError, UpdatePassword } from '../../client'
import { UsersService } from '../../client'
import useCustomToast from '../../hooks/useCustomToast'

type UpdatePasswordForm = {
  confirm_password: string
} & UpdatePassword

const ChangePassword: React.FC = () => {
  const color = useColorModeValue('inherit', 'ui.white')
  const showToast = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordForm>({
    mode: 'onBlur',
    criteriaMode: 'all',
  })

  const UpdatePassword = async (data: UpdatePassword) => {
    await UsersService.updatePasswordMe({ requestBody: data })
  }

  const mutation = useMutation(UpdatePassword, {
    onSuccess: () => {
      showToast('Success!', 'Password updated.', 'success')
      reset()
    },
    onError: (err: ApiError) => {
      const errDetail = err.body.detail
      showToast('Something went wrong.', `${errDetail}`, 'error')
    },
  })

  const onSubmit: SubmitHandler<UpdatePasswordForm> = async (data) => {
    mutation.mutate(data)
  }

  return (
    <>
      <Container maxW="full" as="form" onSubmit={handleSubmit(onSubmit)}>
        <Heading size="sm" py={4}>
          Change Password
        </Heading>
        <Box w={{ sm: 'full', md: '50%' }}>
          <FormControl isRequired isInvalid={!!errors.currentPassword}>
            <FormLabel color={color} htmlFor="current_password">
              Current password
            </FormLabel>
            <Input
              id="current_password"
              {...register('currentPassword')}
              placeholder="Password"
              type="password"
            />
            {errors.currentPassword && (
              <FormErrorMessage>
                {errors.currentPassword.message}
              </FormErrorMessage>
            )}
          </FormControl>
          <FormControl mt={4} isRequired isInvalid={!!errors.newPassword}>
            <FormLabel htmlFor="password">Set Password</FormLabel>
            <Input
              id="password"
              {...register('newPassword', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
              })}
              placeholder="Password"
              type="password"
            />
            {errors.newPassword && (
              <FormErrorMessage>{errors.newPassword.message}</FormErrorMessage>
            )}
          </FormControl>
          <FormControl mt={4} isRequired isInvalid={!!errors.confirm_password}>
            <FormLabel htmlFor="confirm_password">Confirm Password</FormLabel>
            <Input
              id="confirm_password"
              {...register('confirm_password', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === getValues().newPassword ||
                  'The passwords do not match',
              })}
              placeholder="Password"
              type="password"
            />
            {errors.confirm_password && (
              <FormErrorMessage>
                {errors.confirm_password.message}
              </FormErrorMessage>
            )}
          </FormControl>
          <Button
            variant="primary"
            mt={4}
            type="submit"
            isLoading={isSubmitting}
          >
            Save
          </Button>
        </Box>
      </Container>
    </>
  )
}
export default ChangePassword
