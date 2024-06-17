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
import { RecipeOut } from '../../client'
import { useEffect, useState } from 'react'
import {
  OpenGraphData,
  fetchOpenGraphData,
  fetchSignedUrl,
} from '../../api/apiUtils'

export function RecipeCard({ recipe }: { recipe: RecipeOut }) {
  const [openGraphData, setOpenGraphData] = useState<OpenGraphData | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (recipe.url) {
        const data = await fetchOpenGraphData(recipe.url)
        setOpenGraphData(data)
      } else if (recipe.file_path) {
        const url = await fetchSignedUrl(recipe.file_path)
        setFileUrl(url)
      }
    }

    fetchData()
  }, [recipe])

  return (
    <Card maxW="sm">
      <CardBody>
        {fileUrl ? (
          <Image src={fileUrl} alt={recipe.title} />
        ) : openGraphData?.image ? (
          <Image src={openGraphData.image} alt={openGraphData.title} />
        ) : null}
        <Stack mt="6" spacing="3">
          <Heading size="md">{openGraphData?.title || recipe.title}</Heading>
          {openGraphData?.description && (
            <Text mt={1}>{openGraphData.description}</Text>
          )}
        </Stack>
      </CardBody>
      <Divider />
      <CardFooter>
        <ButtonGroup spacing="2">
          <Button variant="solid" colorScheme="blue">
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
