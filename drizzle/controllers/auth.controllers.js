import { comparePassword, createUser, getUserByEmail, hashPassword } from "../services/auth.services.js";

export const getRegisterPage = (req, res) => {
  res.render("auth/register");
};

export const postRegister = async(req,res) => {
  console.log(req.body);
  const {name, email, password} = req.body;

  const userExists = await getUserByEmail(email);
  console.log(userExists);
  
  if(userExists) return res.redirect("/register");

  const hashedPassword = await hashPassword(password);

  const [user]= await createUser({name,email,password:hashedPassword})
  console.log(user);
  
  res.redirect("/login")
  
}

export const getLoginPage = (req, res) => {
  res.render("auth/login");
};
export const poetLogin = async(req, res) => {
  
  const { email, password} = req.body;

  const user = await getUserByEmail(email);
  console.log(user);
  
  if(!user) return res.redirect("/login");
  const isPasswordValid = await comparePassword(password, user.password)
  if(!isPasswordValid) return res.redirect("/login");

  res.cookie("isLoggedIn",true)
  res.redirect("/");
};

