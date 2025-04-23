const { hash } = require("bcrypt");
const User = require("../models/User.model");
const crypto = require("crypto");

const securePassword = async (password) => {
  const hashedPassword = await hash(password, 9);
  return hashedPassword;
};
const generateRandomUsername = () => {
  const randomNumber = Math.floor(100000 + Math.random() * 900000);
  return `user${randomNumber}`;
};

const generateRandomPassword = (length = 12) => {
  const charset =
    process.env.CHARSET ||
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?";
  const charsetLength = charset.length;

  // Generate random bytes
  const randomBytes = crypto.randomBytes(length);

  // Map random bytes to characters in the charset
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes[i] % charsetLength;
    password += charset[randomIndex];
  }

  return password;
};

const registerUserOAuth20 = async (profile) => {
  const { provider, id, displayName, username, email, phone, photos } = profile;

  const oldUser = await User.findOne({ provider: provider, providerId: id });

  if (!oldUser) {
    const newUser = await User.create({
      provider: provider,
      providerId: id,
      username: displayName ?? username ?? generateRandomUsername(),
      email: email ?? undefined,
      phone: phone ?? undefined,
      avatar: photos ? photos[0].value : undefined,
      isActive: true,
      role: "user",
    });
    if (!newUser) {
      return false;
    }
  } else {
    return false;
  }

  return true;
};

module.exports = {
  securePassword,
  generateRandomUsername,
  generateRandomPassword,
  registerUserOAuth20,
};
