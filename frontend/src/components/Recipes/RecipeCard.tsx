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
import type { RecipeOut } from '../../client'
import { useEffect, useState } from 'react'
import type { OpenGraphData } from '../../api/apiUtils'
import { fetchOpenGraphData, fetchSignedUrl } from '../../api/apiUtils'

export function RecipeCard({ recipe }: { recipe: RecipeOut }) {
  const [openGraphData, setOpenGraphData] =
    useState<Partial<OpenGraphData> | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)

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

  return (
    <Card maxW="sm">
      <CardBody>
        {fileUrl ? (
          <Image src={fileUrl} alt={recipe.title} />
        ) : openGraphData?.['og:image'] ? (
          <Image src={openGraphData['og:image']} alt={openGraphData.title} />
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
