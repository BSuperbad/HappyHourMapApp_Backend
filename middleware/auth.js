/** Middleware for handling req authorization for routes. */

const jwt = require("jsonwebtoken");
require('dotenv').config();
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");

/** Auth JWT token, add auth'd user (if any) to req. 
 * If token, verify, and if valid, store on payload.
 * Set properties on res.locals to make data available to 
 * subsequent middleware or route handlers.
 * res.locals is an object scoped to the current request-response cycle.
 * Data stored in res.locals is available within the same request-response 
 * cycle but not across different requests.
 * Storing token on the res.locals
*/

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      const user = jwt.verify(token, SECRET_KEY);
      res.locals.user = user;
    }
    return next();
  } catch (err) {
    console.error("JWT Verification Error:", err);
    return next(err);
  }
}

/** Require logged-in user or raise 401 */

function ensureLoggedIn(req, res, next) {
  try{
    if (!res.locals.user) throw new UnauthorizedError("Unauthorized, must be logged-in!");
    return next();
  } catch (err) {

    return next(err);
  }
}

/** Require admin user or raise 401 */

function isAdmin(req,res,next) {
  try {
    if(!res.locals.user || res.locals.user.isAdmin === false) {
      throw new UnauthorizedError("Unauthorized, must be an admin!");
    }
    return next();
  } catch (err) {
    return next(err)
  }
}


module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  isAdmin
};
