import { hashSync } from "bcrypt";
import sendEmail, { generate_otp } from "../../common/service/sendEmail.js";
import * as dbService from "../../DB/service/db.service.js";
import * as rService from "../../DB/service/redis.service.js";
import userModel from "../../DB/models/user.model.js";
import { eventEmitter } from "../../common/utilities/event.js";
import { email_template } from "../../common/utilities/email.template.js";

export const sendEmailOtp = async({email, isConfirmed, subject="Confirm Email"}={})=>{
    const blockedTTL = await rService.ttl(`otp::block::${email}`);
    if (blockedTTL > 0)
        throw new Error(`you blocked and you can resend otp after ${blockedTTL} seconds`);

    if (blockedTTL < 0) {
        if ((await rService.getValue(`otp::max::${email}`)) >= 3) {
            await rService.setValue({
                key: `otp::max::${email}`,
                value: 0,
                ttl: 60 * 5
            });
        }
    }

    const otpTTL = await rService.ttl(`otp::${email}`);
    if (otpTTL > 0) throw new Error(`you can resend otp after ${otpTTL} seconds`,{cause:403});

    const max_opt = await rService.getValue(`otp::max::${email}`);
    if (max_opt >= 3) {
        await rService.setValue({
            key: `otp::block::${email}`,
            value: "1",
            ttl: 60 * 30
        });
        throw new Error("you have exceeded the maximum numbers of tries",{cause:403});
    }

    const user = await dbService.findOne({
        model: userModel,
        filter: {
            email,
            isConfirmed: { $exists: isConfirmed }
        }
    });
    if (!user) throw new Error("user not exist or already confirmed",{cause:409});

    const otp = await generate_otp();
    const otpHash = hashSync(otp, 12);
    await rService.setValue({
        key: `otp::${email}`,
        value: otpHash,
        ttl: 60 * 3
    });

    eventEmitter.emit("confirm_email", async () => {
        await sendEmail({
            to: email,
            subject,
            html: email_template({otp, otp_ttl:otpTTL, userName: user.fName})
        });
    });

    await rService.incr(`otp::max::${email}`);
}