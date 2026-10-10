import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@/providers/theme'
import { Toaster } from '@/components/ui/sonner'
import '@/styles/globals.css'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
    <ThemeProvider>
        <App />
        <Toaster />
    </ThemeProvider>,
)
