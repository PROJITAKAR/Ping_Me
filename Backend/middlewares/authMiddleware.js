import jwt from "jsonwebtoken";
import userModel from "../models/UserModel.js";

const requireAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
                errors: ["Token not found"],
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
                errors: ["User not found"],
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Session expired. Please log in again.",
                errors: ["TokenExpiredError"],
            });
        } else if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token. Please log in again.",
                errors: ["JsonWebTokenError"],
            });
        } else {
            return res.status(500).json({
                success: false,
                message: "Server error. Please try again later.",
            });
        }
    }
};

export default requireAuth;
