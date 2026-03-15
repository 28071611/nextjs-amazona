import { Link } from '@/i18n'
import { Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ChatbotButton() {
  return (
    <Button variant="ghost" size="sm" asChild className="header-button">
      <Link href="/chatbot" className="flex items-center gap-2">
        <Bot className="h-5 w-5" />
        <span className="hidden sm:inline">Chatbot</span>
      </Link>
    </Button>
  )
}
