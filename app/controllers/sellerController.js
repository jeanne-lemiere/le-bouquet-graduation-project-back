const Seller = require('../models/seller');
const bcrypt = require('bcrypt');
const validator = require('email-validator');

const sellerController = {
    sellerHandleLoginForm: async (request, response) => {
        try {

            //on cherche à identifier le seller à partir de son email
            const email = request.body.email;
            const seller = await Seller.findOne({
                where: { 
                    email
                            }
                })

                //si aucun seller touvé avec cet email => message d'erreur
                if (!seller) {
                    return response.status(403).json('Email ou mot de passe incorrect')
                }

                console.log("seller.dataValues.password", seller.dataValues.password)
                // the seller with this email exists, let's compare received password with the hashed one in database
                
                //bcrypt est capable de déterminer si les 2 version du mot de passe correspondent
                const validPwd = bcrypt.compareSync(request.body.password, seller.dataValues.password);

                if (!validPwd) {
                    //la vérification a échoué, on envoie un message d'erreur
                    return response.status(403).json('Email ou mot de passe incorrect')
                }

                const { password, passwordConfirm, ...sellerData} = seller.dataValues; // 
                

                //le seller existe et s'est correctement identifié, on envoie les données de l'utilisateur en réponse
                
                response.status(200).json(sellerData);
                //response.redirect('/');
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
            //return response.render('signup', {error: 'Un seller avec cet email existe déjà'});
            return response.status(403).json('Un compte existe déjà avec cet email, veuillez réessayer avec un autre email');
        }
        //on rechecke que l'email a un format valide
        if (!validator.validate(request.body.email)) {
            //le format de l'email est incorrect
            //return response.render('signup', {error: 'Le format de l\'email est incorrect'});
            return response.status(403).json('Le format de l\'email est incorrect'); 
        }
        //on check si le password et la vérif sont bien identiques
        if (request.body.password !== request.body.passwordConfirm) {
            //return response.render('signup', {error: 'La confirmation du mot de passe est incorrecte'});
            return response.status(403).json('La confirmation du mot de passe a échoué');
        }
        //on hache le password
        const hashedPwd = bcrypt.hashSync(request.body.password, 10)
        

        //on inscrit le nouveau seller en BDD
        
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
        //response.redirect('/login');
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

      //console.log("sellers de BIENNNNNNNNNNN",sellers)
      const { password, ...sellerData} = sellers; // ainsi sellerData ne contient pas le password et le confirmPassword

    //   sellers.forEach(element => {
    //     const { password, ...sellerData} = element.dataValues;

    //   });

    //   const newData 

      console.log("SELLERDATA",sellerData[0])
      res.json(sellers);
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
        res.status(200).json(seller);
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