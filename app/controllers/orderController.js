const { Order, Product, Customer } = require('../models');

//const Product = require('../models/product');

const orderController = {
  getOneOrder: async (req, res) => {
    try {
      console.log('getOneOrder')
      const orderId = req.params.id;
      const order = await Order.findByPk(orderId);
      if (order) {
        res.json(order);
      } else {
        res.status(404).json('Cant find list with id ' + orderId);
      }
    } catch (error) {
      console.trace(error);
      res.status(500).json(error.toString());
    }
  },

  
  getSellerOrders: async (req, res) => {
    try {
        const sellerId = req.params.id;
        const orders = await Order.findAll({ 
            include: [{
                model : Product,
                as: 'products',
                where : {
                    'seller_id' : sellerId
                }
            }]
        })
        if (orders) {
            res.status(200).json(orders)
        }
    } catch (error) {
      console.trace(error);
      res.status(500).json(error.toString());
    }
  },

    getCustomerOrders: async (req, res) => {
        try {
            const customerId = req.params.id;
            const orders = await Order.findAll({
                where : {
                    'customer_id' : customerId
                },
                include: [{  
                    model : Product,
                    as: 'products',
                    
                }]
            })
            if (orders) {
                res.status(200).json(orders)
            }
        } catch (error) {
            console.trace(error);
            res.status(500).json(error.toString());
        }
    }
};

module.exports = orderController;