const Seller = require('../models/seller');
const bcrypt = require('bcrypt');
const validator = require('email-validator');

const sellerController = {
    sellerHandleLoginForm: async (request, response) => {
        try {

            // on cherche à identifier le seller à partir de son email
            // we are trying to identify a seller from his password
            const email = request.body.email;
            const seller = await Seller.findOne({
                where: { 
                    email
                            }
                })

                // if no seller found with this email => error
                if (!seller) {
                    return response.status(403).json('Email ou mot de passe incorrect')
                }

                
                // the seller with this email exists, let's compare received password with the hashed one in database
                
                // bcrypt can check if 2 passwords are the same, the password entered by user and the one in database 
                const validPwd = bcrypt.compareSync(request.body.password, seller.dataValues.password);

                if (!validPwd) {
                    // password is not correct, we send an error
                    return response.status(403).json('Email ou mot de passe incorrect')
                }

                const { password, ...sellerData} = seller.dataValues; // like this, we remove password from object that we'll send because it is sensitive data
                
                // this seller exists and identified himself, we send him his data (witout password)
                response.status(200).json(sellerData);
                
            } catch (error) {
                    console.log(error);
            }

    },


   sellerHandleSignupForm: async (request, response) => {
    try {

        //on checke si un utilisateur existe déjà avec cet email
        const seller = await Seller.findOne({
            where: {
                email: request.body.email
            }
        });

        if (seller) {
            //il y a déjà un utilisateur avec cet email, on envoie une erreur
            // there is already a seller with this email
            
            return response.status(403).json('Un compte existe déjà avec cet email, veuillez réessayer avec un autre email');
        }
        //on rechecke que l'email a un format valide
        if (!validator.validate(request.body.email)) {
            // the email given has not valid format 
            return response.status(403).json('Le format de l\'email est incorrect'); 
        }
        // let's check that password and password-confirmation are the same
        if (request.body.password !== request.body.passwordConfirm) {
            // they are not the same;
            return response.status(403).json('La confirmation du mot de passe a échoué');
        }
        // we hash password
        const hashedPwd = bcrypt.hashSync(request.body.password, 10)
        

        // we add the new seller in database
        
        await Seller.create({
            gender: request.body.gender,
            email: request.body.email,
            password: hashedPwd,
            lastname: request.body.lastname,
            firstname: request.body.firstname,
            phone_number: request.body.phone_number,
            street_name: request.body.street_name,
            street_number: request.body.street_number,
            city: request.body.city,
            zipcode: request.body.zipcode,
            picture_url: request.body.picture_url,
            siret: request.body.siret,
            shop_name: request.body.shop_name,
            shop_presentation: request.body.shop_presentation
        });
        
        response.status(200).json('Votre compte a bien été créé');
    } catch(error) {
        console.log(error);
    }
},


    getAllSellers: async (req, res) => {
    try {
      const sellers = await Seller.findAll({     
        raw: true
      });

      if (!sellers) {
        return res.status(404).json('Cant find sellers');
      }
      const sellersData = []
      sellers.forEach(element => {
        const { password, ...sellerData} = element; // like this, we remove passwords from object that we'll send because it is sensitive data
        sellersData.push(sellerData)
      });
      
      res.json(sellersData);

    } catch (error) {
      console.trace(error);
      res.status(500).json(error.toString());
    }
  },

  getOneSeller: async (req, res) => {
    try {
      const sellerId = req.params.id;
      const seller = await Seller.findByPk(sellerId);
      
      if (seller) {
        
        const { password, ...sellerData} = seller.dataValues; // like this, we remove password from object that we'll send because it is sensitive data
        
        res.status(200).json(sellerData);
      } else {
        res.status(404).json('Cant find seller with id ' + sellerId);
      }
    } catch (error) {
      console.trace(error);
      res.status(500).json(error.toString());
    }
  },
};

module.exports = sellerController;