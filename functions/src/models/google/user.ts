import { TokenPayload } from 'google-auth-library';

export interface IUser {
    email: string,
    name: string,
    givenName: string,
    familyName: string,
    locale: string,
}

export class User implements IUser {
    email: string = '';
    name: string = '';
    givenName: string = '';
    familyName: string = '';
    locale: string = '';

    public static get = (payload: TokenPayload) : IUser => ({
        email: payload.email!,
        name: payload.name!,
        givenName: payload.given_name!,
        familyName: payload.family_name!,
        locale: payload.locale!
    })
}

export interface GoogleAccount {
    email: string,
    name: string,
    given_name: string,
    family_name: string,
    locale: string,
}

export const get = (payload: TokenPayload) : IUser => ({
    email: payload.email!,
    name: payload.name!,
    givenName: payload.given_name!,
    familyName: payload.family_name!,
    locale: payload.locale!
})