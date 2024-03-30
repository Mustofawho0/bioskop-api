import fs from "fs";

export const ReadFile = () => {
    return JSON.parse(fs.readFileSync("./db/db.json").toString());
 }
 export const WriteFile = (db: any) => {
     fs.writeFileSync("./db/db.json", JSON.stringify(db));
 }