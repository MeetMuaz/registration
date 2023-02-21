module.exports = function(app) {

    // get user controller
    let userController = require('../controller/user');


    /**
     * 
     * USER ROUTES
     * 
     */
    app.route('/user/login')
        .post(userController.userLogin);

    app.route('/user/register')
        .post(userController.userRegister);    

};
