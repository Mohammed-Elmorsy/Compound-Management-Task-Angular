import { User } from "./user";
import { Visitor } from "./visitor";

export class Visit {
    id?: number;
    number?: string;
    type?: string;
    date?: number = new Date().getTime();
    status?: string;
    carPlateNumber?: string;
    visitor?: Visitor;
    userId?: number;
    userFullName: string;
}
