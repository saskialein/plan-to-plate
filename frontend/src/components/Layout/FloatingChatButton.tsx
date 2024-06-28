import { type SyntheticEvent, useState } from 'react'
import {
  Box,
  IconButton,
  VStack,
  Input,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Textarea,
  HStack,
  Stack,
} from '@chakra-ui/react'
import { ChatIcon } from '@chakra-ui/icons'
import { useMutation } from 'react-query'
import { type ApiError, LlmService, type ChatRequest } from '../../client'
import useCustomToast from '../../hooks/useCustomToast'

type ChatMessage = {
  role: 'user' | 'bot'
  content: string
}

export function FloatingChatButton() {
  const showToast = useCustomToast()

  const { isOpen, onOpen, onClose } = useDisclosure()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sessionId] = useState(() => `session_${Date.now()}`)

  //   const handleToggle = () => setIsOpen(!isOpen)

  const mutation = useMutation(
    (data: ChatRequest) => LlmService.chatWithAi({ requestBody: data }),
    {
      onSuccess: (data) => {
        setMessages((prev) => [
          ...prev,
          { content: data.response, role: 'bot' },
        ])
      },
      onError: (error: unknown) => {
        const errDetail = (error as ApiError).body.detail
        showToast('Something went wrong.', `${errDetail}`, 'error')
      },
    },
  )

  const handleQuerySubmit = (e: SyntheticEvent) => {
    e.preventDefault()
    const userMessage: ChatMessage = { content: input, role: 'user' }
    setMessages((prev) => [...prev, userMessage])
    mutation.mutate({ query: input, session_id: sessionId })
    setInput('')
  }

  return (
    <>
      <IconButton
        icon={<ChatIcon />}
        colorScheme="teal"
        position="fixed"
        bottom="4"
        right="4"
        borderRadius="full"
        onClick={onOpen}
        aria-label="Chat with me"
        zIndex={1000}
      />
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Chat with AI</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box maxHeight="60vh" overflowY="auto">
              <VStack
                spacing="4"
                flex="1"
                overflowY="auto"
                // p="2"
                borderRadius="md"
              >
                {messages.map((msg, index) => (
                  <Box
                    key={index}
                    alignSelf={msg.role === 'user' ? 'flex-end' : 'flex-start'}
                    borderRadius="md"
                    p="2"
                  >
                    {msg.content}
                  </Box>
                ))}
              </VStack>
            </Box>
          </ModalBody>
          <ModalFooter as="form" onSubmit={handleQuerySubmit}>
            <HStack spacing={4} width="100%">
              <Textarea
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                width="100%"
              />
              <Button type="submit" colorScheme="teal">
                Send
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* )} */}
    </>
  )
}
