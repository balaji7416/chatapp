/**
 * Sets access and refresh token cookies on the response.
 * Centralises the shared cookie configuration used by register, login, and refresh.
 */
const setAuthCookies = (res, { access_token, refresh_token }) => {
  res.cookie("refreshToken", refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.cookie("accessToken", access_token, {
    httpOnly: false, // intentionally accessible by JS for Bearer header attachment
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
};

export { setAuthCookies };
