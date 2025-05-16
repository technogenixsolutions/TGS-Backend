import UserModel from "./auth.model.js";

export const createUserService = async (userinfo) => {
  const result = await UserModel.create(userinfo);
  return result;
};

export const findOneByIdFromUser = async (ruseridq) => {
  const result = await UserModel.findOne({ _id: ruseridq });
  return result;
};
export const findOneByEmailFromUser = async (email) => {
  const result = await UserModel.findOne({ email });
  return result;
};
