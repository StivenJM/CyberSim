export { default as ChatContainer } from "./components/ChatContainer";
export { default as ChatLauncher } from "./components/ChatLauncher";
export { default as FloatingChat } from "./components/FloatingChat";

export { ChatProvider, useChatContext } from "./context/ChatContext";

export { useChatViewModel } from "./hooks/useChatViewModel";
export type { ChatViewModel } from "./hooks/useChatViewModel";

export type { Message, GameContext, MessageSender } from "../../../chat";
