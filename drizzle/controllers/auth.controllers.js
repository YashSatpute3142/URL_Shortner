export const getRegisterPage = (req, res) => {
  res.render("auth/register");
};

export const getLoginPage = (req, res) => {
  res.render("auth/login");
};
export const poetLogin = (req, res) => {
  res.setHeader("Set-Cookie", "isLoggedIn=true; path=/;" )
  res.redirect("/");
};

