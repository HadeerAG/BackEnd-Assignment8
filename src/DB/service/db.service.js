import userModel from "../models/user.model.js";

export const create = async function ({ model, data, options = {} } = {}) {
  return await model.create([data], options);
};

export const findOne = async function ({ model, filter, options = {} } = {}) {
  return await model.findOne(filter, options);
};

export const findById = async function ({ model, id, options = {} } = {}) {
  return await model.findById(id, options);
};

export const findByIdAndUpdate = async function ({ model, id,update, options = {} } = {}) {
  return await model.findByIdAndUpdate(id,update ,{new: true, runValidators: true, ...options});
};

export const findOneAndUpdate = async function ({ model, filter,update, options = {} } = {}) {
  return await model.findOneAndUpdate(filter,update ,{new: true, runValidators: true, ...options});
};