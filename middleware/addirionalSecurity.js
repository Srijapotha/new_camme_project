const User = require('../models/userModel');

exports.verifyUserTokenAndEmail = async (req) => {
    const userId = req.user.userId;
    const user = await User.findById(userId)
    const { email } = user;

    if (!email) {
        return { success: false, message: "Please provide Email" };
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return { success: false, message: "Authorization header missing or malformed" };
    }

    const authorizedToken = authHeader.split(" ")[1];
    // const user = await User.findById(userId).select("email");

    if (!user) {
        return { success: false, message: "User not found" };
    }

    // if (token !== authorizedToken) {
    //     return { success: false, message: "Provided token does not match authorized token" };
    // }

    if (user.email !== email) {
        return { success: false, message: "Provided email does not match authorized email" };
    }

    return { success: true, user };
};
