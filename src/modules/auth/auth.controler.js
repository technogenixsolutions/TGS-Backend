import bcryptjs from "bcryptjs";
import crypto from "crypto";
import UserModel from "./auth.model.js";
import {
  createUserService,
  findOneByIdFromUser,
  findOneByEmailFromUser,
} from "./auth.service.js";
import { genarateToken } from "../../utils/genarateToken.js";
import sendEmailFuction from "../../utils/sendEmailFuction.js";

export const createUserController = async (req, res) => {
  try {
    if (!req.body.name || !req.body.email || !req.body.password) {
      return res.status(409).json({
        statusCode: 409,
        message: "Name, email and password are required.",
      });
    }

    const checkUser = await UserModel.findOne({ email: req.body.email });
    if (checkUser) {
      return res.status(409).json({
        statusCode: 409,
        message: "This email is already in use",
      });
    }

    const hashPassword = bcryptjs.hashSync(req.body.password, 10);
    let username = req.body.name
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, "_");
    const randomString = crypto.randomBytes(2).toString("hex");
    username = `${username}${randomString}`;

    const userinfo = {
      fullname: req.body.name,
      password: hashPassword,
      username: username,
      email: req.body.email,
      verificationCode: crypto.randomInt(100000, 999999),
      role: "user",
    };

    const result = await createUserService(userinfo);

    if (!result) {
      return res.status(500).json({
        statusCode: 500,
        message: "Failed to create Technogenix account",
      });
    }

    const tokenObj = {
      userid: result._id,
      role: result.role,
      username: username,
    };

    const token = await genarateToken(tokenObj);

    if (!token) {
      return res.status(500).json({
        statusCode: 500,
        message: "Something went wrong",
      });
    }

    const admins = await UserModel.find({ role: "admin" });

    // ✅ HTML Email Templates
    const userEmailHtml = `
      <h2>Welcome to Technogenix, ${result.fullname}!</h2>
      <p>Your account has been created successfully.</p>
      <p><strong>Username:</strong> ${result.username}</p>
      <p><strong>Email:</strong> ${result.email}</p>
      <p>Use the app to manage your payments with ease. If you have questions, reply to this email.</p>
      <br/>
      <p>Thanks,<br/>The Technogenix Team</p>
    `;

    const adminEmailHtml = `
      <h2>New User Registered</h2>
      <p><strong>Name:</strong> ${result.fullname}</p>
      <p><strong>Email:</strong> ${result.email}</p>
      <p><strong>Username:</strong> ${result.username}</p>
      <p>Please verify and approve their access if needed.</p>
    `;

    // ✅ Send Email to User
    await sendEmailFuction(
      "Welcome to Technogenix!",
      [result.email],
      userEmailHtml
    );

    // ✅ Send Email to Admins
    if (admins && admins.length > 0) {
      const adminEmails = admins.map((admin) => admin.email);
      await sendEmailFuction(
        "New Technogenix Client Registered",
        adminEmails,
        adminEmailHtml
      );
    }

    return res.status(200).json({
      statusCode: 200,
      message: "Technogenix account created successfully",
      data: result,
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      statusCode: 500,
      error,
    });
  }
};

export const loginController = async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
      return res.status(409).json({
        statusCode: 409,
        message: "email and password are required.",
      });
    }

    const result = await findOneByEmailFromUser(req.body.email);

    if (!result) {
      return res.status(404).json({
        statusCode: 404,
        message: "No account found with this email",
      });
    }

    const checkPassword = await bcryptjs.compare(
      req.body.password,
      result.password
    );

    if (!checkPassword) {
      return res.status(401).json({
        statusCode: 401,
        message: "Password is incorrect",
      });
    }

    const tokenObj = {
      userid: result?._id,
      username: result?.username,
    };

    const token = await genarateToken(tokenObj);

    res.status(200).json({
      statusCode: 200,
      message: "success",
      data: result,
      token,
    });
  } catch (error) {
    console.error(error);
  }
};

export const getMeController = async (req, res) => {
  if (!req.user?.userid) {
    return res.status(401).json({
      statusCode: 401,
      message: "Unauthorized!",
    });
  }

  const user = await findOneByIdFromUser(req.user?.userid);
  res.status(200).json({
    statusCode: 200,
    message: "success",
    data: user,
    time: new Date().toISOString(),
  });
};

//
export const resetPasswordController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        statusCode: 400,
        message: "Email is required.",
      });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        message: "User not found.",
      });
    }

    const resetToken = crypto.randomInt(100000, 999999); // Generates a 6-digit token

    await UserModel.updateOne({ email }, { resetpasswordtoken: resetToken });

    const emailContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f9;
                color: #333;
                margin: 0;
                padding: 0;
            }
            .container {
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                padding: 20px;
                background-color: #007bff;
                color: #ffffff;
                border-radius: 8px 8px 0 0;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
            }
            .content {
                padding: 20px;
            }
            .content h2 {
                font-size: 20px;
                color: #333;
            }
            .content p {
                font-size: 16px;
                line-height: 1.6;
                color: #666;
            }
            .button-container {
                text-align: center;
                margin-top: 20px;
            }
            .fallback-link {
                word-break: break-all;
                font-size: 14px;
                color: #666;
                margin-top: 20px;
            }
            .footer {
                text-align: center;
                margin-top: 20px;
                font-size: 14px;
                color: #999;
            }
            .footer p {
                margin: 5px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Password Reset Request</h1>
            </div>
            <div class="content">
                <h2>Dear ${user.fullname},</h2>
                <p>You have requested to reset your password. Please click the button below to proceed:</p>
                <div class="button-container">
                    <table cellspacing="0" cellpadding="0"> 
                        <tr> 
                            <td align="center" bgcolor="#007bff" style="border-radius: 4px;"> 
                                <a href="${
                                  process.env.BASE_URL
                                }/api/v1/auth/resetpassword/check/${resetToken}/${email}" 
                                   target="_blank" 
                                   style="display: inline-block; padding: 12px 25px; font-size: 16px; color: #ffffff; text-decoration: none; font-weight: bold;">
                                    Reset My Password
                                </a> 
                            </td> 
                        </tr> 
                    </table>
                </div>
                <div class="fallback-link">
                    <p>If the button doesn't work, you can also click or copy the link below into your browser:</p>
                    <p><a href="${
                      process.env.BASE_URL
                    }/api/v1/auth/resetpassword/check/${resetToken}/${email}" target="_blank">
                    ${
                      process.env.BASE_URL
                    }/api/v1/auth/resetpassword/check/${resetToken}/${email}</a></p>
                </div>
                <p>If you did not request this, please ignore this email.</p>
                <p>Thank you,<br/>Technogenix Team</p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Technogenix. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    // Sending the email with the reset code
    try {
      await sendEmailFuction("Password Reset Request", [email], emailContent);
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      return res.status(500).json({
        statusCode: 500,
        emailError,
        message: "Error sending reset email. Please try again later.",
      });
    }

    res.status(200).json({
      statusCode: 200,
      message: "Password reset code sent to your email.",
    });
  } catch (error) {
    console.error("Error in resetPasswordController:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal server error.",
      error,
    });
  }
};

export const resetPasswordCheckController = async (req, res) => {
  try {
    const { email, token } = req.params;

    if (!email || !token) {
      return res.status(400).json({
        statusCode: 400,
        message: "Email is required.",
      });
    }

    const user = await UserModel.findOne({ email, resetpasswordtoken: token });

    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        message: "User not found.",
      });
    }

    return res.redirect(
      `${process.env.CLIENT_URL}/resetpassword/${token}/${email}`
    );
  } catch (error) {
    console.error("Error in resetPasswordController:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal server error.",
      error,
    });
  }
};

export const updatePasswordController = async (req, res) => {
  try {
    const { email, token, password } = req.body;

    if (!email || !token || !password) {
      return res.status(400).json({
        statusCode: 400,
        message: "Email, token and new password are required.",
      });
    }

    const decodedEmail = decodeURIComponent(email);

    const user = await UserModel.findOne({
      email: decodedEmail,
      resetpasswordtoken: token,
    });

    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        message: "User not found.",
      });
    }

    // Hash the new password
    const hashPassword = bcryptjs.hashSync(password, 10);

    // Update the user's password and clear the reset token
    await UserModel.updateOne(
      { email: user.email, resetpasswordtoken: token },
      {
        $set: {
          password: hashPassword,
          resetpasswordtoken: null,
        },
      }
    );

    res.status(200).json({
      statusCode: 200,
      message: "Password reset successfully.",
    });
  } catch (error) {
    console.error("Error in resetPasswordController:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal server error.",
      error,
    });
  }
};
