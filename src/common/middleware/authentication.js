import jwt from "jsonwebtoken";
import * as dbService from "../../DB/service/db.service.js";
import userModel from "../../DB/models/user.model.js";
import * as rService from "../../DB/service/redis.service.js";

export const authentication = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    throw new Error("You have no authorization", { cause: 404 });
  }

  const decoded = jwt.verify(authorization, "hadeer123");

  if (!decoded?.id) {
    throw new Error("Invalide token", { cause: 400 });
  }

  const user = await dbService.findOne({
    model: userModel,
    filter: { _id: decoded.id, provider: "system" },
  });

  if (!user) {
    throw new Error("email not exist", { cause: 404 });
  }

  if(user?.isConfirmed) throw new Error("user is not confirmed yet",{cause:403})

  if(user?.changeCredentialAt?.getTime()> decoded.iat*1000){
    throw new Error("This device's token expired, you should login again",{cause:400})
  }

  // if (await dbService.findOne({
  //   model: revokeTokenModel,
  //   filter: {tokenId: decoded.jti}
  // })) {
  //   throw new Error("This device's token expired, you should login again",{cause:400})
  // }

  if(await rService.ttl(`revoke_token${user._id}::${decoded.jti}`)>0){
    throw new Error("This device's token expired, you should login again",{cause:400})
  }

  req.user = user;
  req.decoded = decoded;

  next();
};
