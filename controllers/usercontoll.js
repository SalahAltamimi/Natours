const Users = require('../modules/userModule');
const { getAll, getOne, deleteOne, updateOne } = require('./handelFactory');

exports.getAllusers = getAll(Users);
exports.getuser = getOne(Users);
exports.deleteuser = deleteOne(Users);
exports.updateuser = updateOne(Users);

exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

exports.getCurrent = getOne(Users);
