"use strict"
/* -------------------------------------------------------
    EXPRESS - Personnel API
------------------------------------------------------- */

const Personnel = require('../models/personnel.model')
const Token = require('../models/token.model')
const passwordEncrypt = require('../helpers/passwordEncrypt')

module.exports = {

    // LOGIN & LOGOUT

    login: async (req, res) => {

        /*
            #swagger.tags = ['Authentication']
            #swagger.summary = 'Login'
            #swagger.description = 'Login with username and password'
            #swagger.parameters['body'] = {
                in: 'body',
                required: 'true',
                schema: {
                    username: 'testF0',
                    password:'1234'            
                }
            }
        */
        

        const { username, password } = req.body

        if (username && password) {

            //? findOne, passwordu modeldeki set metodundaki encrypt i kullanarak db'de filtreleme yapar
            const user = await Personnel.findOne({ username, password })
            if (user && user.isActive) {

                /* TOKEN */

                // Token var mı?
                let tokenData = await Token.findOne({ userId: user._id })

                // Eğer token yoksa oluştur:
                if (!tokenData) {
                    const tokenKey = passwordEncrypt(user._id + Date.now())
                    // console.log(typeof tokenKey, tokenKey)
                    tokenData = await Token.create({ userId: user._id, token: tokenKey })
                }
                
                /* TOKEN */

                res.status(200).send({
                    error: false,
                    token: tokenData.token,
                    user
                })

            } else {
                res.errorStatusCode = 401
                throw new Error('Wrong Username or Password.')
            }
        } else {
            res.errorStatusCode = 401
            throw new Error('Please enter username and password.')
        }
    },

    logout: async (req, res) => {
        /*
            #swagger.tags = ['Authentication']
            #swagger.summary = 'Logout'
            #swagger.description = 'Delete Token'
        */
        /* SESSION */
        // Set session to null:
        req.session = null
        /* SESSION */

        /* TOKEN */

        //* 1. Yöntem (Kısa yöntem)
        //? Her kullanıcı için sadece 1 adet token var ise (tüm cihazlardan çıkış yap):

        // console.log(req.user)
        // const deleted = await Token.deleteOne({ userId: req.user._id })

        //* 2. Yöntem:
        //? Her kullanıcı için 1'den fazla token var ise (çoklu cihaz):

        const auth = req.headers?.authorization || null // Token ...tokenKey...
        const tokenKey = auth ? auth.split(' ') : null // ['Token', '...tokenKey...']
    
        let deleted = null
        if (tokenKey && tokenKey[0]=='Token') {
            deleted = await Token.deleteOne({ token: tokenKey[1] })
        
        }  
        /* TOKEN */

        res.status(200).send({
            error: false,
            // message: 'Logout: Sessions Deleted.',
            message: 'Logout: Token Deleted.',
            deleted
        })
          
    },
}