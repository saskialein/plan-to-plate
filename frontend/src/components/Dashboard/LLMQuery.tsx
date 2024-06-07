import { Box, Button, Input, Text } from '@chakra-ui/react'
import { useMutation } from 'react-query'
import { ApiError, LlmService } from '../../client'
import { useState } from 'react'
import useCustomToast from '../../hooks/useCustomToast'

export const LLMQuery = () => {
  const showToast = useCustomToast()

  const [query, setQuery] = useState<string>('')
  const [response, setResponse] = useState('')

  const mutation = useMutation((query: string) =>
    LlmService.llmQuery({ requestBody: { query } }),
  )

  const handleQuerySubmit = () => {
    mutation.mutate(query, {
      onSuccess: (data) => {
        setResponse(data.response)
        setQuery('')
      },
      onError: (error: unknown) => {
        const errDetail = (error as ApiError).body.detail
        showToast('Something went wrong.', `${errDetail}`, 'error')
      },
    })
  }

  return (
    <Box mt={8}>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter your query"
      />
      <Button mt={4} onClick={handleQuerySubmit}>
        Submit
      </Button>
      <Box mt={4}>
        <Text>Response:</Text>
        <Text>{response}</Text>
      </Box>
    </Box>
  )
}
