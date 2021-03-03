/* Première table : List */

-- On démarre une transaction afin de s'assurer de la cohérence gloabale de la BDD
BEGIN;

-- D'abord on supprime les table 'si elle existe"
DROP TABLE IF EXISTS "customer", "seller", "product", "order", "image", "category", "order_has_product", "product_has_category";


-- après le DROP, aucune chance que les tables existent

-- Ensuite on la (re)crée

-- SERIAL = int auto-incrémenté
-- PRIMARY KEY implique NOT NULL, pas besoin de l'écrire
CREATE TABLE "customer" (
  -- on utilise le nouveau type qui est un standart SQL alors que SERIAL est un pseudo-type de PG
  "id" SERIAL PRIMARY KEY,
  "gender" TEXT NOT NULL,
  "firstname" TEXT NOT NULL,
  "lastname" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "phone_number" TEXT NOT NULL,
  -- Telephone numbers need to be stored as a text/string data type because they often begin with a 0 and if they were stored as an integer then the leading zero would be discounted.
  "street_name" TEXT NOT NULL,
  "street_number" VARCHAR(4),
  "city" TEXT NOT NULL,
  "zipcode" VARCHAR(5),
  -- pour avoir la date et l'heure on utilise le type "timestamp", et pour être le plus précis possible on utilisera plutôt le type "timestampz" qui contient en plus de la date et de l'heure le fuseau horaire défini dans les locales du serveur
  -- pensez à la réunion Meet avec les collègues internationaux
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ
);

CREATE TABLE "seller" (
  -- on utilise le nouveau type qui est un standart SQL alors que SERIAL est un pseudo-type de PG
  "id" SERIAL PRIMARY KEY,
  "gender" TEXT NOT NULL,
  "firstname" TEXT NOT NULL,
  "lastname" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "phone_number" TEXT NOT NULL,
  -- Telephone numbers need to be stored as a text/string data type because they often begin with a 0 and if they were stored as an integer then the leading zero would be discounted.
  "street_name" TEXT NOT NULL,
  "street_number" VARCHAR(5),
  "city" TEXT NOT NULL,
  "zipcode" VARCHAR(5),
  "picture_url" TEXT NOT NULL,
  "siret" CHAR(14),
  "shop_name" TEXT NOT NULL,
  "shop_presentation" TEXT NOT NULL,
  -- contains integers and letters
  -- pour avoir la date et l'heure on utilise le type "timestamp", et pour être le plus précis possible on utilisera plutôt le type "timestampz" qui contient en plus de la date et de l'heure le fuseau horaire défini dans les locales du serveur
  -- pensez à la réunion Meet avec les collègues internationaux
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ
);

CREATE TABLE "category" (
  "id" SERIAL PRIMARY KEY,
  "label" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ
);

CREATE TABLE "product" (
  "id" SERIAL PRIMARY KEY,
  "reference" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "stock" INTEGER NOT NULL,
  "price" FLOAT(5,2) NOT NULL,
  -- FLOAT(M,D) : M pour nombre de chiffres max, D : parmi ces chiffres combien se trouvent après la virgule, 5,2 signifie 3 chiffres avant la virgule, 2 chiffres après la virgule : doc https://dev.mysql.com/doc/refman/8.0/en/floating-point-types.html
  "seller_id" INTEGER NOT NULL REFERENCES seller("id"),
  "category_id" INTEGER NOT NULL REFERENCES category("id"),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ
);


CREATE TABLE "order" (
  "id" SERIAL PRIMARY KEY,
  "reference" TEXT NOT NULL,
  "total_amount" FLOAT(5,2) NOT NULL, 
  "status" TEXT NOT NULL,
  "customer_id" INTEGER NOT NULL REFERENCES customer("id"),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ
);


CREATE TABLE "image" (
  "id" SERIAL PRIMARY KEY,
  "url" TEXT NOT NULL,
  "product_id" INTEGER NOT NULL REFERENCES product("id"),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ
);

CREATE TABLE "order_has_product" (
  "id" SERIAL PRIMARY KEY,
  "order_id" INTEGER NOT NULL REFERENCES order("id"),
  "product_id" INTEGER NOT NULL REFERENCES product("id"),
  "quantity" INTEGER NOT NULL,
  "price" FLOAT(5,2) NOT NULL, 
  -- FLOAT(M,D) : M pour nombre de chiffres max, D : parmi ces chiffres combien sont après la virgule, 5,2 signifie 3 chiffres avant la virgule, 2 chiffres après la virgule
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- ici pas d'updated_at car une relation ne se met pas à jour, soit on l'ajoute soit on la supprime
);



/* une fois les tables crées, on va les remplir */

-- les tables viennent d'être créées, leur serial commencera donc à 1, aucun doute là-dessus

-- je peux me permettre de supposer que les id commenceront à 1 car :
-- les tables existantes sont droppées avant d'être recréées
-- toutes les instructions dans la même transaction donc tout passe ou rien ne passe

INSERT INTO "customer" ("gender", "firstname", "lastname", "email", "password", "phone_number", "street_name", "street_number", "city", "zipcode")
VALUES ('male', 'Jean', 'DelaFontaine', 'jean@gmail.com', 'jeandelafontaine', '0712344556', 'Cessole', '23', 'Paris', '75000' ),
       ('male', 'Leonard', 'Devinci', 'davinci@gmail.com', 'davincode', '0761861314', 'Laguet', '11', 'Bordeaux', '33000' ),
       ('female', 'Clara', 'Watson', 'watson@gmail.com', 'grandgalop', '0661673140', 'Fanny', '2', 'Poitiers', '86000' );


INSERT INTO "seller" ("gender", "firstname", "lastname", "email", "password", "phone_number", "street_name", "street_number", "city", "zipcode", "picture_url", "siret", "shop_name", "shop_presentation")
VALUES ('male', 'Edmond', 'Dantes', 'dantes@gmail.com', 'lepharaon14', '0712344556', 'Cessole', '23', 'Marseilles', '13000', "https://images.freeimages.com/images/small-previews/782/flowers-1363348.jpg", "12345678901234", "TerraSura", "Voici mon humble petite boutique de fleurs, je vends principalement des fleurs d'été." ),
       ('male', 'Albert', 'de Morcerf', 'morcerf@gmail.com', 'venise-italie', '0761861314', 'Laguet', '11', 'Bordeaux', '33000', "https://images.freeimages.com/images/small-previews/a53/flowers-1541944.jpg", "12345678901234", "AgricA", "Bonjour moi c'est Albert, j'aime les fleurs et les sculptures", ),
       ('female', 'Mercedes', 'Herrera', 'mercedes@gmail.com', 'grandgalop', '0661673140', 'Fanny', '2', 'Poitiers', '86000', "https://images.freeimages.com/images/small-previews/0dd/flowers-1394193.jpg", "12345678901234", "MercedesFlowers", "Je m'appelle Mercedes et je fais de l'horticulture", );


INSERT INTO "category" ("label")
VALUES ('Mariage'),
       ('Funérailles'),
       ('Naissance'),
       ("Déclaration d'amour"),
       ('Anniversaire'),
       ('Félicitations');


INSERT INTO "product" ("reference", "name", "description", "stock", "price", "seller_id", "category_id" ) 
VALUES ('00211', "Roses rouges", "Un bouquet de roses rouges pour les déclarations les plus passionnées.", 19, 24.00, 1, 4 ), -- id 1
       ('00212', "Tulipes", "Les tulipes sont des plantes à bulbes appartenant à la grande famille des Liliacées. Le genre Tulipa comprend une centaine d’espèces distribuées en Europe, de l’Asie occidentale à l’Asie centrale et en Afrique du Nord. Ce genre est représenté aussi par des milliers de cultivars et hybrides, sélectionnés depuis qu’elles ont été introduites en Occident par Charles de l’Écluse au 16e siècle.", 3, 16.15, 2, 1 ), -- id 2
       ('00213', "La délicate", "Fleur symbolique du 1er mai, le muguet séduit par ses délicates clochettes blanches. Cette fleur de la famille des Liliacées se trouve communément dans tout l'hémisphère nord. Plusieurs variétés ont été mises au point à partir de l'espèce : 'Albostriata', 'Flore Pleno', etc.", 31, 15.99, 3, 2 ),
       ('00214', "Lis", "Le lys est une plante (liliacée) bulbeuse ornementale des régions tempérées, à grandes fleurs blanches souvent très odorantes. (De nombreux hybrides sont cultivés.) Fleur du lis blanc ; symbole littéraire de la pureté, de la virginité.", 13, 19.99, 1, 3 ),
       ('00215', "Bégonia", "Originaire d'Amérique du sud, le bégonia a été découvert au XVIIe siècle lors d'une expédition menée par Michel Bégon, le gouverneur de Saint-Domingue. Aujourd'hui, cette jolie plante orne aussi bien le jardin que nos intérieurs.", 9, 49.99, 2, 4 ),
       ('00216', "Violettes", "Viola est un genre de plantes herbacées vivaces de la famille des Violaceae. Selon le positionnement des pétales, les espèces sont appelées « violettes » ou « pensées ». Les violettes sont parfois appelées « herbes de la Trinité ». Ces plantes ont un usage principalement ornemental.", 12, 42.99, 3, 5 ),
       ('00217', "Chrysanthèmes", "Fleur d'automne, le chrysanthème est majoritairement utilisé pour fleurir les cimetières à la Toussaint. Dans les pays dont il est originaire comme le Japon, il revêt au contraire une symbolique positive et représente la joie et le bonheur. Il est même devenu le symbole de la Chine.", 7, 29.99, 1, 2 ),
       ('00224', "Le printemps", "Les tulipes sont des plantes à bulbes appartenant à la grande famille des Liliacées. Le genre Tulipa comprend une centaine d’espèces distribuées en Europe, de l’Asie occidentale à l’Asie centrale et en Afrique du Nord. Ce genre est représenté aussi par des milliers de cultivars et hybrides, sélectionnés depuis qu’elles ont été introduites en Occident par Charles de l’Écluse au 16e siècle.", 3, 17.99, 1, 1 );
       ('00219', "Anthémis", "Originaire des Iles Canaries, l'anthémis appartient à la famille des Astéracées. Il se reconnaît à ses petites fleurs aux allures de marguerite de couleurs blanche, jaune, rose ou rouge selon les variétés.", 3, 37.20, 3, 2 ),
       ('00220', "Camomille", "Très odorante, la camomille romaine (Chamaemelum nobile), appelée aussi camomille noble ou officinale, fait partie des classiques en herboristerie. Originaire d'Europe du Sud et cultivée depuis l'Antiquité, cette plante rampante rustique à fleurs simples donne de jolis pétales blancs et un cœur jaune, les capitules, pareils à des marguerites.", 112, 42.99, 1, 3 ),
       ('00221', "Romance", "Pour les déclarations romantiques, les roses roses sont les plus appropriées. Le rose symbolise la féminité, le raffinement et la tendresse.", 19, 24, 1, 4 ),
       ('00222', "Roses blanches", "Les roses blanches, aussi appelées roses nuptiales, expriment l’humilité et le respect, parfaites pour les mariages", 19, 36.90, 1, 1 ),
       ('00223', "La félicité", "Les roses jaunes expriment la joie grâce à leur couleur gaie, idéales pour les anniversaires ou pour les joyeuses occasions", 19, 32.75, 1, 5 );
       

INSERT INTO "order" ("reference", "total_amount", "status", "customer_id" )
VALUES ('21001', 'total_amount', 'En préparation avant livraison', 1 ), -- id 1
       ('21002', 'total_amount', 'En livraison', 1 ),
       ('21003', 'total_amount', 'Livrée', 3 ),
       ('21004', 'total_amount', 'Livrée', 2 ),
       ('21005', 'total_amount', 'Livrée', 1 ),
       ('21006', 'total_amount', 'Livrée', 1 );

-- A FINIR LES TOTAL_AMOUNT



INSERT INTO "image" ("url", "product_id")
VALUES ('https://cdn.pixabay.com/photo/2017/08/07/19/38/red-2607058__340.jpg', 1), -- id 1
       ('https://cdn.pixabay.com/photo/2019/03/09/23/17/roses-4045211__340.jpg', 1), -- id 2

       ('https://cdn.pixabay.com/photo/2017/05/18/12/00/tulips-2323461__340.png', 2),
       ('https://cdn.pixabay.com/photo/2020/12/06/17/03/tulips-5809413__340.jpg', 2),

       ('https://cdn.pixabay.com/photo/2019/05/03/13/19/lily-of-the-valley-4175855_960_720.jpg', 3),
       ('https://cdn.pixabay.com/photo/2020/04/23/19/36/lily-of-the-valley-5083800_960_720.jpg', 3),

       ('https://cdn.pixabay.com/photo/2017/02/06/22/53/lily-2044517_960_720.jpg', 4),
       ('https://cdn.pixabay.com/photo/2018/06/15/19/08/lilies-3477474__340.jpg', 4),

       ('https://cdn.pixabay.com/photo/2020/05/20/17/41/begonia-5197522_960_720.jpg', 5),
       ('https://cdn.pixabay.com/photo/2017/09/01/09/21/begonias-2703511_960_720.jpg', 5),

       ('https://monjardinmamaison.maison-travaux.fr/wp-content/uploads/sites/8/2019/06/gettyimages-186834494-615x410.jpg', 6),
       ('https://monjardinmamaison.maison-travaux.fr/wp-content/uploads/sites/8/2019/06/gettyimages-939715730-1-615x410.jpg', 6),

       ('https://cdn.pixabay.com/photo/2011/10/24/17/40/flowers-10201_960_720.jpg', 7),
       ('https://cdn.pixabay.com/photo/2013/10/29/18/20/flower-202483_960_720.jpg', 7),

       ('https://cdn.pixabay.com/photo/2016/03/01/13/30/tulip-1230391_960_720.jpg', 8),
       ('https://cdn.pixabay.com/photo/2016/03/01/14/43/tulip-1230492_960_720.jpg', 8),
       ('https://cdn.pixabay.com/photo/2016/03/02/10/39/tulip-1232068_960_720.jpg', 8);

       ('https://cdn.pixabay.com/photo/2020/07/28/09/18/chamomile-5444476_960_720.jpg', 9),
       ('https://cdn.pixabay.com/photo/2015/07/15/16/31/anthemis-arvensis-846594_960_720.jpg', 9),

       ('https://cdn.pixabay.com/photo/2021/01/11/23/10/chamomile-5909952_960_720.jpg', 10),
       ('https://cdn.pixabay.com/photo/2019/05/17/00/13/meadows-4208643_960_720.jpg', 10),

       ('https://images.unsplash.com/photo-1581193782989-6ca04e80e19c?ixid=MXwxMjA3fDB8MHxwaG90by1yZWxhdGVkfDV8fHxlbnwwfHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 11)
       ('https://pixabay.com/fr/photos/bouquet-fleurs-roses-142876/', 11),
       ('https://cdn.pixabay.com/photo/2016/08/03/14/24/roses-1566792_960_720.jpg', 11),

       ('https://images.unsplash.com/photo-1575119437835-e574de972888?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=633&q=80', 12),
       ('https://images.unsplash.com/photo-1565597979721-77dee196b03d?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80', 12),

       ('https://images.unsplash.com/photo-1583238941443-af9c8d745b4a?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=1350&q=80', 13),
       ('https://images.unsplash.com/photo-1583238932590-a9e8156b100c?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80', 13);

       




INSERT INTO "order_has_product" ("order_id", "product_id", "quantity", "price_per_unit")
VALUES (1, 1, 2, 24.00),
       (1, 2, 1, 16.15),
       (1, 3, 3, 15.99),
       (2, 5, 1, 49.99),
       (2, 1, 1, 24.00),
       (3, 12, 1, 36.90),
       (4, 5, 1, 49.99),



INSERT INTO "card" ("content", "color", "list_id")
VALUES ('Carte 1', '#FF00FF', 1), -- id 1
       ('2ème carte', '#c1e7ff', 1); -- id 2

INSERT INTO "tag" ("name", "color")
VALUES ('Urgent', '#F00'); -- id 1

-- et on oublie pas la table de liaison !
INSERT INTO "card_has_tag" ("card_id", "tag_id")
VALUES (1,1); -- Carte 1, Urgent

COMMIT;