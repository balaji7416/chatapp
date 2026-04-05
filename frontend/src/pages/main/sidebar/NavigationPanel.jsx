function NavigationPanel({
  onLogout,
  onChatsClick,
  onCreateChatClick,
  onJoinChatClick,
}) {
  return (
    <div className="relative">
      <div className="absolute top-10 right-0">
        <button
          onClick={onLogout}
          className="text-xs bg-red-500 text-white px-2 py-1 rounded"
        >
          Logout
        </button>
        <button onClick={onChatsClick}>Chats</button>
        <button onClick={onCreateChatClick}>create chat</button>
        <button onClick={onJoinChatClick}>join chat</button>
      </div>
    </div>
  );
}

export default NavigationPanel;
