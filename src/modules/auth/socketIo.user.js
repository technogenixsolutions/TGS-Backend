import sendEmailFuction from "../../utils/sendEmailFuction.js";
import NotificationModel from "../notification/notification.model.js";
import PaymentModel from "../payment/payment.model.js";
import UserModel from "./auth.model.js";

const activeStatus = (io) => {
  io.on("connection", (client) => {
    ("someone connected");

    client.on("disconnect", () => {
      console.warn("someone disconnected");
    });
  });
};

export default activeStatus;

const generateTransactionId = () => {
  return `TXN-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
};

const updatePaymentToUser = async (data, packageDataF, uid) => {
  try {
    await UserModel.updateOne(
      { _id: data?._id },
      {
        $set: {
          readyforwithdraw:
            +data?.readyforwithdraw +
            (+packageDataF?.roi * +packageDataF?.invest) / 100,
        },
      }
    );
    const tranjection_id = generateTransactionId();
    await PaymentModel.create({
      tranjection_id,
      ammount: (+packageDataF?.roi * +packageDataF?.invest) / 100,
      paymentmethod: "from cash",
      type: "doller",
      status: "accepted",
      billing_type: "earn",
      ownerid: uid,
    });

    return {
      tranjection_id,
      ammount: (+packageDataF?.roi * +packageDataF?.invest) / 100,
      paymentmethod: "from cash",
      packageData: packageDataF,
      time: new Date(),
    };
  } catch (error) {
    return false;
  }
};

// Function to update a user's payment information for all packages
export const updatePayment = async (user) => {
  try {
    const packageData = user?.packagesdata;
    let updatedPackage = [];
    let paymentDetails = [];
    let ifUpdated = false;

    if (packageData && packageData.length > 0) {
      for (const s_package of packageData) {
        const lastPayDate = s_package?.lastpayedDate
          ? s_package.lastpayedDate
          : 0;

        const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
        const oneDayLater = +lastPayDate + oneDayInMilliseconds;

        if (oneDayLater < Date.now()) {
          if (
            +s_package?.enddate > (+s_package?.lastpayedDate || Date.now()) &&
            (+s_package?.totalpayed || 0) < (+s_package?.duration || 0) &&
            (+s_package?.roi || 0) > 0 &&
            (+s_package?.invest || 0) > 0
          ) {
            const response = await updatePaymentToUser(
              user,
              s_package,
              user?._id
            );

            if (+s_package?.enddate > Date.now()) {
              updatedPackage.push({
                ...s_package,
                totalpayed: (+s_package?.totalpayed || 0) + 1,
                earn: (+s_package?.earn || 0) + response?.ammount,
                lastpayedDate: Date.now(),
              });
            }

            paymentDetails.push(response);
            ifUpdated = true;
          } else {
            const response = await updatePaymentToUser(
              user,
              s_package,
              user?._id
            );

            if (+s_package?.enddate > Date.now()) {
              updatedPackage.push({
                ...s_package,
                totalpayed: (+s_package?.totalpayed || 0) + 1,
                earn: (+s_package?.earn || 0) + response?.ammount,
                lastpayedDate: Date.now(),
              });
            }

            paymentDetails.push(response);
            ifUpdated = true;
          }
        }
      }
    }

    if (!ifUpdated) {
      return { message: "No updates made for this user." };
    }

    // Update the user record with the modified package data
    await UserModel.updateOne(
      { _id: user?._id },
      {
        $set: {
          packagesdata: updatedPackage,
        },
      }
    );

    // Send the email notification
    const emailRes = await sendEmailFuction(
      "Payment Received",
      [user?.email],
      `
      <div style="font-family: Arial, sans-serif; text-align: center; background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4CAF50;">Payment Received - Today's ROI</h1>
        <p style="font-size: 16px; color: #555;">Payment has been successfully processed.</p>

        <h2 style="color: #333; margin-top: 20px;">Payment Details</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #4CAF50; color: white;">
              <th style="padding: 10px; border: 1px solid #ddd;">Transaction ID</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${paymentDetails
              .map(
                (payment) => `
              <tr style="background-color: #f9f9f9; color: #333;">
                <td style="padding: 10px; border: 1px solid #ddd;">${payment?.tranjection_id}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${payment?.ammount}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        <p style="font-size: 14px; color: #777;">Thank you for using our service!</p>
      </div>
    `
    );

    // Create a new notification record
    await NotificationModel.create({
      title: "Payment Received",
      ownerid: user?._id,
      link: "/payment",
      status: "unread",
    });

    return {
      paymentDetails,
      updatedPackage,
    };
  } catch (error) {
    console.error(error);
    return { error: error.message };
  }
};
