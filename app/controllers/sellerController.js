const {Seller} = require('../models');
const bcrypt = require('bcrypt');
const validator = require('email-validator');
const jsonwebtoken = require('jsonwebtoken')
const jwtSecret = process.env.JWT_SECRET;
// const { Op } = require('sequelize');

const sellerController = {
    sellerHandleLoginForm: async (request, response) => {
        try {
            // on cherche à identifier le seller à partir de son email
            // we are trying to identify a seller from his password
            const email = request.body.email;

            if (!validator.validate(email)) {
                // the email given has not valid format 
                return response.status(403).json('Le format de l\'email est incorrect'); 
            }

            const seller = await Seller.findOne({
                where: { 
                    email
                },
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

            //const { password, ...sellerData} = seller.dataValues; // like this, we remove password from object that we'll send because it is sensitive data
            
            // this seller exists and identified himself, we send him his data (witout password)
            const updatedSeller = await Seller.findOne({
                where: { 
                    email
                },
                attributes: { exclude: ['password'] } // we don't want the password to be seen in the object we will send
      
            })

            const jwtContent = { userId: updatedSeller.id, role: "seller" };
            const jwtOptions = { 
              algorithm: 'HS256', 
              expiresIn: '3h' 
            };
            console.log('<< 200', updatedSeller.email);
            response.json({ 
              logged: true, 
              role: "seller",
              user: updatedSeller,
              token: jsonwebtoken.sign(jwtContent, jwtSecret, jwtOptions),
            });

            
            //response.status(200).json(updatedSeller);
            
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
        //on checke que l'email a un format valide
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
        
        response.status(200).json('success');
    } catch(error) {
        console.log(error);
    }
},


    getAllSellers: async (req, res) => {
    try {
      const sellers = await Seller.findAll({ 
        attributes: { exclude: ['password'] } // we don't want the password to be seen in the object we will send
      });

      if (!sellers) {
        return res.status(404).json('Cant find sellers');
      }
      
      res.json(sellers);

    } catch (error) {
      console.trace(error);
      res.status(500).json(error.toString());
    }
  },

  getOneSeller: async (req, res) => {
    try {
      const sellerId = req.params.id;
      const seller = await Seller.findByPk(sellerId, {
        attributes: { exclude: ['password'] } // we don't want the password to be seen in the object we will send    
      });
      
      if (seller) {  
        res.status(200).json(seller);
      
    } else {
        res.status(404).json('Cant find seller with id ' + sellerId);
      }
    } catch (error) {
      console.trace(error);
      res.status(500).json(error.toString());
    }
  },

  editSellerProfile: async (req, res) => {
    try {
        const sellerId = req.params.id;

        console.log("req.user", req.user)
        console.log("req.user.userId", req.user.userId)
        if (sellerId != req.user.userId || req.user.role !== 'seller') {
          return res.status(401).json('You have no right to edit seller :' + sellerId);
        }

        const { email, password, passwordConfirm } = req.body;
   
        let seller = await Seller.findByPk(sellerId);
        if (!seller) {
          res.status(404).json(`Cant find seller with id ${sellerId}`);
        } else {

            if (email) {
                //on checke que l'email a un format valide
                if (!validator.validate(req.body.email)) {
                    // the email given has not valid format 
                    return res.status(403).json('Le format de l\'email est incorrect'); 
                }
                const sellerExists = await Seller.findOne({
                    where: {
                        email: email,
                    }
                });

                if (sellerExists) {
                    // il y a déjà un seller avec cet email, on envoie une erreur
                    // there is already a seller with this email => error
                    return res.status(403).json('Un compte existe déjà avec cet email, veuillez réessayer avec un autre email');
                }
            } 
            // if we get here, it means that email format is valid and no other seller has this email


            // on ne change que les paramètres envoyés
            // we patch with received data only
            for(const element in req.body) {
                //console.log(element)
                if (seller[element] && element!= 'password') { // we check that req.body doesn't contain anything unwanted, so it CAN'T contain properties that seller does not have (except passwordConfirm). We don't 
                    seller[element] = req.body[element] // instead of having 14 conditions like ` if (email) { seller.email = email } ` this will do all the work in 2 lines
                    //console.log("OK pour : "+element)
                } else {
                    //console.log(element+" n'est pas une propriété attendue ici")
                }
            }

            if (password) {
                if (password != passwordConfirm) {
                    return res.status(403).json('La confirmation du mot de passe a échoué');
                }

                const hashedPwd = bcrypt.hashSync(req.body.password, 10)
                seller.password = hashedPwd;
            }

            // other way to do this :
            //     if (firstname) {
            //        seller.firstname = firstname;
            //     }
            //     if (lastname) {
            //        seller.lastname = lastname;
            //     }
            

          await seller.save();
          
          const updatedSeller = await Seller.findByPk(sellerId, {
            attributes: { exclude: ['password'] } // we don't want the password to be seen in the object we will send 
          });

          res.json(updatedSeller);
        }
    } catch (error) {
      console.trace(error);
      res.status(500).json(error.toString());
    }
  },
};

module.exports = sellerController;


