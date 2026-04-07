import {
  useChatStore,
  useCurrentConversation,
  useCurrentMembers,
} from "../../../store/chatStore.js";
import { useAuthStore } from "../../../store/authStore.js";

function ChatInfo({ onClick }) {
  const user = useAuthStore((state) => state.user);
  const currentConv = useCurrentConversation();
  // console.log(currentConv);
  const members = useCurrentMembers();
  const isMembersLoading = useChatStore((state) => state.isMembersLoading);
  const userRole = members.find((m) => m.id === user.id)?.role;
  return (
    <div>
      <button onClick={onClick}>back</button>
      <h1>{currentConv?.name}</h1>
      <p>members: {members.length}</p>
      {isMembersLoading && <p>Loading...</p>}
      <ul>
        <li>
          {user?.username}(You) {userRole}
        </li>
        {members.map((member) => (
          <li key={member?.id}>
            {member?.username !== user?.username &&
              member?.username + " " + member?.role}
          </li>
        ))}
      </ul>
    </div>
  );
}
export default ChatInfo;
