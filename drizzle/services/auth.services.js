import { eq } from "drizzle-orm";
import {db} from "../config/db.js";
import { sessionsTable, usersTable } from "../drizzle/schema.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_EXPIRY, MILLISECONDS_PER_SECOND, REFRESH_TOKEN_EXPIRY } from "../config/constants.js";

export const getUserByEmail = async(email) => {
    const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

    return user;

}

export const createUser = async({name,email,password}) => {
    return await db
    .insert(usersTable)
    .values({name,email,password})
    .$returningId();
}

export const hashPassword = async (password) => {
    return await argon2.hash(password);
}

export const comparePassword = async(password, hash) => {
    return await argon2.verify(hash, password);
}

// export const generateToken = ({id,name,email}) => {
//     return jwt.sign({id,name,email}, process.env.JWT_SECRET,{
//         expiresIn:"30d",
//     })
// }
export const createSessions = async(userId, {ip, userAgent}) => {
    const [session] = await db
    .insert(sessionsTable)
    .values({userId,ip,userAgent})
    .$returningId();
    return session;
}

export const createAccessToken = ({id,name,email,sessionId}) => {
    return jwt.sign({id,name,email,sessionId}, process.env.JWT_SECRET, {
        expiresIn:ACCESS_TOKEN_EXPIRY/MILLISECONDS_PER_SECOND,
    })
}

export const createRefreshToken = (sessionId) => {
    return jwt.sign({sessionId}, process.env.JWT_SECRET, {
        expiresIn:ACCESS_TOKEN_EXPIRY/MILLISECONDS_PER_SECOND,
    })

}

export const verifyJWTToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET)
    
};

export const findSessionById = async(sessionId) => {
    const [session] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.id, sessionId));

    return session;
};

export const findUserById = async(userId) => {
    const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));

    return user;
}

//refereshToken

export const refreshTokens = async(refereshToken) => {
    try {
        const decodedToken = verifyJWTToken(refereshToken);
        const currentSessions = await findSessionById(decodedToken.sessionId);

        if(!currentSessions || !currentSessions.valid) {
            throw new Error("Invalid session");
        }

        const user = await findUserById(currentSessions.userId)

        if(!user) throw new Error("Invalid User");

        const userInfo = {
            id:user.id,
            name:user.name,
            email: user.email,
            sessionId: currentSessions.id,
        }
        const newAccessToken = createAccessToken(userInfo)
        const newRefreshToken = createRefreshToken(currentSessions.id);

        return {
            newAccessToken,
            newRefreshToken,
            user:userInfo
        }

    } catch (error) {
        console.log(error.message);
        
    }
}


export const cleareSession = async(sessionId) => {
  return db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId))
} 

export const authenticateUser = async({req, res, user,name, email}) => {
    // res.redirect("/login")
  const session = await createSessions(user.id, {
    ip:req.clientIp,
    userAgent:req.headers["user-agent"],
  })

  const accessToken = createAccessToken({
    id:user.id,
    name:user.name || name,
    email:user.email || email,
    sessionId:session.id,
  })
  const refreshToken = createRefreshToken(session.id);

  const baseConfig = {httpOnly:true, secure:true};

  res.cookie("access_token", accessToken, {
    ...baseConfig,
    maxAge:ACCESS_TOKEN_EXPIRY,
  })

  
  res.cookie("refresh_token", refreshToken, {
    ...baseConfig,
    maxAge: REFRESH_TOKEN_EXPIRY,
  })
}