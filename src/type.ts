export interface IRegister {
    username: string,
    email: string,
    password: string,
    role: string
}

export interface IRegisterJSON extends IRegister {
    uid: number
}

// export interface ITransactions {
//     moviesId : number,
//     time : string,
//     total_seat : number,
//     date : string
// }
// export interface ITransactionsJSON extends ITransactions {
//     userid : string
// }