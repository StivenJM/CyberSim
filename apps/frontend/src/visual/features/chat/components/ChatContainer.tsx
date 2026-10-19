import type React from 'react'
import { useMemo } from 'react'
import { ContextModeManager, HttpChatRepository } from '../../../../chat'
import { getApiBaseUrl } from '../../../common/utils/apiConfig'
import { useChatViewModel } from '../hooks/useChatViewModel'
import styles from '../styles/ChatContainer.module.css'
import MessageInput from './MessageInput'
import MessageList from './MessageList'

interface ChatContainerProps {
	isOpen?: boolean
}

const ChatContainer: React.FC<ChatContainerProps> = ({ isOpen = true }) => {
	const apiBaseUrl = getApiBaseUrl()

	const repository = useMemo(
		() => new HttpChatRepository(apiBaseUrl),
		[apiBaseUrl],
	)

	const contextManager = useMemo(() => new ContextModeManager(), [])

	const viewModel = useChatViewModel(repository, contextManager)

	return (
		<div
			className={`${styles.chatContainer} ${isOpen ? styles.open : styles.closed}`}
		>
			<MessageList
				messages={viewModel.messages}
				isTyping={viewModel.isTyping}
			/>
			<MessageInput
				onSendMessage={viewModel.sendMessage}
				disabled={viewModel.isTyping}
				isContextMode={viewModel.isContextMode}
				onToggleContextMode={viewModel.toggleContextMode}
			/>
		</div>
	)
}

export default ChatContainer
