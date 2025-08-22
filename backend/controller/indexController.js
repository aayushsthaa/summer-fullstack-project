function verifyUserController (req, res) {
    const user = req.user;
    if(user){
        res.status(200).json({
            message: "User is Authenticated",
        })
    }else{
        res.status(401).json({
            message: "User is not Authenticated",
        })
    }
}

module.exports = {
    verifyUserController,
};
