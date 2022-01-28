function generateRandomString() {
  const chart = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (i = 0; i < 6; i++) {
    result = result + chart[Math.floor(Math.random() * (chart.length - 1))];
  }
  return result;
}

function isEmailExsist (email, users) {
  for (let user in users) {
    if (users[user]["email"] === email) {
      return user;
    }
  }
  return false;
}

function getUserUrl (userid, urlDatabase) {
  const result = { };
  for (let ele in urlDatabase) {
    if (userid === urlDatabase[ele]["userID"]) {
      result[ele] = urlDatabase[ele].longURL;
    }
  }
  return result;
}

module.exports = {generateRandomString, isEmailExsist, getUserUrl};