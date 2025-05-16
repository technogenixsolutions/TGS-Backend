import express from "express";
import {
  createUserController,
  getMeController,
  loginController,
  resetPasswordController,
  updatePasswordController,
} from "./auth.controler.js";
import { authentication } from "../../utils/Authentication.js";
import { captureLoginInfo } from "../../utils/captureLoginInfo.js";

const authRouter = express.Router();

authRouter.route("/register").post(createUserController);
authRouter.route("/login").post(captureLoginInfo, loginController);
authRouter.route("/me").get(authentication, getMeController);
authRouter.route("/forgetpassword").post(resetPasswordController);
authRouter.route("/updatepassword").post(updatePasswordController);

export default authRouter;
