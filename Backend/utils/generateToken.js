import jwt from 'jsonwebtoken';
const generateToken=(user)=>{
    let token =jwt.sign({email: user.email, id: user._id},process.env.JWT_SECRET);
    return token;
};

export default generateToken;