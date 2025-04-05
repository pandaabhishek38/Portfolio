import jwt from 'jsonwebtoken'

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Token missing' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, 'jwt_secret_key') // Same key as in login route
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' })
  }
}
