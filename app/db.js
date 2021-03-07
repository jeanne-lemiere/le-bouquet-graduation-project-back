const {Sequelize} = require('sequelize');

const sequelize = new Sequelize(process.env.PG_URL,{
    define: {
        underscored: true, // faire correspondre automatiquement camelCase <-> snake_case, si on ne l'écrit pas, sequelize attend une colonne createdAt alors que la colonne se nomme created_at
        timestamps: true // aucun rapport avec le type TIMESTAMPTZ qu'on a choisi dans la BDD
        // timestamps: true précise à Sequelize qu'il trouvera des champs de traçabilité dans les tables
        // par défaut, les champs doivent s'appeler created_at et updated_at
        // si vous voulez les appeler Michel et Augustin, il faudra préciser
        // createdAt: 'Michel'
        // updatedAt: 'Augustin'
    },
});

module.exports = sequelize;