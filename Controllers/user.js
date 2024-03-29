const { response } = require("express");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const image = require("../utils/image");

async function getMe(req, res) {
    const { user_id } = req.user;
    const response = await User.findById(user_id);
    if (!response) {
      res.status(400).send({ msg: "No se ha encontrado usuario" });
    } else {
      res.status(200).send(response);
    }
  }

async function getUsers(req,res){
    const {active} = req.query;
    let response = null;

if(active === undefined){
    response = await User.find();
}else{
    response = await User.find({active})
}
 console.log(response);

    res.status(200).send(response);
}

async function createUser(req,res){
    const {password} = req.body;
    const user = new User({...req.body, active: false});
    const salt = bcrypt.genSaltSync(10);
    const hasPassword = bcrypt.hashSync(password, salt);
    user.password = hasPassword;    

    if(req.files.avatar){
        const imagePath = image.getFilePath(req.files.avatar);
        user.avatar = imagePath
    }

    const saveUser = async (error, userStored) =>{
        try{
            await user.save();
            res.status(201).send({msg: "Usuario Creado",userStored});
        }catch(error){
            res.status(400).send({msg: "Error al crear usuario"});
            console.log("Error");
        }
    }
    saveUser();
}

async function updateUser(req,res){
    const { id } = req.params;
    const userData = req.body; 
    if(userData.password){
        const salt = bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync(userData.password, salt);
        userData.password = hashPassword
    }else{
        delete userData.password;
    }

    if(req.files.avatar){
        const imagePath = image.getFilePath(req.files.avatar)
        userData.avatar = imagePath
    }
    try {
        await User.findByIdAndUpdate({ _id: id }, userData);
        res.status(200).send({ msg: "Actualizacion correcta" });
    } catch (error) {
        res.status(400).send({ msg: "Error al actualizar el usuario" });
    }
 
}

async function deleteUser(req,res){
    const { id } = req.params;
    try{
        const deleteUser = await User.findByIdAndDelete(id);
        if(deleteUser){
            res.status(200).send({msg: "Usuario eliminado"});
        }else{
            res.status(400).send({msg: "Usuario no encontrado"});
        }
    }catch (error){
        res.status(500).send({msg:"Error al eliminar usuario"});
    }
}

module.exports={
    getMe,
    getUsers,
    createUser,
    updateUser,
    deleteUser
}