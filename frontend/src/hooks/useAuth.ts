import { useQuery } from 'react-query'
import { useNavigate } from '@tanstack/react-router'
import { jwtDecode } from 'jwt-decode'

import {
  Body_login_login_access_token as AccessToken,
  LoginService,
  UserOut,
  UsersService,
} from '../client'

const isTokenExpired = (token: string) => {
  if (!token) return true
  const { exp } = jwtDecode(token)
  if (!exp) return true
  const currentTime = Date.now() / 1000
  return exp < currentTime
}

const isLoggedIn = () => {
  const token = localStorage.getItem('access_token')
  token && console.log(isTokenExpired(token))
  return token !== null && !isTokenExpired(token)
}

const useAuth = () => {
  const navigate = useNavigate()
  const { data: user, isLoading } = useQuery<UserOut | null, Error>(
    'currentUser',
    UsersService.readUserMe,
    {
      enabled: isLoggedIn(),
    },
  )

  const login = async (data: AccessToken) => {
    const response = await LoginService.loginAccessToken({
      formData: data,
    })
    localStorage.setItem('access_token', response.access_token)
    navigate({ to: '/' })
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    navigate({ to: '/login' })
  }

  return { login, logout, user, isLoading }
}

export { isLoggedIn }
export default useAuth
