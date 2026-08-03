import { comparePassword, createUser, generateToken, getUserByEmail, hashPassword } from "../services/auth.services.js";

export const getRegisterPage = (req, res) => {
 
  res.render("auth/register", {errors:req.flash("errors")});
};

export const postRegister = async(req,res) => {
 
  
  const {name, email, password} = req.body;

  const userExists = await getUserByEmail(email);
  
  
  // if(userExists) return res.redirect("/register");
  if(userExists){
    req.flash("errors","User already exist")
    return res.redirect("/register")
  }

  const hashedPassword = await hashPassword(password);

  const [user]= await createUser({name,email,password:hashedPassword})
  
  
  res.redirect("/login")
  
}

export const getLoginPage = (req, res) => {
 
  res.render("auth/login", {errors: req.flash("errors")});
};
export const poetLogin = async(req, res) => {
 
  
  const { email, password} = req.body;

  const user = await getUserByEmail(email);
 
  
  if(!user){
    req.flash("errors","Invalid Email or Passward")
    return res.redirect("/login");
  } 
  const isPasswordValid = await comparePassword(password, user.password)
  if(!isPasswordValid){
    req.flash("errors","Invalid Email or Passward")
    return res.redirect("/login");
  } 

  // res.cookie("isLoggedIn",true)

  const token = generateToken({
    id:user.id,
    name:user.name,
    email:user.email
  }) 

  res.cookie("access_token", token)


  res.redirect("/");
};

export const getMe = (req, res) => {
  if(!req.user) return res.send("Not Loggend In...:)");
  return res.send(`<h1>Hey ${req.user.name} - ${req.user.email}</h1>`)
  

}

export const logoutUser = (req,res) => {
  res.clearCookie("access_token");
  res.redirect('/login')
}
