import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import type { ApiError, NewPassword } from '../client'
import { LoginService } from '../client'
import useCustomToast from '../hooks/useCustomToast'
import { useNavigate } from '@tanstack/react-router'
import { useMutation } from 'react-query'
import {
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Text,
} from '@chakra-ui/react'

type NewPasswordForm = {
  confirm_password: string
} & NewPassword

export function ResetPassword() {
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm<NewPasswordForm>({
    mode: 'onBlur',
    criteriaMode: 'all',
    defaultValues: {
      newPassword: '',
    },
  })
  const showToast = useCustomToast()
  const navigate = useNavigate()

  const resetPassword = async (data: NewPassword) => {
    const token = new URLSearchParams(window.location.search).get('token')
    await LoginService.resetPassword({
      requestBody: { newPassword: data.newPassword, token: token! },
    })
  }

  const mutation = useMutation(resetPassword, {
    onSuccess: () => {
      showToast('Success!', 'Password updated.', 'success')
      reset()
      navigate({ to: '/login' })
    },
    onError: (err: ApiError) => {
      const errDetail = err.body.detail
      showToast('Something went wrong.', `${errDetail}`, 'error')
    },
  })

  const onSubmit: SubmitHandler<NewPasswordForm> = async (data) => {
    mutation.mutate(data)
  }

  return (
    <Container
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      h="100vh"
      maxW="sm"
      alignItems="stretch"
      justifyContent="center"
      gap={4}
      centerContent
    >
      <Heading size="xl" color="ui.main" textAlign="center" mb={2}>
        Reset Password
      </Heading>
      <Text textAlign="center">
        Please enter your new password and confirm it to reset your password.
      </Text>
      <FormControl mt={4} isInvalid={!!errors.newPassword}>
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
      <FormControl mt={4} isInvalid={!!errors.confirm_password}>
        <FormLabel htmlFor="confirm_password">Confirm Password</FormLabel>
        <Input
          id="confirm_password"
          {...register('confirm_password', {
            required: 'Please confirm your password',
            validate: (value) =>
              value === getValues().newPassword || 'The passwords do not match',
          })}
          placeholder="Password"
          type="password"
        />
        {errors.confirm_password && (
          <FormErrorMessage>{errors.confirm_password.message}</FormErrorMessage>
        )}
      </FormControl>
      <Button
        bg="ui.main"
        color="white"
        _hover={{ opacity: 0.8 }}
        type="submit"
      >
        Reset Password
      </Button>
    </Container>
  )
}
