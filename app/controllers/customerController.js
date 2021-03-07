const { Customer } = require('../models');
const bcrypt = require('bcrypt');
const validator = require('email-validator');
const jsonwebtoken = require('jsonwebtoken')
const jwtSecret = process.env.JWT_SECRET;

const customerController = {
    customerHandleLoginForm: async (request, response) => {
      
        try {
            // on cherche à identifier le customer à partir de son email
            // we are trying to identify a customer from his password
            const email = request.body.email;

            if (!validator.validate(email)) {
                // the email given has not valid format 
                return response.status(403).json('Le format de l\'email est incorrect'); 
            }
            
            const customer = await Customer.findOne({
                where: { 
                    email
                },
            })
                
            // if no customer found with this email => error
            if (!customer) {
                return response.status(403).json('Email ou mot de passe incorrect')
            }
  
            // the customer with this email exists, let's compare received password with the hashed one in database
            
            // bcrypt can check if 2 passwords are the same, the password entered by user and the one in database 
            const validPwd = bcrypt.compareSync(request.body.password, customer.dataValues.password);

            if (!validPwd) {
                // password is not correct, we send an error
                return response.status(403).json('Email ou mot de passe incorrect')
            }
            
            // this customer exists and identified himself, we send him his data (witout password)
            const updatedCustomer = await Customer.findOne({
                where: { 
                    email
                },
                attributes: { exclude: ['password'] } // we don't want the password to be seen in the object we will send
            })

            console.log("updatedCustomer.id :"+updatedCustomer.id)
            console.log("updatedCustomer : ", updatedCustomer)
            
            // ---- JWT

            const jwtContent = { userId: updatedCustomer.id, role: "customer" };
            const jwtOptions = { 
              algorithm: 'HS256', 
              expiresIn: '3h' 
            };
            console.log('<< 200', updatedCustomer.email);
            response.json({ 
              logged: true, 
              role: "customer",
              user: updatedCustomer,
              token: jsonwebtoken.sign(jwtContent, jwtSecret, jwtOptions),
            });

            // ---- /JWT
            
            //response.status(200).json(updatedCustomer);
            
        } catch (error) {
                    console.log(error);
        }

    },


   customerHandleSignupForm: async (request, response) => {
    try {

        //on checke si un utilisateur existe déjà avec cet email
        const customer = await Customer.findOne({
            where: {
                email: request.body.email
            }
        });

        if (customer) {
            //il y a déjà un utilisateur avec cet email, on envoie une erreur
            // there is already a customer with this email  
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
        

        // we add the new customer in database
        
        await Customer.create({
            gender: request.body.gender,
            email: request.body.email,
            password: hashedPwd,
            lastname: request.body.lastname,
            firstname: request.body.firstname,
            phone_number: request.body.phone_number,
            street_name: request.body.street_name,
            street_number: request.body.street_number,
            city: request.body.city,
            zipcode: request.body.zipcode
        });
        
        response.status(200).json('success');
    } catch(error) {
        console.log(error);
    }
},


    getAllCustomers: async (req, res) => {
    try {
      const customers = await Customer.findAll({ 
        attributes: { exclude: ['password'] } // we don't want the password to be seen in the object we will send
      });

      if (!customers) {
        return res.status(404).json('Cant find customers');
      }
      
      res.json(customers);

    } catch (error) {
      console.trace(error);
      res.status(500).json(error.toString());
    }
  },

  getOneCustomer: async (req, res) => {
    try {
      const customerId = req.params.id;
      
      const customer = await Customer.findByPk(customerId, {
        attributes: { exclude: ['password'] } // we don't want the password to be seen in the object we will send    
      });
      
      if (customer) {  
        res.status(200).json(customer);
      
    } else {
        res.status(404).json('Cant find customer with id ' + customerId);
      }
    } catch (error) {
      console.trace(error);
      res.status(500).json(error.toString());
    }
  },

  editCustomerProfile: async (req, res) => {
    try {
        const customerId = req.params.id;

        console.log("req.user", req.user)

        if (customerId != req.user.userId || req.user.role !== 'customer') {
          return res.status(401).json('You have no right to edit customer :' + customerId);
        }

        const { email, password, passwordConfirm } = req.body;
   
        let customer = await Customer.findByPk(customerId);
        if (!customer) {
          res.status(404).json(`Cant find customer with id ${customerId}`);
        } else {

            if (email) {
                //on checke que l'email a un format valide
                if (!validator.validate(req.body.email)) {
                    // the email given has not valid format 
                    return res.status(403).json('Le format de l\'email est incorrect'); 
                }
                const customerExists = await Customer.findOne({
                    where: {
                        email: email,
                    }
                });

                if (customerExists) {
                    // il y a déjà un customer avec cet email, on envoie une erreur
                    // there is already a customer with this email => error
                    return res.status(403).json('Un compte existe déjà avec cet email, veuillez réessayer avec un autre email');
                }
            } 
            // if we get here, it means that email format is valid and no other customer has this email


            // on ne change que les paramètres envoyés
            // we patch with received data only
            for(const element in req.body) {
                //console.log(element)
                if (customer[element] && element!= 'password') { // we check that req.body doesn't contain anything unwanted, so it CAN'T contain properties that customer does not have (except passwordConfirm). We don't 
                    customer[element] = req.body[element] // instead of having 14 conditions like ` if (email) { customer.email = email } ` this will do all the work in 2 lines
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
                customer.password = hashedPwd;
            }

            // other way to do this :
            //     if (firstname) {
            //        customer.firstname = firstname;
            //     }
            //     if (lastname) {
            //        customer.lastname = lastname;
            //     }
            

          await customer.save();
          
          const updatedCustomer = await Customer.findByPk(customerId, {
            attributes: { exclude: ['password'] } // we don't want the password to be seen in the object we will send 
          });

          res.json(updatedCustomer);
        }
    } catch (error) {
      console.trace(error);
      res.status(500).json(error.toString());
    }
  },
};

module.exports = customerController;