import { type SyntheticEvent, useState, useEffect } from 'react'
import {
  Box,
  VStack,
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
  Image,
} from '@chakra-ui/react'
import { useMutation } from 'react-query'
import { type ApiError, LlmService, type ChatRequest } from '../../client'
import useCustomToast from '../../hooks/useCustomToast'
import chatIcon from '../../assets/images/chatCarrot.png'

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

  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          content:
            "Hi! I'm Carrotina, your friendly cooking assistant. I can help you with recipes, meal planning, cooking tips, and more. How can I assist you today?",
          role: 'bot',
        },
      ])
    }
  }, [isOpen])

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
        showToast(
          'Something went wrong.',
          `${errDetail.replace(/'/g, '&apos;').replace(/"/g, '&quot;')}`,
          'error',
        )
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
      <Box
        position="fixed"
        bottom="4"
        right="4"
        zIndex="1000"
        onClick={onOpen}
        cursor="pointer"
      >
        <Image src={chatIcon} alt="Chat" boxSize="100px" />
      </Box>
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Carrotina&apos;s Kitchen Chat</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box maxHeight="60vh" overflowY="auto">
              <VStack spacing="4" flex="1" overflowY="auto" borderRadius="md">
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
