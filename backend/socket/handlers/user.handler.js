import { findUserById } from "../../repositories/user.repo.js";

const getUserStatusHandler = async ({ io, socket, data }) => {
  const { userId } = data;
  const user = await findUserById(userId);
  return {
    data: user,
  };
};

export default getUserStatusHandler;
