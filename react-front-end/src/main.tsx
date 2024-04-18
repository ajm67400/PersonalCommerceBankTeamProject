import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { RouterProvider } from 'react-router-dom'
import router from './routes'
import { CommerceTable } from './custom-base-styles'
import "./global-styles.scss"

const theme = extendTheme({
  components: {
    Table: CommerceTable,
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <RouterProvider router={router} />
    </ChakraProvider>
  </React.StrictMode>,
)
