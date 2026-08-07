import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from "../config/constants.js";
import { authenticateUser, cleareSession, comparePassword, createAccessToken, createRefreshToken, createSessions, createUser,findUserById,generateRandomToken,getAllShortLinks,getUserByEmail, hashPassword, insertVerifyEmailToken } from "../services/auth.services.js";
import { loginUserScema, registerUserSchema } from "../validators/auth-validation.js";

export const getRegisterPage = (req, res) => {
 
  res.render("auth/register", {errors:req.flash("errors")});
};

export const postRegister = async(req,res) => {
 
  
 
  const {data, error} =  registerUserSchema.safeParse(req.body);
  
  

  if(error) {
    const errors = error.issues[0].message;
    
    req.flash("errors",errors)
    
    res.redirect("/register")
  }
   const {name, email, password} = req.body;

  const userExists = await getUserByEmail(email);
  
  
  // if(userExists) return res.redirect("/register");
  if(userExists){
    req.flash("errors","User already exist")
    return res.redirect("/register")
  }

  const hashedPassword = await hashPassword(password);

  const [user]= await createUser({name,email,password:hashedPassword})
  
  await authenticateUser({req, res, user,name, email});

  

  res.redirect("/");
  
}

export const getLoginPage = (req, res) => {
 
  res.render("auth/login", {errors: req.flash("errors")});
};
export const poetLogin = async(req, res) => {
 
  
  const {data, error} =  loginUserScema.safeParse(req.body);
  
  

  if(error) {
    const errors = error.issues[0].message;
    
    req.flash("errors",errors)
    
    res.redirect("/login")
  }
   const {email, password} = req.body;

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

  // const token = generateToken({
  //   id:user.id,
  //   name:user.name,
  //   email:user.email
  // }) 

  // res.cookie("access_token", token)
  //creation of sessions

   await authenticateUser({req, res, user});

  res.redirect("/");
};

export const getMe = (req, res) => {
  if(!req.user) return res.send("Not Loggend In...:)");
  return res.send(`<h1>Hey ${req.user.name} - ${req.user.email}</h1>`)
  

}

export const logoutUser = async(req,res) => {

  await cleareSession(req.user.sessionId);

  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  res.redirect('/login')
}

//getProfilePage

export const getProfilePage = async(req, res) => {
  if(!req.user) return res.send("Not logged in");

  const user = await findUserById(req.user.id);
  if(!user) return res.redirect("/login");

  const userShortLinks = await getAllShortLinks(user.id);

  return res.render("auth/profile", {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isEmailValid:user.isEmailValid,
      createdAt: user.createdAt,
      links: userShortLinks,
      
    }
  })
}

export const getVerifyEmailPage = async(req, res) => {
  if(!req.user) return res.redirect("/");

  const user = await findUserById(req.user.id);

  if (!user || user.isEmailValid) return res.redirect("/");

  return res.render("auth/verify-email", {
    email: req.user.email,
  });
}

export const resendVerificationLink = async(req, res) => {
  if(!req.user) return res.redirect("/");

  const user = await findUserById(req.user.id);

  if (!user || user.isEmailValid) return res.redirect("/");

  const randomToken = generateRandomToken();

  await insertVerifyEmailToken({userId: req.user.id, token: randomToken});

  const verifyEmailLink = await createVerifyEmailLink({
        email:req.user.email,
        token:randomToken,
        
    })



}