import { Request, Response, NextFunction } from 'express';
import jwt, { Algorithm, Secret, VerifyErrors } from 'jsonwebtoken';

// Verify that the current token is legal
export default function (request: Request, response: Response, next: NextFunction) {
  const { token } = request.cookies;
  if (!token) {
    // No token provided, error out
    return response.status(403).send({
      message: 'Not authorized to access this endpoint',
    });
  }

  jwt.verify(
    token,
    process.env.SECRET_KEY as Secret,
    { algorithms: [process.env.JWT_ALGORITHM as Algorithm] },
    (err: VerifyErrors | null) => {
      if (err) {
        response.clearCookie('token');
        return response.status(403).send({
          message: 'Please login again',
        });
      }

      next();
    },
  );
}
