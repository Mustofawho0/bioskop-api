"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = require("./utils/fs");
const router = (0, express_1.default)();
router.use(express_1.default.json());
const port = 5000;
router.post("/register", (req, res) => {
    try {
        const register = req.body;
        const db = (0, fs_1.ReadFile)();
        const registerUser = db.users;
        const uid = Date.now();
        // if (register.username.length) throw new Error("Username udah ada");
        const findUser = registerUser.filter((user) => user.username === register.username || user.email === register.email);
        if (findUser.length > 0)
            throw new Error("Username/Email udah ada");
        registerUser.push(Object.assign({ uid }, register));
        db.users = registerUser;
        console.log(registerUser);
        (0, fs_1.WriteFile)(db);
        return res.send({
            uid,
            username: register.username,
            email: register.email,
        });
    }
    catch (error) {
        res.send(error.message);
    }
});
router.post("/auth", (req, res) => {
    try {
        const { username, password } = req.body;
        const db = (0, fs_1.ReadFile)();
        const loginUser = db.users;
        const findUser = loginUser.filter((user) => (user.username === username || user.email === username) &&
            user.password === password);
        if (findUser.length === 0)
            throw new Error("Username/Password wrong");
        return res.send({
            uid: findUser[0].uid,
            username: findUser[0].username,
            role: findUser[0].role,
        });
    }
    catch (error) {
        res.send(error.message);
    }
});
router.get("/movies", (req, res) => {
    try {
    }
    catch (error) {
        console.log(error);
    }
});
router.post("/transactions", (req, res) => {
    try {
        // const userid = req.headers.userid
        const { userid } = req.headers;
        const { moviesId, time, total_seat, date, } = req.body;
        const db = (0, fs_1.ReadFile)();
        const users = db.users;
        const movies = db.movies;
        const transactions = db.transactions;
        const findUser = users.find((user) => user.uid === Number(userid));
        // console.log(findUser);
        if (!findUser)
            throw new Error(`User ${userid} not Found!`);
        const findMovie = movies.filter((movie) => movie.id === moviesId &&
            movie.show_times.includes(time) &&
            movie.release_date < date);
        // console.log(findMovie)
        if (findMovie.length === 0)
            throw new Error("Movie not Found!");
        let bookSeat = 0;
        transactions.map((transaction) => {
            if (transaction.moviesId === moviesId &&
                transaction.time === time &&
                transaction.date === date)
                bookSeat += transaction.total_seat;
        });
        let availableSeat = findMovie[0].total_seat - bookSeat;
        if (availableSeat < total_seat)
            throw new Error("Not enough seat");
        const isWeekend = new Date(date).getDay() === 0 || new Date(date).getDay() === 6
            ? true
            : false;
        let totalPrice = 0;
        if (isWeekend) {
            totalPrice = findMovie[0].price[0].weekend * Number(total_seat);
        }
        else {
            totalPrice = findMovie[0].price[0].weekdays * Number(total_seat);
        }
        transactions.push(Object.assign(Object.assign({ uid: userid, name: findMovie[0].name, genre: findMovie[0].genre }, req.body), { price: totalPrice }));
        (0, fs_1.WriteFile)(db);
        res.send(Object.assign(Object.assign({}, req.body), { price: totalPrice }));
    }
    catch (error) {
        res.send(error.message);
    }
});
router.post("/admin/movies", (req, res) => {
    try {
        const { userid } = req.headers;
        const movies = req.body;
        const db = (0, fs_1.ReadFile)();
        const newMovies = db.movies;
        const users = db.users;
        const findUser = users.filter((user) => user.uid === Number(userid));
        if (findUser[0].role !== "admin")
            throw new Error("You're not Admin");
        // // if (newMovies.length > 0) throw new Error("Movie already exist");
        if (findUser[0].role === "admin") {
            newMovies.push(Object.assign({ id: newMovies[newMovies.length - 1].id + 1 }, movies));
        }
        db.movies = newMovies;
        // console.log(newMovies);
        (0, fs_1.WriteFile)(db);
        return res.send("Movie added");
    }
    catch (error) {
        res.send(error.message);
    }
});
router.listen(port, () => {
    console.log(`🐣🐤🐥 [server] : Server is Running at http://localhost:${port}`);
});
