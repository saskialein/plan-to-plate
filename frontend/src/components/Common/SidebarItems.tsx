import React from 'react'
import { Box, Flex, Icon, Text, useColorModeValue } from '@chakra-ui/react'
import { FiBriefcase, FiHome, FiSettings, FiUsers } from 'react-icons/fi'
import { GiCook } from 'react-icons/gi'
import { MdOutlineRamenDining } from 'react-icons/md'
import { Link } from '@tanstack/react-router'
import { useQueryClient } from 'react-query'

import type { UserOut } from '../../client'

const items = [
  { icon: FiHome, title: 'Dashboard', path: '/' },
  { icon: MdOutlineRamenDining, title: 'Meal Planner', path: '/meal-planner' },
  { icon: GiCook, title: 'Cookbook', path: '/recipes' },
  { icon: FiBriefcase, title: 'Items', path: '/items' },
  { icon: FiSettings, title: 'User Settings', path: '/settings' },
]

type SidebarItemsProps = {
  onClose?: () => void
}

const SidebarItems: React.FC<SidebarItemsProps> = ({ onClose }) => {
  const queryClient = useQueryClient()
  const textColor = useColorModeValue('ui.main', 'ui.white')
  const bgActive = useColorModeValue('#E2E8F0', '#4A5568')
  const currentUser = queryClient.getQueryData<UserOut>('currentUser')

  const finalItems = currentUser?.isSuperuser
    ? [...items, { icon: FiUsers, title: 'Admin', path: '/admin' }]
    : items

  const listItems = finalItems.map((item) => (
    <Flex
      as={Link}
      to={item.path}
      w="100%"
      p={2}
      key={item.title}
      activeProps={{
        style: {
          background: bgActive,
          borderRadius: '12px',
        },
      }}
      color={textColor}
      onClick={onClose}
    >
      <Icon as={item.icon} alignSelf="center" />
      <Text ml={2}>{item.title}</Text>
    </Flex>
  ))

  return (
    <>
      <Box>{listItems}</Box>
    </>
  )
}

export default SidebarItems
