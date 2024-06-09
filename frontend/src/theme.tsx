import { createMultiStyleConfigHelpers, extendTheme } from '@chakra-ui/react'
import { tagAnatomy } from '@chakra-ui/anatomy'

const disabledStyles = {
  _disabled: {
    backgroundColor: 'ui.main',
  },
}

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(tagAnatomy.keys)

const baseStyle = definePartsStyle({
  container: {
    color: 'white',
    borderWidth: '1px',
    borderColor: 'ui.main',
    borderRadius: 'full',
    fontSize: 'lg',
    p: 2,
  },
})

export const tagTheme = defineMultiStyleConfig({
  variants: { custom: baseStyle },
})

const theme = extendTheme({
  colors: {
    ui: {
      main: '#009688',
      secondary: '#EDF2F7',
      success: '#48BB78',
      danger: '#E53E3E',
      white: '#FFFFFF',
      dark: '#1A202C',
      darkSlate: '#252D3D',
    },
  },
  components: {
    Button: {
      variants: {
        primary: {
          backgroundColor: 'ui.main',
          color: 'ui.white',
          _hover: {
            backgroundColor: '#00766C',
          },
          _disabled: {
            ...disabledStyles,
            _hover: {
              ...disabledStyles,
            },
          },
        },
        danger: {
          backgroundColor: 'ui.danger',
          color: 'ui.white',
          _hover: {
            backgroundColor: '#E32727',
          },
        },
      },
    },
    Tabs: {
      variants: {
        enclosed: {
          tab: {
            _selected: {
              color: 'ui.main',
            },
          },
        },
      },
    },
    Tag: tagTheme,
  },
})

export default theme
