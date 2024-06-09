import {
  Button,
  Center,
  Container,
  FormControl,
  FormErrorMessage,
  Icon,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  useBoolean,
} from '@chakra-ui/react'
import useAuth from '../hooks/useAuth'
import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import {
  ApiError,
  Body_login_login_access_token as AccessToken,
} from '../client'
import Logo from '../assets/images/plantoplate-logo.png'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import { Link as RouterLink } from '@tanstack/react-router'

export function Login() {
  const [show, setShow] = useBoolean()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AccessToken>({
    mode: 'onBlur',
    criteriaMode: 'all',
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const onSubmit: SubmitHandler<AccessToken> = async (data) => {
    try {
      await login(data)
    } catch (err) {
      const errDetail = (err as ApiError).body.detail
      setError(errDetail)
    }
  }

  return (
    <>
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
        <Image
          src={Logo}
          alt="FastAPI logo"
          height="auto"
          maxW="2xs"
          alignSelf="center"
          mb={4}
        />
        <FormControl id="username" isInvalid={!!errors.username || !!error}>
          <Input
            id="username"
            {...register('username', {
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                message: 'Invalid email address',
              },
            })}
            placeholder="Email"
            type="email"
          />
          {errors.username && (
            <FormErrorMessage>{errors.username.message}</FormErrorMessage>
          )}
        </FormControl>
        <FormControl id="password" isInvalid={!!error}>
          <InputGroup>
            <Input
              {...register('password')}
              type={show ? 'text' : 'password'}
              placeholder="Password"
            />
            <InputRightElement
              color="gray.400"
              _hover={{
                cursor: 'pointer',
              }}
            >
              <Icon
                onClick={setShow.toggle}
                aria-label={show ? 'Hide password' : 'Show password'}
              >
                {show ? <ViewOffIcon /> : <ViewIcon />}
              </Icon>
            </InputRightElement>
          </InputGroup>
          {error && <FormErrorMessage>{error}</FormErrorMessage>}
        </FormControl>
        <Center>
          <Link as={RouterLink} to="/recover-password" color="blue.500">
            Forgot password?
          </Link>
        </Center>
        <Button
          bg="ui.main"
          color="white"
          _hover={{ opacity: 0.8 }}
          type="submit"
          isLoading={isSubmitting}
        >
          Log In
        </Button>
      </Container>
    </>
  )
}
