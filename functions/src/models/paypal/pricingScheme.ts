import { IFixedPrice } from "./fixedPrice";

export interface IPricingScheme {
    fixedPrice: IFixedPrice,
    version: number,
    createTime: string,
    updateTime: string
}