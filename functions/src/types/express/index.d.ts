import { IUser } from '../../models/google/user'

declare global {
    namespace Express {
        export interface Request {
            user?: IUser
        }
    }
}