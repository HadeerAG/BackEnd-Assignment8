
import * as dbService from './../../DB/service/db.service.js ';
//================ Create message ================
export const createMessage = async (req, res, next) => {
  const { content, userId } = req.body;
    
  if (await userModel.findOne({ email: email.toLowerCase() })) {
    throw new Error("Email already exist", { cause: 409 });
  }

  if(!req.files|| !req.files.coverImages || req.files.coverImages.length == 0){
      throw new Error("Please upload at least one file")
  }

  const paths = [];
  for (const file of req.files.coverImages) {
    paths.push(file.path);
  }

  const user = await dbService.create({
    model: userModel,
    data: {
      fName,
      lName,
      email,
      password: await Hash(password),
      cPassword: await Hash(cPassword),
      age,
      gender,
      phone: Encrypt(phone),
      profileImage: req.files.profileImage[0].path,
      coverImages: paths,
    },
  });
  res
    .status(201)
    .json({ message: "Account created successfully", userData: user });
};