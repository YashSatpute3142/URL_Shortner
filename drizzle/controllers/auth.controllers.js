import { ACCESS_TOKEN_EXPIRY, OAUTH_EXCHANGE_EXPIRY, REFRESH_TOKEN_EXPIRY } from "../config/constants.js";
import { getHtmlFromMjmlTemplete } from "../lib/get-html-from-mjml-templete.js";
import { github } from "../lib/oauth/github.js";
import { google } from "../lib/oauth/google.js";
import { sendEmail } from "../lib/send-email.js";
import { authenticateUser, 
  cleareSession, 
  clearResetPasswordToken, 
  clearVerifyEmailTokens,
  comparePassword, 
  createAccessToken, 
  createRefreshToken, 
  createResetPasswordLink, 
  createSessions, 
  createUser,
  createUserWithOauth,
  createVerifyEmailLink,
  findUserByEmail,findUserById,
  findVerificationEmailToken,
  generateRandomToken,
  getAllShortLinks,
  getResetPasswordToken,
  getUserByEmail, 
  getUserWithOauthId, 
  hashPassword, 
  insertVerifyEmailToken, 
  linkUserWithOauth, 
  sendNewVefifyEmailLink, 
  updateUserByName, 
  updateUserPassword, 
  verifyuserEmailAndUpdate } from "../services/auth.services.js";
import { forgotPasswordSchema, loginUserScema, registerUserSchema, setPasswordSchema, verifyEmailSchema, verifyPasswordSchema, verifyResetPasswordSchema, verifyUserSchema } from "../validators/auth-validation.js";
import {decodeIdToken, generateCodeVerifier, generateState} from "arctic";
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

 await sendNewVefifyEmailLink(user.id, email);

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

  if(!user.password) {
    req.flash(
      "error",
      "You Have Created account using social login. please login with your social account"
    )
    return res.redirect("/login")
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
      hasPassword:Boolean(user.password),
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

  await sendNewVefifyEmailLink(req.user.id, req.user.email);

    res.redirect("/verify-email");

}

export const verifyEmailToken = async(req,res) => {
  const {data, error} = verifyEmailSchema.safeParse(req.query);
  
  if(error){
    return res.send("Verification link invalid or expired!")
  }

  // const token =  await findVerificationEmailToken(data); without join 
  const [token] =  await findVerificationEmailToken(data); // with join
 console.log( "~ Verification ~ Token: ", token);
  if(!token) res.send("Verification link invalid or expired!");

  await verifyuserEmailAndUpdate(token.email);

  // clearVerifyEmailTokens(token.email).catch(console.error());
  clearVerifyEmailTokens(token.userId).catch(console.error());

  return res.redirect("/profile")
  
}

export const getEditProfilePage = async(req, res) => {

  if(!req.user) return res.redirect("/");

  const user = await findUserById(req.user.id);
  if(!user) return res.status(404).send("User not found");

  return res.render("auth/edit-profile", {
    name:user.name,
    errors: req.flash("errors"),
  })

}

export const postChangeEditPeofile = async(req, res) => {
  if(!req.user) return res.redirect("/");

  const {data, error} = verifyUserSchema.safeParse(req.body) 

  if (error) {
  const errorMessages = error.issues.map((err) => err.message);

  req.flash("errors", errorMessages);

  return res.redirect("/edit-profile");
}

  await updateUserByName({userId:req.user.id, name:data.name})

  return res.redirect("/profile")


}

export const getChangePasswordPage = async(req, res) => {
  if(!req.user) return res.redirect("/");

  return res.render("auth/change-password", {
    errors: req.flash("errors"),
  })

}

export const postChangePassword = async(req, res) => {
  const {data , error} = verifyPasswordSchema.safeParse(req.body);
  if (error) {
  const errorMessages = error.issues.map((err) => err.message);
  req.flash("errors", errorMessages);
  return res.redirect("/change-password");
}

const {currentPassword, newPassword} = data;

const user = await findUserById(req.user.id);
if(!user) return res.status(404).send("User not found");

const isPasswordValid = await comparePassword(currentPassword, user.password);
if(!isPasswordValid){
  req.flash("errors", "Current Password that you entered is invalid");
  return res.redirect("/auth/change-password")
}

await updateUserPassword({userId: user.id, newPassword});

  res.redirect("/profile")
  
}

export const getResendPasswordPage = async(req, res) => {
  return res.render("auth/forgot-password", {
    formSubmitted: req.flash("formSubmitted")[0],
    errors: req.flash("errors"),
  })
}

export const postForgotPasswordPage = async(req, res) => {
  const {data, error} =  forgotPasswordSchema.safeParse(req.body)

   if (error) {
  const errorMessages = error.issues.map((err) => err.message);
  req.flash("errors", errorMessages);
  return res.redirect("/resend-password");
}

const user = await findUserByEmail(data.email);

if(user){
  const resetPasswordLink = await createResetPasswordLink({userId: user.id})

  const html = await getHtmlFromMjmlTemplete("reset-password-email", {
  name:user.name,
  link: resetPasswordLink,
})

sendEmail({
  to: user.email,
  subject:"RESET YOUR Password",
  html,
})

}
req.flash("formSubmitted", true)
return res.redirect("/resend-password")
}

export  const getResetPasswordTokenPassword = async(req,res) => {
  const {token} = req.params;
  const passwordResetData = await getResetPasswordToken(token);

  if(!passwordResetData) return res.render("auth/wrong-reset-password-token");

  return res.render("auth/resend-password", {
    formSubmitted: req.flash("formSubmitted")[0],
    errors: req.flash("errors"),
    token,
  })

}

export const postResetPasswordToken = async(req, res) => {
  const {token} = req.params;
  const passwordResetData = await getResetPasswordToken(token);

  if(!passwordResetData){
    req.flash("errors", "Password Token is not Matching.")
     return res.render("auth/wrong-reset-password-token");
  }

  const {data, error} = verifyResetPasswordSchema.safeParse(req.body);
   if (error) {
  const errorMessages = error.issues.map((err) => err.message);
  req.flash("errors", errorMessages);
  res.redirect(`/resend-password/${token}`);
  }

  const {newPassword} = data;

  const user = await findUserById(passwordResetData.userId);

  await clearResetPasswordToken(user.id);

  await updateUserPassword({userId: user.id, newPassword});

  return res.redirect("/login")

}

export const getGoogleLoginPage = async(req, res) => {
  if(req.user) return res.redirect("/");

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = google.createAuthorizationURL(state, codeVerifier, [
    "openid",
    "profile",
    "email",
  ])
  const cookieConfig = {
    httpOnly:true,
    secure:true,
    maxAge:OAUTH_EXCHANGE_EXPIRY,
    sameSite:"lax"
  };

  res.cookie("google_oauth_state", state, cookieConfig);
  res.cookie("google_code_verifier", codeVerifier, cookieConfig);

  res.redirect(url.toString())

}

export const getGoogleLoginCallback = async(req, res) => {
  // google redirect with code and state in query params
  // we will use code to find out the user
  const {code, state} = req.query;
  

  const {
    google_oauth_state: storedState,
    google_code_verifier: codeVerifier,
  } = req.cookies;

  if(!code || !state || !storedState || !codeVerifier || state !== storedState) {
    req.flash(
      "errors",
      "Couldn't login with google because of invalid login attempt. Please try again...:("
    );

    return res.redirect("/login");
  }

  let tokens;
  try {
    tokens = await google.validateAuthorizationCode(code, codeVerifier)
    
  } catch {
     req.flash(
      "errors",
      "Couldn't login with google because of invalid login attempt. Please try again...:("
    );
    return res.redirect("/login")
    
  }

  console.log("Token Google :", tokens);

  const claims = decodeIdToken(tokens.idToken());
  const {sub: googleUserId, name, email} = claims;

  // conditon 1: user allrady exist with google's oauth linked

  let user = await getUserWithOauthId({
    provider:"google",
    email,
  })

  // if user exist but user is not linked with oauth

  if(user && !user.providerAccountId) {
    await linkUserWithOauth({
      userId: user.id,
      provider:"google",
      providerAccountId:googleUserId,
    })
  }

  
// user is not register not login with google

if(!user) {
  user = await createUserWithOauth({
    name,
    email,
    provider:"google",
    providerAccountId:googleUserId,
  })
}
await authenticateUser({req, res,user,name, email});
res.redirect("/");
  
}

export const getGithubLoginPage = async(req,res) => {
  if(req.user) return res.redirect("/");

  const state = generateState();
  const url = github.createAuthorizationURL(state, ["user:email"]);

  const cookieConfig = {
    httpOnly:true,
    secure:true,
    maxAge:OAUTH_EXCHANGE_EXPIRY,
    sameSite:"lax"
  };

  res.cookie("github_oauth_state", state, cookieConfig);


  res.redirect(url.toString())
}


export const getGithubLoginCallback = async(req, res) => {
  
  const {code, state} = req.query;
  const { github_oauth_state: storedState  } = req.cookies;

  function handleFailedLogin() {
    req.flash(
      "errors",
      "Couldn't login with Github beacuse of invalid login attempt. Please try again...:("
    )

    return res.redirect("/login")
  }
  if(!code || !state || !storedState || state !== storedState) {
    return handleFailedLogin();
  }

  let tokens;

   try {
    tokens = await github.validateAuthorizationCode(code)
    
  } catch {
    return handleFailedLogin();
    
  }

  const githubUserResponse = await fetch("https://api.github.com/user",{
    headers: {
      Authorization: `Bearer ${tokens.accessToken()}`
    }
  })

  if(!githubUserResponse.ok) return handleFailedLogin();
  const githubUser = await githubUserResponse.json();
  const {id: githubUserId, name} = githubUser;

  const githubEmailResponse = await fetch(
    "https://api.github.com/user/emails",
    {
      headers:{
        Authorization: `Bearer ${tokens.accessToken()}`
      }
    }
  )

  if(!githubEmailResponse.ok) return handleFailedLogin();

  const emails = await githubEmailResponse.json();
  const email = emails.filter((e) => e.primary)[0].email;
  if(!email)  return handleFailedLogin();

 // user alrady exist with github oauth linked
let user = await getUserWithOauthId({
  provider:"github",
  email,
})

// user alrady exist with same email but github oauth not linked

if(user && !user.proveiderAccountId) {
  await linkUserWithOauth({
    userId: user.id,
    provider: "github",
    providerAccountId: githubUserId,
  })

}

//user dosent exist

if(!user) {
  user = await createUserWithOauth({
    name, 
    email,
    provider:"github",
    providerAccountId:githubUserId,
  })
}
await authenticateUser({req, res, user, name, email});
res.redirect("/");

}

export const getSetPasswordPage = async(req,res) => {
  if(!req.user) return res.redirect("/");

  return res.render("auth/set-password", {
    errors: req.flash("errors"),

  })
}

export const postSetPassword = async(req, res) => {
  const {data, error} = setPasswordSchema.safeParse(req.body);

   if (error) {
  const errorMessages = error.issues.map((err) => err.message);
  req.flash("errors", errorMessages);
  res.redirect(`/set-password`);
  }

  const {newPassword} = data;
  const user = await findUserById(req.user.id);
  if(user.password){
    req.flash(
      "errors",
      "You already have a Password, Insted Change your Password... "
    )
    return res.redirect("/set-password")
  }

  await updateUserPassword({userId:req.user.id, newPassword})
  return res.redirect("/profile");

}