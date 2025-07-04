
const mongoose= require("mongoose");
const { required } = require("nodemon/lib/config");
const passpostLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema({
    // name:{
    //     type:String,        //passportlocalmongoose define usernmae and password automatically along with hashed and salt password 
 
    //     required:true,
    // },
    email:{
        type:String,
        required:true,
    },
    score:{
        type:Number,
        default:0,
    }
    // password:{
    //     type:string,
    //     required:true,
    // },
});
userSchema.plugin(passpostLocalMongoose)
const User = mongoose.model("User",userSchema);
module.exports = User;