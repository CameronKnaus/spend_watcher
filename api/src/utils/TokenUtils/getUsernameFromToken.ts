import jwt from 'jsonwebtoken';

export default function getUsernameFromToken(token: string) {
    const decodedToken = jwt.decode(token);
    if (!decodedToken?.sub) {
        throw new Error('Token error encountered');
    }

    return `${decodedToken.sub}`;
}
