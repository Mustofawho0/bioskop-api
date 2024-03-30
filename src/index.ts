import express, { Express, Request, Response } from "express";
import { ReadFile, WriteFile } from "./utils/fs";
import { IRegister, IRegisterJSON } from "./type";

const router: Express = express();
router.use(express.json());
const port = 5000;

router.post("/register", (req: Request, res: Response) => {
  try {
    const register: IRegister = req.body;
    const db = ReadFile();
    const registerUser: IRegisterJSON[] = db.users;
    const uid = Date.now();
    // if (register.username.length) throw new Error("Username udah ada");
    const findUser: IRegisterJSON[] = registerUser.filter(
      (user: IRegister) =>
        user.username === register.username || user.email === register.email
    );
    if (findUser.length > 0) throw new Error("Username/Email udah ada");
    registerUser.push({
      uid,
      ...register,
    });
    db.users = registerUser;
    console.log(registerUser);
    WriteFile(db);
    return res.send({
      uid,
      username: register.username,
      email: register.email,
    });
  } catch (error: any) {
    res.send(error.message);
  }
});

router.post("/auth", (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const db = ReadFile();
    const loginUser: IRegisterJSON[] = db.users;

    const findUser: IRegisterJSON[] = loginUser.filter(
      (user: IRegister) =>
        (user.username === username || user.email === username) &&
        user.password === password
    );

    if (findUser.length === 0) throw new Error("Username/Password wrong");
    return res.send({
      uid: findUser[0].uid,
      username: findUser[0].username,
      role: findUser[0].role,
    });
  } catch (error: any) {
    res.send(error.message);
  }
});

router.get("/movies", (req: Request, res: Response) => {
  try {
    const { status, time, date } = req.query;
    const db = ReadFile();
    const movies: any[] = db.movies;
    const transactions: any[] = db.transactions;

    let findMovies = movies.map((movie) => {
      const movieSelected = {
        ...movie,
        seatAvailable: movie.total_seat,
      };
      transactions.map((transaction) => {
        if (
          movie.id === transaction.moviesId &&
          transaction.date === date &&
          transaction.time === time
        ) {
          movieSelected.seatAvailable -= transaction.total_seat;
        }
      });
      if (date && time) return movieSelected;
      return { ...movie };
    });
    if (status) {
      findMovies = findMovies.filter(
        (movie) => movie.status === status.replace("%", "")
      );
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/transactions", (req: Request, res: Response) => {
  try {
    // const userid = req.headers.userid
    const { userid } = req.headers as { userid: string };
    const {
      moviesId,
      time,
      total_seat,
      date,
    }: {
      moviesId: number;
      time: string;
      total_seat: number;
      date: string;
    } = req.body;

    const db = ReadFile();
    const users: IRegisterJSON[] = db.users;
    const movies: any[] = db.movies;
    const transactions: any[] = db.transactions;

    const findUser = users.find((user) => user.uid === Number(userid));
    // console.log(findUser);
    if (!findUser) throw new Error(`User ${userid} not Found!`);
    const findMovie = movies.filter(
      (movie) =>
        movie.id === moviesId &&
        movie.show_times.includes(time) &&
        movie.release_date < date
    );
    // console.log(findMovie)
    if (findMovie.length === 0) throw new Error("Movie not Found!");

    let bookSeat = 0;
    transactions.map((transaction) => {
      if (
        transaction.moviesId === moviesId &&
        transaction.time === time &&
        transaction.date === date
      )
        bookSeat += transaction.total_seat;
    });
    let availableSeat = findMovie[0].total_seat - bookSeat;
    if (availableSeat < total_seat) throw new Error("Not enough seat");

    const isWeekend =
      new Date(date).getDay() === 0 || new Date(date).getDay() === 6
        ? true
        : false;

    let totalPrice = 0;
    if (isWeekend) {
      totalPrice = findMovie[0].price[0].weekend * Number(total_seat);
    } else {
      totalPrice = findMovie[0].price[0].weekdays * Number(total_seat);
    }

    transactions.push({
      uid: userid,
      name: findMovie[0].name,
      genre: findMovie[0].genre,
      ...req.body,
      price: totalPrice,
    });
    WriteFile(db);
    res.send({
      ...req.body,
      price: totalPrice,
    });
  } catch (error: any) {
    res.send(error.message);
  }
});

router.post("/admin/movies", (req: Request, res: Response) => {
  try {
    const { userid } = req.headers as { userid: string };

    const movies = req.body;
    const db = ReadFile();
    const newMovies = db.movies;
    const users: IRegisterJSON[] = db.users;

    const findUser = users.filter((user) => user.uid === Number(userid));

    if (findUser[0].role !== "admin") throw new Error("You're not Admin");

    // // if (newMovies.length > 0) throw new Error("Movie already exist");
    if (findUser[0].role === "admin") {
      newMovies.push({
        id: newMovies[newMovies.length - 1].id + 1,
        ...movies,
      });
    }
    db.movies = newMovies;
    // console.log(newMovies);
    WriteFile(db);
    return res.send("Movie added");
  } catch (error: any) {
    res.send(error.message);
  }
});

router.listen(port, () => {
  console.log(
    `🐣🐤🐥 [server] : Server is Running at http://localhost:${port}`
  );
});
