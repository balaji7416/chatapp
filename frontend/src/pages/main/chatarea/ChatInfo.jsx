import {
  useChatStore,
  useCurrentConversation,
  useCurrentMembers,
} from "../../../store/chatStore.js";
import { useAuthStore } from "../../../store/authStore.js";
import { useEffect } from "react";

function ChatInfo({ onClick }) {
  const user = useAuthStore((state) => state.user);
  const currentConv = useCurrentConversation();
  // console.log(currentConv);
  const members = useCurrentMembers();
  const isMembersLoading = useChatStore((state) => state.isMembersLoading);
  const userRole = members.find((m) => m.id === user.id)?.role;
  const fetchMembers = useChatStore((state) => state.fetchMembers);
  //fetch conversation info on reload
  useEffect(() => {
    if(!currentConv) return;
    if(!members || members.length === 0)
      fetchMembers(currentConv.id);
  },[currentConv, fetchMembers,members]);
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
        <span>chatId: {currentConv?.id}</span>
      </ul>
    </div>
  );
}
export default ChatInfo;
