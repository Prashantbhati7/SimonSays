

if(process.env.NODE_ENV !== "production"){

    require('dotenv').config();
}



const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const User = require("./models/user");
const app = express();
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const flash = require("connect-flash");
const Mongostore  = require('connect-mongo');
app.use(express.urlencoded({ extended: true }));
mongoose.set('strictQuery', true);

const db_url = process.env.ATLASDB_URL;

main()
    .then(() => {
        console.log("connection successful !");
    }).catch((err) => {
        console.log("error", err);
    });

async function main() {
    await mongoose.connect(db_url);
}

const store = Mongostore.create({
    mongoUrl:db_url,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,          //information will update after 24hrs if no change and update occur in session/database 
})

store.on("error",()=>{
    console.log("error in mongo session store",err);
});


app.use(session({
    store:store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    }
}));

app.use(flash()); 


app.use(express.static(path.join(__dirname, "public")));
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));
app.use(passport.initialize());         //middleware to initialize passport at every req should be after express session is defined and in use 
app.use(passport.session()) ;        // to identify the user during the session so that user don't need to log in again and again 
passport.use(new LocalStrategy(User.authenticate()));      // all the user send req must authenticate through LocalStrategy  using method .authenticate()   
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.request= req;
    res.locals.notlogged=req.flash("notlogged");
    next();
})



app.get("/", (req, res) => {
    res.render("home");
})
app.get("/game/:score",async (req,res)=>{
    try{
    if (!req.isAuthenticated()) {
        req.flash("notlogged","you are not logged in ! ");
        return res.redirect("/");
    }
    let currentScore = req.params.score;
    const user = await User.findById(req.user._id);
    //console.log(user);
        if (currentScore > user.score) {
            user.score = currentScore;
            await user.save();
        }

        res.render("gameover",{currentScore});
    }catch(err) {console.log("error",err);}
    });
app.get("/game", (req, res) => {
    res.render("game");
});
app.get("/leaderboard",async (req,res)=>{
    let result = await User.find({})
    .sort({ score: -1 })
    .limit(10)
    ;
    //console.log(result);
    res.render("leaderboard",{result});
    //res.send(result);
})
app.post("/signup", async (req, res) => {
    try {
        let { username, email, password } = req.body;
        let newUser = new User({ username, email});
        const registereduser = await User.register(newUser, password);
        //await newUser.save();                        //no need now as User.register() saves data by itself with hashed pass 
        req.logIn(registereduser, (err) => {
            if (err) {
                next(err);
            }
            else {
                res.redirect("/");
            }
        });
    } catch (err) {
        console.log(err.message);
        res.redirect("/signup");
    }
});


app.get("/login", (req, res) => {
    res.render("login");
})
app.get("/signup", (req, res) => {
    res.render("signup");
})
app.get("/info", (req, res) => {
    res.render("howtoplay");
})
app.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        console.log("Login failed:", info); 
        return res.redirect("/login");
      }
      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.redirect("/");
      });
    })(req, res, next);
  });
app.get("/logout",(req,res)=>{
    req.logOut((err)=>{
        if(err){
            res.send("login failed");
        }
        else{
            res.redirect("/");
        }
    })
})
app.listen(3000, () => {
    console.log("listening to port 3000");
})