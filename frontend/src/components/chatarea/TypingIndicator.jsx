import { useCurrentTypingUsers } from "../../store/chatStore";
function TypingIndicator() {
  const typingUsers = useCurrentTypingUsers();
  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    const names = typingUsers.map((u) => u?.username);
    if (names.length === 1) return `${names[0]} is typing...`;
    if (names.length === 2) return `${names[0]} and ${names[1]} are typing...`;
    return `${names[0]}, ${names[1]} and ${names.length - 2} others are typing...`;
  };
  return <div>{getTypingText()}</div>;
}

export default TypingIndicator;
