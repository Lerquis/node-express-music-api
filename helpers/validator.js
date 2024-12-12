const validator = require("validator");

const registerValidator = (params) => {
  console.log(params.name);
  let name = params.name
    ? !validator.isEmpty(params.name) &&
      validator.isLength(params.name, { min: 3, max: undefined }) &&
      validator.isAlpha(params.name, "es-ES")
    : true;
  let surname = params.surname
    ? !validator.isEmpty(params.surname) &&
      validator.isLength(params.surname, { min: 3, max: undefined }) &&
      validator.isAlpha(params.surname, "es-ES")
    : true;
  let nick = params.nick
    ? !validator.isEmpty(params.nick) &&
      validator.isLength(params.nick, { min: 3, max: undefined })
    : true;
  let password = params.password
    ? !validator.isEmpty(params.password) &&
      validator.isLength(params.password, { min: 3, max: undefined })
    : true;
  let email = params.email
    ? !validator.isEmpty(params.password) && validator.isEmail(params.email)
    : true;

  return email && password && name && surname && nick;
};

module.exports = {
  registerValidator,
};
