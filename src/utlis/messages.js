const generatmessages = (username, text) => {
  return {
    username,
    text,
    creatAt: new Date().getTime(),
  };
};
const generateLocation = (username, url) => {
  return {
    username,
    url,
    creatAt: new Date().getTime(),
  };
};
module.exports = {
  generatmessages,
  generateLocation,
};
