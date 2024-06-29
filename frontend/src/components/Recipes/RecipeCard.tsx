import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  Divider,
  Heading,
  Icon,
  Image,
  Link,
  Skeleton,
  SkeletonText,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { type ApiError, RecipesService, type RecipeOut } from '../../client'
import { useMemo } from 'react'
import { useFetchSignedUrl } from '../../api/utils/getSignedUrl'
import { useMutation, useQueryClient } from 'react-query'
import useCustomToast from '../../hooks/useCustomToast'
import { FaExternalLinkAlt } from 'react-icons/fa'
import { useFetchOpenGraphData } from '../../api/utils/getOpenGraphData'
import { EditRecipe } from './EditRecipe'
import { AddComment } from './AddComment'

export function RecipeCard({ recipe }: { recipe: RecipeOut }) {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const editRecipeModal = useDisclosure()
  const addCommentModal = useDisclosure()

  const fileName = useMemo(() => {
    if (!recipe.filePath) return null
    const urlObj = new URL(recipe.filePath)
    const pathname = urlObj.pathname
    return pathname.substring(pathname.lastIndexOf('/') + 1)
  }, [recipe.filePath])

  const { data: openGraphData, isLoading: isLoadingOG } = useFetchOpenGraphData(
    recipe.url || '',
  )
  const { data: signedUrl, isLoading: isLoadingFile } = useFetchSignedUrl(
    fileName || '',
  )

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
        {isLoadingFile || isLoadingOG ? (
          <Skeleton height="300px" width="100%" />
        ) : (
          <Image
            src={signedUrl || openGraphData?.ogImage}
            alt={recipe.title}
            maxHeight="300px"
            width="100%"
          />
        )}
        <Stack mt="6" spacing="3">
          <Heading size="md">{recipe.title}</Heading>
          {isLoadingOG && <SkeletonText noOfLines={3} />}
          <Text mt={1}>
            {openGraphData?.description || recipe?.description}
          </Text>
        </Stack>
        <Stack alignItems="flex-end">
          {recipe.url && (
            <Link href={recipe.url} isExternal>
              <Icon as={FaExternalLinkAlt} boxSize={6} />
            </Link>
          )}
        </Stack>
      </CardBody>
      <Divider />
      <CardFooter justifyContent="space-between">
        <Button
          onClick={addCommentModal.onOpen}
          variant="ghost"
          colorScheme="blue"
          mr={4}
        >
          Add Comment
        </Button>
        <AddComment
          recipeName={recipe.title}
          recipeId={recipe.id}
          isOpen={addCommentModal.isOpen}
          onClose={addCommentModal.onClose}
        />
        <ButtonGroup spacing="2">
          <Button
            variant="solid"
            colorScheme="blue"
            onClick={onDelete}
            isLoading={mutation.isLoading}
          >
            Delete
          </Button>
          <Button
            onClick={editRecipeModal.onOpen}
            variant="outline"
            colorScheme="blue"
          >
            Edit
          </Button>
          <EditRecipe
            recipe={recipe as RecipeOut}
            isOpen={editRecipeModal.isOpen}
            onClose={editRecipeModal.onClose}
          />
        </ButtonGroup>
      </CardFooter>
    </Card>
  )
}
