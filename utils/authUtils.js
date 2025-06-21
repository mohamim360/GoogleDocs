import { verifyToken } from "../config/jwt.js";
import User from "../models/User.js";

export const authenticate = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  try {
    const decoded = verifyToken(token);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError("The user belonging to this token no longer exists.", 401)
      );
    }

    req.user = currentUser;
    next();
  } catch (err) {
    next(err);
  }
};
