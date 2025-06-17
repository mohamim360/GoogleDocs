const User = require('../models/User');
const { signToken } = require('../config/jwt');
const AppError = require('../utils/appError');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, avatar } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new AppError('User already exists', 400));
    }
    
    const user = await User.create({
      name,
      email,
      password,
      avatar: avatar || undefined
    });
    
    const token = signToken(user._id);
    
    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }
    
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Incorrect email or password', 401));
    }
    
    const token = signToken(user._id);
    
    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

