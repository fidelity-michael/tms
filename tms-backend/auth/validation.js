// Validation
const Joi = require("@hapi/joi");

const registerValidation = (data) => {
  const schema = Joi.object().keys({
    first_name: Joi.string().min(4),
    last_name: Joi.string().min(4),
    email: Joi.string().email().min(4).required(),
    password: Joi.string().min(4).required(),
    role: Joi.string().required(),
    group: Joi.string().required(),
    thesis: Joi.array(),
    department: Joi.string().required(),
  });

  return schema.validate(data);
};

const loginValidation = (data) => {
  const schema = Joi.object().keys({
    email: Joi.string().email().min(4).required(),
    password: Joi.string().min(4).required(),
  });

  return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
