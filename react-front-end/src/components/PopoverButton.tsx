// @ts-nocheck
import { ButtonGroup, useDisclosure } from "@chakra-ui/react"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
} from '@chakra-ui/react'
import { Button } from "@chakra-ui/react"
import { useRef } from "react"

const PopoverButton = ({buttonText, popoverHeader, popoverBody, colorScheme, disabled, onConfirm, loading}: {
    buttonText: string,
    popoverHeader: string | React.JSX.Element,
    popoverBody: string | React.JSX.Element,
    colorScheme?: string,
    onConfirm: Function,
    disabled?: boolean,
    loading?: boolean,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = useRef();

  return (
    <Popover
      returnFocusOnClose={false}
      initialFocusRef={cancelRef}
      isOpen={isOpen}
      onClose={onClose}
      placement='right'
      closeOnBlur={false}
    >
      <PopoverTrigger>
        <Button 
          className="commerce-bg-1"
          isLoading={loading}
          onClick={onOpen}
          isDisabled={disabled}
          colorScheme={colorScheme} 
          >
        {buttonText} 
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader fontWeight='semibold'>{popoverHeader}</PopoverHeader>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody>
          {popoverBody}
        </PopoverBody>
        <PopoverFooter display='flex' justifyContent='flex-end'>
          <ButtonGroup size='sm'>
            <Button ref={cancelRef} onClick={onClose} variant='outline'>Cancel</Button>
            <Button isLoading={loading} onClick={() => onConfirm()} colorScheme='red'>Apply</Button>
          </ButtonGroup>
        </PopoverFooter>
      </PopoverContent>
    </Popover> 
  )
}

export default PopoverButton
