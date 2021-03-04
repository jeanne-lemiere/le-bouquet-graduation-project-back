const Customer = require('../models/customer');

const customerController = {
  customerHandleLoginForm: async (request, response) => {
    try {
            //on cherche à identifier le customer à partir de son email
      const email = request.body.email;
      const customer = await Customer.findOne({
         where: {
           email
                 }
          })

            //si aucun customer touvé avec cet email => message d'erreur
        if (!customer) {
          return response.render('login', {
                    error: 'Email ou mot de passe incorrect'
                });
            }

    
            //le customer avec cet email existe, on vérifie son mot de passe en comparant :
            //- la version en clair saisie dans le formulaire
            //- la version hachée stockée en BDD
            //bcrypt est capable de déterminer si les 2 version du mot de passe correcpondent
            const validPwd = bcrypt.compareSync(request.body.password, customer.password);

            if (!validPwd) {
                //la vérification a échoué, on envoie un message d'erreur
                return response.render('login', {
                    error: 'Email ou mot de passe incorrect'
                });
            }


            //le customer existe et s'est correctement identifié, on stocke les infos qui vont bien dans la session

            request.session.user = {
                firstname: customer.firstname,
                lastname: customer.lastname,
                email: customer.email,
                role: "customer",
            };

            if (request.body.remember) {
                //l'utilisateur a coché la case 'se souvenir de moi'
                //on ajoute une heiure de validité à sa session
                //il peut ainsi quitter son navigateur et revenir sur la page, il devrait rester connecté
                //on indique en date d'expiration la date courante + une heure (en millisecondes)
                request.session.cookie.expires = new Date(Date.now() + 3600000);
            }

            response.redirect('/');
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
            return response.render('signup', {error: 'Un utilisateur avec cet email existe déjà'});
        }
        //on rechecke que l'email a un format valide
        if (!validator.validate(request.body.email)) {
            //le format de l'email est incorrect
            return response.render('signup', {error: 'Le format de l\'email est incorrect'});
        }
        //on checke si le password et la vérif sont bien identiques
        if (request.body.password !== request.body.passwordConfirm) {
            return response.render('signup', {error: 'La confirmation du mot de passe est incorrecte'});
        }
        //on hache le password
        const hashedPwd = bcrypt.hashSync(request.body.password, 10)
        

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
            zipcode: request.body.zipcode
        });
        response.redirect('/login');
    } catch(error) {
        console.log(error);
    }
},
};

module.exports = customerController;