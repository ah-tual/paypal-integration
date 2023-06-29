

export interface ISubcriber {
    payerId?: string,
    emailAddress: string,
    name: IName,
    shippingAddress?: IShippingAddress
}

interface IName {
    givenName: string,
    surname: string,
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

