import * as dbService from './../../DB/service/db.service.js ';
import messageModel from './../../DB/models/message.model.js';
import userModel from '../../DB/models/user.model.js';

//================ Create message ================

export const createMessage = async (req, res, next) => {
  const { content, userId } = req.body;

  if (!content && !req.files.length) {
    throw new Error("Content is required", {cause: 400})
  };

  const isUserExist = await dbService.findById({
    model: userModel,
    id: userId
  })

    if (!isUserExist) {
      throw new Error("User is not exist",{cause:400});  
    };

     const paths = [];

  if(req.files?.length){
      for (const file of req.files) {
    paths.push(file.path);
  }
}

const message = await dbService.create({
  model: messageModel,
  data:{
    content,
    attachments: paths,
    userId
  }
})

  res
    .status(201)
    .json({ message: "Done", message });
};

//================ Get messages ================

export const getMessages = async (req, res, next) => {

const messages = await dbService.find({
  model: messageModel,
  filter:{
    userId: req.user._id
  }
})

  res
    .status(200)
    .json({ message: "Done", messages });
};

//================ Get message by id ================

export const getMessageById = async (req, res, next) => {

const message = await dbService.findOne({
  model: messageModel,
  filter:{
    _id: req.params.id,
    userId: req.user._id
  }
})

  res
    .status(200)
    .json({ message: "Done", data: message });
};