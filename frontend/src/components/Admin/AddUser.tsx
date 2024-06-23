import React from 'react'
import {
  Button,
  Checkbox,
  Flex,
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

import type { UserCreate } from '../../client'
import { UsersService } from '../../client'
import type { ApiError } from '../../client/core/ApiError'
import useCustomToast from '../../hooks/useCustomToast'

type AddUserProps = {
  isOpen: boolean
  onClose: () => void
}

type UserCreateForm = {
  confirm_password: string
} & UserCreate

const AddUser: React.FC<AddUserProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<UserCreateForm>({
    mode: 'onBlur',
    criteriaMode: 'all',
    defaultValues: {
      email: '',
      fullName: '',
      password: '',
      confirm_password: '',
      isSuperuser: false,
      isActive: false,
    },
  })

  const addUser = async (data: UserCreate) => {
    await UsersService.createUser({ requestBody: data })
  }

  const mutation = useMutation(addUser, {
    onSuccess: () => {
      showToast('Success!', 'User created successfully.', 'success')
      reset()
      onClose()
    },
    onError: (err: ApiError) => {
      const errDetail = err.body.detail
      showToast('Something went wrong.', `${errDetail}`, 'error')
    },
    onSettled: () => {
      queryClient.invalidateQueries('users')
    },
  })

  const onSubmit: SubmitHandler<UserCreateForm> = (data) => {
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
          <ModalHeader>Add User</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isRequired isInvalid={!!errors.email}>
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input
                id="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                    message: 'Invalid email address',
                  },
                })}
                placeholder="Email"
                type="email"
              />
              {errors.email && (
                <FormErrorMessage>{errors.email.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl mt={4} isInvalid={!!errors.fullName}>
              <FormLabel htmlFor="name">Full name</FormLabel>
              <Input
                id="name"
                {...register('fullName')}
                placeholder="Full name"
                type="text"
              />
              {errors.fullName && (
                <FormErrorMessage>{errors.fullName.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl mt={4} isRequired isInvalid={!!errors.password}>
              <FormLabel htmlFor="password">Set Password</FormLabel>
              <Input
                id="password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                })}
                placeholder="Password"
                type="password"
              />
              {errors.password && (
                <FormErrorMessage>{errors.password.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl
              mt={4}
              isRequired
              isInvalid={!!errors.confirm_password}
            >
              <FormLabel htmlFor="confirm_password">Confirm Password</FormLabel>
              <Input
                id="confirm_password"
                {...register('confirm_password', {
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === getValues().password ||
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
            <Flex mt={4}>
              <FormControl>
                <Checkbox {...register('isSuperuser')} colorScheme="teal">
                  Is superuser?
                </Checkbox>
              </FormControl>
              <FormControl>
                <Checkbox {...register('isActive')} colorScheme="teal">
                  Is active?
                </Checkbox>
              </FormControl>
            </Flex>
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

export default AddUser
