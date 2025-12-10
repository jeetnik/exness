import { Router } from "express";
import { userSchema } from "@exeness/types";
import { v5 } from "uuid";
import { USERS } from "../data/db";
export const userRouter = Router();
userRouter.post("/signup", (req, res) => {
  try {
    //get the user info
    const parseUserinfo = userSchema.safeParse(req.body);

    if (!parseUserinfo.success) {
      return res.status(403).json({
        message: "Enter the correct credentail",
      });
    }
    const { email, password } = parseUserinfo.data;
    //gnerate the uuid from email
    const id = v5(email, process.env.USER_NAMESPACE_UUID!);

    if (USERS[id]) {
      res.send(403).json({
        message: "User is already exits",
      });
    }

    USERS[id] = {
      email,
      password,
      balance: { balance: 5000 },
    };
    return res.status(200).json({
      userId: id,
    });
  } catch {
    return res.status(403).json({
      message: "Error while signing up",
    });
  }
});
