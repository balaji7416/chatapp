function ConversationItem({ conversation, onClick }) {
  console.log(conversation);
  return <div onClick={onClick}>{conversation.name}</div>;
}

export default ConversationItem;
