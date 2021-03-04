const Customer = require("../models/customer");
const bcrypt = require("bcrypt");
const validator = require("email-validator");

const customerController = {
  customerHandleLoginForm: async (request, response) => {
    try {
      //on cherche à identifier le customer à partir de son email
      const email = request.body.email;
      const customer = await Customer.findOne({
        where: {
          email,
        },
      });

      //si aucun customer touvé avec cet email => message d'erreur
      if (!customer) {
        return response.status(403).json("Email ou mot de passe incorrect");
      }

      //le customer avec cet email existe, on vérifie son mot de passe en comparant :
      //- la version en clair saisie dans le formulaire
      //- la version hachée stockée en BDD
      //bcrypt est capable de déterminer si les 2 version du mot de passe correcpondent
      const validPwd = bcrypt.compareSync(
        request.body.password,
        customer.password
      );

      if (!validPwd) {
        //la vérification a échoué, on envoie un message d'erreur
        return response.status(403).json("Email ou mot de passe incorrect");
      }

      const { password, ...customerData } = customer.dataValues;

      //le customer existe et s'est correctement identifié, on envoie les données de l'utilisateur en réponse

      response.status(200).json(customerData);
    } catch (error) {
      console.log(error);
    }
  },

  customerHandleSignupForm: async (request, response) => {
    try {
      //on checke si un utilisateur existe déjà avec cet email
      const customer = await Customer.findOne({
        where: {
          email: request.body.email,
        },
      });
      if (customer) {
        //il y a déjà un utilisateur avec cet email, on envoie une erreur
        return response
          .status(403)
          .json(
            "Un compte existe déjà avec cet email, veuillez réessayer avec un autre email"
          );
      }
      //on rechecke que l'email a un format valide
      if (!validator.validate(request.body.email)) {
        //le format de l'email est incorrect
        return response.status(403).json("Le format de l'email est incorrect");
      }
      //on checke si le password et la vérif sont bien identiques
      if (request.body.password !== request.body.passwordConfirm) {
        return response
          .status(403)
          .json("La confirmation du mot de passe a échoué");
      }
      //on hache le password
      const hashedPwd = bcrypt.hashSync(request.body.password, 10);

      //on inscrit le nouveau customer en BDD

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
        zipcode: request.body.zipcode,
      });

      response.status(200).json("Votre compte a bien été créé");
    } catch (error) {
      console.log(error);
    }
  },
  getOneCustomer: async (req, res) => {
    try {
      const customerId = req.params.id;
      const customer = await Customer.findByPk(customerId);

      if (customer) {
        const { password, ...customerData } = customer.dataValues; // like this, we remove password from object that we'll send because it is sensitive data

        res.status(200).json(customerData);
      } else {
        res.status(404).json("Cant find customer with id " + customerId);
      }
    } catch (error) {
      console.trace(error);
      res.status(500).json(error.toString());
    }
  },
};

module.exports = customerController;
