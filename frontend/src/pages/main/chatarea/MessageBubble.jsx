function MessageBubble({ message }) {
  //console.log("message bubble rendering with id",message?.id);
  return <div>{message?.content}</div>;
}

export default MessageBubble;
