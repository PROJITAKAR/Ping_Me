const attachIO = (req, res, next) => {
  req.io = req.app.get("io");
  next();
};

export default attachIO;