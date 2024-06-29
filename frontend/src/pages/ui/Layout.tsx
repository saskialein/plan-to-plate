import { Flex, Spinner } from '@chakra-ui/react'
import useAuth from '../../hooks/useAuth'
import Sidebar from '../../components/Common/Sidebar'
import { Outlet } from '@tanstack/react-router'
import UserMenu from '../../components/Common/UserMenu'
import { FloatingChatButton } from '../../components/Layout/FloatingChatButton'

export function Layout() {
  const { isLoading } = useAuth()

  return (
    <Flex maxW="large" h="auto" position="relative">
      <Sidebar />
      {isLoading ? (
        <Flex justify="center" align="center" height="100vh" width="full">
          <Spinner size="xl" color="ui.main" />
        </Flex>
      ) : (
        <Outlet />
      )}
      <UserMenu />
      <FloatingChatButton />
    </Flex>
  )
}
