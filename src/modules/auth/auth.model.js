import { Schema, model } from "mongoose";
import validator from "validator";

const userSchema = new Schema(
  {
    fullname: {
      type: "String",
      required: "true",
      validate: [
        {
          validator: (value) => validator.isLength(value, { min: 3, max: 50 }),
          message: "Name must be between 3 and 50 characters.",
        },
      ],
      default: "",
    },
    username: {
      type: "String",
      required: "true",
      default: "",
    },
    deviceverificode: {
      type: "String",
      required: false,
      default: "",
    },
    devicecheck: {
      type: Boolean,
      required: false,
      default: false,
    },

    paymentmethod: {
      type: "String",
      required: false,
      default: "",
    },

    coverphoto: {
      type: "String",
      required: true,
      default: "default.jpeg",
    },
    profilephoto: {
      type: "String",
      required: true,
      default: "default.jpeg",
    },
    tittle: {
      type: "string",
      minLength: 0,
      required: true,
      maxLength: 300,
      default: "not set",
    },
    gender: {
      type: "String",
      required: true,
      enum: ["male", "female", "other", "not set"],
      default: "not set",
    },
    status: {
      type: "String",
      required: true,
      enum: ["active", "blocked"],
      default: "active",
    },
    resetpasswordtoken: {
      type: "String",
      required: false,
      default: "",
    },

    role: {
      type: "String",
      required: true,
      enum: ["user"],
      default: "user",
    },
    location: {
      type: "string",
      required: true,
      minLength: 0,
      maxLength: 50,
      default: "not set",
    },
    birthday: {
      type: "string",
      required: true,
      default: "not set",
    },
    balance: {
      type: "Number",
      required: false,
      default: 0,
    },

    online_status: {
      type: "string",
      enum: ["true", "false"],
      required: true,
      default: "false",
    },

    email: {
      type: "String",
      required: true,
      validate: {
        validator: (value) => validator.isEmail(value),
        message: "Invalid email format.",
      },
    },
    password: {
      type: "String",
      required: true,
    },
    verificationCode: {
      type: "String",
    },
    note: {
      type: "Array",
    },
    isEmailVerified: {
      type: "Boolean",
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = model("user", userSchema);
export default UserModel;
