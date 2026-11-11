import jwt, { Secret } from 'jsonwebtoken';
import { EXPIRES_IN } from '../constant/constants';

export const tokenGenerate = (id: string) => {
  if (!process.env.JWT_SECRET_KEY) {
    throw new Error('JWT secret keyが定義されていない！');
  }

  return jwt.sign({ userId: id }, process.env.JWT_SECRET_KEY as Secret, { expiresIn: EXPIRES_IN });
};

export const getUserIdByToken = async (token: string) => {
  if (!process.env.JWT_SECRET_KEY) {
    throw new Error('JWT secret keyが定義されていない！');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as Secret);
    if (typeof decoded === 'object' && decoded.userId) {
      return decoded.userId as string;
    }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('このリンクは利用できなくなりました。 新しいリンクをご利用ください！');
    }

    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('無効なリンクです！');
    }
  }

  return null;
};
