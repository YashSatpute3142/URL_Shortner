
import mongoose  from "mongoose";

try {
    await mongoose.connect("mongodb://127.0.0.1/mongoose_middleware");
    mongoose.set("debug", true);
} catch (error) {
    console.error(error);
    process.exit();
}

const userSchema = mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    age: {type: Number, required:true, min:5},
    createDat: {type: Date, default: Date.now()},
    updatedAt: {type: Date, default: Date.now()},

})

const User = mongoose.model("user", userSchema);

await User.create({name:"Yash",email:"yash@gmail.com",age:20,})
await mongoose.connection.close();