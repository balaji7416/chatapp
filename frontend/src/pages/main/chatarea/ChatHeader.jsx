import { CLIENT } from "../../../lib/events.js";
import {
  useChatStore,
  useCurrentConversation,
  useCurrentMembers,
} from "../../../store/chatStore.js";
import { useSocketStore } from "../../../store/socketStore.js";
import { ArrowLeft, MoreVertical } from "lucide-react";
function ChatHeader({ onChatInfoClick, setView }) {
  // const [openOptions, setOpenOptions] = useState(false);

  const currConversation = useCurrentConversation();
  const members = useCurrentMembers();
  const isMembersLoading = useChatStore((state) => state.isMembersLoading);
  const leaveConversation = useChatStore((state) => state.leaveConversation);
  const setChat = useChatStore((state) => state.setChatChosen);
  const emit = useSocketStore((state) => state.emit);
  const isConnected = useSocketStore((state) => state.isConnected);
  if (!currConversation) return <div>choose a conversation</div>;

  const handleLeave = async () => {
    await leaveConversation(currConversation?.id);
    if (isConnected)
      emit(CLIENT.LEAVE_CHAT, { conversationId: currConversation?.id });
    // setOpenOptions(false);
  };
  const memberMsg = () => {
    if (members.length === 0) return "No members";
    if (members.length === 1) return `${members[0]?.username}(You)`;
    if (members.length === 2)
      return `${members[0]?.username} and ${members[1]?.username}`;
    return `${(members[0]?.username, members[1]?.username)} and ${members.length - 2} others`;
  };
  return (
    <div className="flex items-center justify-between p-3 border-b-2 border-gray-200">
      <div className="flex-1 flex items-center gap-5">
        <button
          onClick={() => setChat(false)}
          className="btn btn-circle cursor-pointer lg:hidden"
        >
          <ArrowLeft />
        </button>
        <button
          onClick={() => setView("chats")}
          className="btn btn-circle cursor-pointer hidden lg:flex items-center justify-center "
        >
          <ArrowLeft />
        </button>
        <div
          className="flex-1 flex gap-2 cursor-pointer hover:bg-base-200"
          onClick={onChatInfoClick}
        >
          <div className="w-full ">
            <h1 className="text-xl font-bold ">{currConversation.name}</h1>
            <p
              className={`truncate font-semibold text-xs text-base-content/45 flex-1 ${isMembersLoading && "skeleton"}`}
            >
              {memberMsg()}
            </p>
          </div>
        </div>
      </div>
      <div className="dropdown dropdown-bottom dropdown-end">
        <div
          tabIndex={0}
          role="button"
          className="btn avatar btn-circle cursor-pointer"
        >
          <MoreVertical />
        </div>
        <ul
          tabIndex="-1"
          className="dropdown-content menu bg-base-100 rounded-box z-10 w-50 md:p-2 shadow-sm font-semibold"
        >
          <li>
            <a onClick={handleLeave}>Leave Chat</a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default ChatHeader;
