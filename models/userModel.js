const { default: mongoose } = require("mongoose");

const UserSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email:{
        type: String,
        
    },
    password:{
        type: String,
        
    },
    photoURL:{
        type: String,
        default: 'https://static.vecteezy.com/system/resources/previews/024/983/914/original/simple-user-default-icon-free-png.png'
    },
    createdAt:{
        type: Date,
        default: Date.now()
    },
    updatedAt:{
        type: Date,
        default: Date.now()
    },
    role:{
        type: String,
        default: 'user'
    },
    
    
})

const UserModel = mongoose.model('users', UserSchema);
module.exports = UserModel;