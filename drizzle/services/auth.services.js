import { eq, lt } from "drizzle-orm";
import {db} from "../config/db.js";
import { sessionsTable, shortLinksTable, usersTable, verifyEmailTokenTable } from "../drizzle/schema.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import crypto  from "crypto";
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
    return jwt.sign(
        { sessionId },
        process.env.JWT_SECRET,
        {
            expiresIn: REFRESH_TOKEN_EXPIRY / MILLISECONDS_PER_SECOND,
        }
    );
};

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

export const refreshTokens = async (refreshToken) => {
    try {
        const decodedToken = verifyJWTToken(refreshToken);

        const currentSession = await findSessionById(decodedToken.sessionId);

        if (!currentSession || !currentSession.valid) {
            throw new Error("Invalid session");
        }

        const user = await findUserById(currentSession.userId);

        if (!user) {
            throw new Error("Invalid user");
        }

        const userInfo = {
            id: user.id,
            name: user.name,
            email: user.email,
            isEmailValid:user.isEmailValid,
            sessionId: currentSession.id,
        };

        const newAccessToken = createAccessToken(userInfo);

        const newRefreshToken = createRefreshToken(currentSession.id);

        return {
            newAccessToken,
            newRefreshToken,
            user: userInfo,
        };
    } catch (error) {
        console.log(error.message);
        return null;
    }
};


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
    isEmailValid: false,
    sessionId:session.id,
  })
  const refreshToken = createRefreshToken(session.id);

  const baseConfig = {httpOnly:true, secure:false};

  res.cookie("access_token", accessToken, {
    ...baseConfig,
    maxAge:ACCESS_TOKEN_EXPIRY,
  })

  
  res.cookie("refresh_token", refreshToken, {
    ...baseConfig,
    maxAge: REFRESH_TOKEN_EXPIRY,
  })
}

export const getAllShortLinks = async(userId) => {
    return await db
    .select()
    .from(shortLinksTable)
    .where(eq(shortLinksTable.userId, userId));

}

export const generateRandomToken = async(digit = 8) => {
    const min = 10 ** (digit -1);
    const max = 10 ** digit;
    return crypto.randomInt(min, max).toString()
}

export const insertVerifyEmailToken = async({userId, token}) => {

    await db.delete(verifyEmailTokenTable).where(lt(verifyEmailTokenTable.expiresAt, sql`CURRENT_TIMESTAMP`))

    await db.insert(verifyEmailTokenTable).values({userId,token});

    
}

export const createVerifyEmailLink = async({email,token}) => {
    const uriEncodedEmail = encodeURIComponent(email);
    return `${process.env.FRONTEND_URL}/verify-email-token=${token}&email=${uriEncodedEmail}`;
}