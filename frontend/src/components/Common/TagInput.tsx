import { forwardRef, useCallback, useState, type MouseEvent } from 'react'
import type {
  ChangeEvent,
  ClipboardEvent,
  ForwardedRef,
  KeyboardEvent,
  SyntheticEvent,
} from 'react'
import {
  Tag,
  TagCloseButton,
  TagLabel,
  Textarea,
  VStack,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import type {
  TagProps,
  TagLabelProps,
  TagCloseButtonProps,
  TextareaProps,
} from '@chakra-ui/react'

type MaybeTagProps<P> = MaybeFunc<[tag: string, index?: number], P>

type Func<A extends unknown[], R> = (...args: A) => R
export type MaybeFunc<A extends unknown[], R> = R | Func<A, R>
export function maybeCall<A extends unknown[], R>(
  maybeFunc: MaybeFunc<A, R>,
  ...args: A
) {
  if (typeof maybeFunc === 'function') {
    return (maybeFunc as Func<A, R>)(...args)
  } else {
    return maybeFunc
  }
}

export type ChakraTagInputProps = TextareaProps & {
  tags?: string[]
  onTagsChange?(event: SyntheticEvent, tags: string[]): void
  onTagAdd?(event: SyntheticEvent, value: string): void
  onTagRemove?(event: SyntheticEvent, index: number): void
  vertical?: boolean
  addKeys?: string[]
  tagProps?: MaybeTagProps<TagProps>
  tagLabelProps?: MaybeTagProps<TagLabelProps>
  tagCloseButtonProps?: MaybeTagProps<TagCloseButtonProps>
}

export default forwardRef(function ChakraTagInput(
  {
    tags = [],
    onTagsChange,
    onTagAdd,
    onTagRemove,
    addKeys = ['Enter'],
    tagProps,
    tagLabelProps,
    tagCloseButtonProps,
    ...props
  }: ChakraTagInputProps,
  ref: ForwardedRef<HTMLTextAreaElement>,
) {
  const [inputValue, setInputValue] = useState('')

  const addTag = useCallback(
    (event: SyntheticEvent, tag: string) => {
      onTagAdd?.(event, tag)
      if (event.isDefaultPrevented()) return

      onTagsChange?.(event, Array.from(new Set(tags.concat([tag]))))
    },
    [tags, onTagsChange, onTagAdd],
  )

  const addMultipleTags = useCallback(
    (event: SyntheticEvent, tagsToAdd: string[]) => {
      const uniqueTags = Array.from(new Set([...tags, ...tagsToAdd]))
      onTagsChange?.(event, uniqueTags)
    },
    [tags, onTagsChange],
  )

  const removeTag = useCallback(
    (event: SyntheticEvent, index: number) => {
      onTagRemove?.(event, index)
      if (event.isDefaultPrevented()) return

      onTagsChange?.(event, [...tags.slice(0, index), ...tags.slice(index + 1)])
    },
    [tags, onTagsChange, onTagRemove],
  )
  const handleRemoveTag = useCallback(
    (index: number) => (event: SyntheticEvent) => {
      removeTag(event, index)
    },
    [removeTag],
  )
  const onKeyDown = props.onKeyDown
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      onKeyDown?.(event)

      if (event.isDefaultPrevented()) return
      if (event.isPropagationStopped()) return

      const { currentTarget, key } = event
      if (addKeys.indexOf(key) > -1 && currentTarget.value) {
        const tagsToAdd = currentTarget.value
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag)
        addMultipleTags(event, tagsToAdd)
        if (!event.isDefaultPrevented()) {
          setInputValue('')
        }
        event.preventDefault()
      }
    },
    [addKeys, tags.length, addTag, removeTag, onKeyDown],
  )

  const handlePaste = useCallback(
    (event: ClipboardEvent<HTMLTextAreaElement>) => {
      const paste = event.clipboardData.getData('text')
      const formattedValue = paste
        .split('\n')
        .map((tag) => tag.trim())
        .filter((tag) => tag)
        .join(', ')
      setInputValue(formattedValue)
      event.preventDefault()
    },
    [],
  )

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setInputValue(event.target.value)
    },
    [],
  )

  return (
    <VStack spacing={4} alignItems="flex-start">
      <Textarea
        {...props}
        value={inputValue}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onChange={handleInputChange}
        ref={ref}
        placeholder="Paste or type and press Enter to add"
      />
      <Wrap spacing={2} width="100%">
        {tags.map((tag, index) => (
          <WrapItem key={index}>
            <TagInputTag
              onRemove={handleRemoveTag(index)}
              tagLabelProps={maybeCall(tagLabelProps, tag, index)}
              tagCloseButtonProps={maybeCall(tagCloseButtonProps, tag, index)}
              colorScheme={props.colorScheme}
              size={props.size}
              {...maybeCall(tagProps, tag, index)}
            >
              {tag}
            </TagInputTag>
          </WrapItem>
        ))}
      </Wrap>
    </VStack>
  )
})

export type TagInputTagProps = TagProps & {
  children: string
  onRemove?(event: SyntheticEvent): void
  tagLabelProps?: TagLabelProps
  tagCloseButtonProps?: TagCloseButtonProps
}

function TagInputTag({
  children,
  onRemove,
  tagLabelProps,
  tagCloseButtonProps,
  ...props
}: TagInputTagProps) {
  const onTagCloseButtonClick = tagCloseButtonProps?.onClick
  const handleClickTagCloseButton = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onTagCloseButtonClick?.(event)
      if (event.isDefaultPrevented()) return
      onRemove?.(event)
    },
    [onRemove, onTagCloseButtonClick],
  )
  return (
    <Tag {...props} variant="custom">
      <TagLabel {...tagLabelProps}>{children}</TagLabel>
      <TagCloseButton
        {...tagCloseButtonProps}
        onClick={handleClickTagCloseButton}
      />
    </Tag>
  )
}
