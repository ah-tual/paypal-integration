import { IName } from "./name"

export interface ISubcriber {
    payerId?: string,
    emailAddress: string,
    name: IName,
    shippingAddress?: IShippingAddress
}

interface IShippingAddress {
    
}

export const getDefault = (email: string, givenName: string, surname: string) : ISubcriber => (
    {
        emailAddress: email,
        name: <IName>{
            givenName: givenName,
            surname: surname
        },
    }
)

