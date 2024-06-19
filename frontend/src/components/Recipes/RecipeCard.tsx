import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  Divider,
  Heading,
  Image,
  Stack,
  Text,
} from '@chakra-ui/react'
import { type ApiError, RecipesService, type RecipeOut } from '../../client'
import { useEffect, useState } from 'react'
import type { OpenGraphData } from '../../api/apiUtils'
import { fetchOpenGraphData, fetchSignedUrl } from '../../api/apiUtils'
import { useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import useCustomToast from '../../hooks/useCustomToast'

export function RecipeCard({ recipe }: { recipe: RecipeOut }) {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const [openGraphData, setOpenGraphData] =
    useState<Partial<OpenGraphData> | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm()

  function getFileName(url?: string | null) {
    if (!url) return null
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    return pathname.substring(pathname.lastIndexOf('/') + 1)
  }

  const fileName = getFileName(recipe.file_path)

  useEffect(() => {
    const fetchData = async () => {
      if (recipe.url) {
        const data = await fetchOpenGraphData(recipe.url)
        setOpenGraphData(data)
      } else if (fileName) {
        const url = await fetchSignedUrl(fileName)
        setFileUrl(url)
      }
    }

    fetchData()
  }, [recipe])

  const deleteRecipe = async (id: number) => {
    await RecipesService.deleteRecipe({ recipeId: id })
  }

  const mutation = useMutation(deleteRecipe, {
    onSuccess: () => {
      showToast(
        'Success',
        'The recipe has been successfully deleted.',
        'success',
      )
      queryClient.invalidateQueries('recipes')
    },
    onError: (err: ApiError) => {
      const errDetail = err.body.detail
      showToast('Something went wrong.', `${errDetail}`, 'error')
    },
    onSettled: () => {
      queryClient.invalidateQueries('currentUser')
    },
  })

  const onDelete = async () => {
    mutation.mutate(recipe.id)
  }

  return (
    <Card maxW="sm">
      <CardBody>
        {fileUrl ? (
          <Image src={fileUrl} alt={recipe.title} />
        ) : openGraphData?.['og:image'] ? (
          <Image src={openGraphData['og:image']} alt={openGraphData.title} />
        ) : null}
        <Stack mt="6" spacing="3">
          <Heading size="md">{recipe.title}</Heading>
          {openGraphData?.description && (
            <Text mt={1}>{openGraphData.description}</Text>
          )}
        </Stack>
      </CardBody>
      <Divider />
      <CardFooter>
        <ButtonGroup spacing="2">
          <Button
            variant="solid"
            colorScheme="blue"
            onClick={handleSubmit(onDelete)}
            isLoading={isSubmitting}
          >
            Delete
          </Button>
          <Button variant="ghost" colorScheme="blue">
            Edit
          </Button>
        </ButtonGroup>
      </CardFooter>
    </Card>
  )
}
