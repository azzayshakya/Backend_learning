function extractToken(
  req,
  { cookieKey, bodyKey, headerKey, allowBearer = false } = {},
) {
  if (allowBearer) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      return authHeader.slice(7);
    }
  }

  // if (cookieKey && req.cookies?.[cookieKey]) {
  //   return req.cookies[cookieKey];
  // }

  if (bodyKey && req.body?.[bodyKey]) {
    return req.body[bodyKey];
  }

  if (headerKey && req.headers[headerKey]) {
    return req.headers[headerKey];
  }

  return null;
}

module.exports = { extractToken };
